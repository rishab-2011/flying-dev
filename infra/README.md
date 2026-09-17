# Running Flying Dev on AWS

ECS Fargate behind an Application Load Balancer, with a Datadog Agent running
beside the app. The database stays on Neon.

Deploys are automatic: push to `main` and `.github/workflows/deploy.yml` builds
the image, pushes it to ECR and rolls the service. There are **no AWS keys in
GitHub** — the workflow uses OIDC, so AWS issues credentials that expire when
the job ends and there is nothing stored to leak or rotate.

```
push to main
   │
   ├─ build image ──────────────► ECR (tagged with the commit sha)
   │
   └─ register task definition ─► ECS Fargate service
                                     ├── app            (Next.js standalone)
                                     └── datadog-agent  (APM traces)
                                              ▲
                              ALB ── /api/health ┘ ── HTTPS via ACM
```

Everything below is run **once**. Use `ap-south-1` (Mumbai): it is the closest
region to Delhi NCR, and for a page a customer loads on mobile data the round
trip is the part they feel.

> **Planning to take this down again?** Read [Turning it off](#turning-it-off)
> first. The load balancer bills by the hour whether or not anyone visits, and
> a teardown you only think about afterwards is how a finished experiment keeps
> charging.

> Nothing in this file should ever be pasted into a chat window, a commit, or an
> issue. Connection strings, the session secret and the Datadog **API** key are
> all live credentials. (The Datadog *client token* and *application id* are
> different — those are public by design and safe in the browser bundle.)

---

## 1. Store the secrets

The task reads these at start-up; they are never build arguments and never
CloudFormation parameters, because a stack parameter is visible to anyone who
can describe the stack.

```bash
export AWS_REGION=ap-south-1

aws secretsmanager create-secret \
  --name flying-dev/app \
  --secret-string '{
    "DATABASE_URL":"postgresql://…-pooler.…neon.tech/neondb?sslmode=require",
    "DIRECT_URL":"postgresql://…(no -pooler)….neon.tech/neondb?sslmode=require",
    "SESSION_SECRET":"'"$(openssl rand -base64 32)"'"
  }'
```

`DIRECT_URL` **must not** contain `-pooler`. Prisma takes a Postgres session
advisory lock to migrate and PgBouncer cannot hold one; get this wrong and the
container refuses to start rather than hanging for ten minutes, but it still
will not start. `docker-entrypoint.sh` checks for exactly this.

Changing `SESSION_SECRET` signs every customer out, so generate it once here
and leave it alone.

Optional, and what makes APM work:

```bash
aws secretsmanager create-secret \
  --name flying-dev/datadog \
  --secret-string 'YOUR_DATADOG_API_KEY'
```

Leave it out and the Agent sidecar is simply not created — the app notices the
missing `DD_AGENT_HOST` and never loads the tracer. The site runs identically,
just without server-side traces.

## 2. Create the registry and the deploy role

```bash
aws cloudformation deploy \
  --stack-name flying-dev-bootstrap \
  --template-file infra/bootstrap.yml \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation describe-stacks \
  --stack-name flying-dev-bootstrap \
  --query 'Stacks[0].Outputs' --output table
```

If it fails with `EntityAlreadyExists` on the OIDC provider, this account
already has one — re-run with
`--parameter-overrides CreateOidcProvider=no`.

## 3. Tell GitHub where to deploy

In **Settings → Secrets and variables → Actions**.

Variables (`vars`) — none of these are sensitive:

| Name | Value |
| --- | --- |
| `AWS_REGION` | `ap-south-1` |
| `AWS_DEPLOY_ROLE_ARN` | `DeployRoleArn` from step 2 |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `918587949104` |
| `NEXT_PUBLIC_SUPPORT_PHONE` | `+91 85879 49104` |
| `NEXT_PUBLIC_DD_APPLICATION_ID` | from Datadog RUM |
| `NEXT_PUBLIC_DD_CLIENT_TOKEN` | from Datadog RUM |
| `NEXT_PUBLIC_DD_SITE` | `datadoghq.com` |
| `NEXT_PUBLIC_SITE_URL` | set in step 7, once the domain is live |
| `PUBLIC_HEALTH_URL` | set in step 6 |

Secrets (`secrets`) — these are live credentials:

| Name | Value |
| --- | --- |
| `BUILD_DATABASE_URL` | the pooled Neon string |
| `BUILD_DIRECT_URL` | the unpooled Neon string |

The build needs the database because `/repair/[brand]` and the sitemap are
prerendered from the catalogue. They are mounted as BuildKit secrets for a
single `RUN`, so they never end up in an image layer.

## 4. Push the first image

Run the **Deploy** workflow (Actions → Deploy → Run workflow).

It builds and pushes, then stops, because there is no service to roll out yet —
the job summary will say so and print the command for the next step with the
image URI already filled in.

## 5. Create the service

```bash
aws cloudformation deploy \
  --stack-name flying-dev-service \
  --template-file infra/service.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ContainerImage=<account>.dkr.ecr.ap-south-1.amazonaws.com/flying-dev:<sha> \
    AppSecretArn=$(aws secretsmanager describe-secret --secret-id flying-dev/app --query ARN --output text) \
    DatadogApiKeySecretArn=$(aws secretsmanager describe-secret --secret-id flying-dev/datadog --query ARN --output text)
```

Takes about five minutes, most of it the load balancer.

## 6. Check it

```bash
aws cloudformation describe-stacks --stack-name flying-dev-service \
  --query 'Stacks[0].Outputs' --output table

curl http://<LoadBalancerDomain>/api/health
```

You want `"status":"ok"` and `"database":"ok"`. Put that URL in the
`PUBLIC_HEALTH_URL` GitHub variable — the deploy workflow uses it to confirm
that what is live is the commit it just shipped, rather than trusting that the
rollout worked.

From here, **every push to `main` deploys on its own.**

## 7. The domain and HTTPS

Request a certificate in ACM **in the same region**, for `flyingdev.in` and
`www.flyingdev.in`, and complete the DNS validation it asks for. Then:

```bash
aws cloudformation deploy \
  --stack-name flying-dev-service \
  --template-file infra/service.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides CertificateArn=arn:aws:acm:ap-south-1:…
```

The load balancer starts listening on 443 and 80 becomes a 301 to it. Point the
domain at `LoadBalancerDomain` (an ALIAS record in Route 53, or a CNAME
elsewhere — the apex of a domain cannot be a CNAME, so a registrar without
ALIAS support means moving DNS to Route 53).

Last, set `NEXT_PUBLIC_SITE_URL` to `https://flyingdev.in` and push. Canonical
links, the sitemap and the WhatsApp share card are baked in at build time, so
they only pick up the domain on the next deploy.

---

## Day to day

**Logs.** `aws logs tail /ecs/flying-dev --follow`. The app's streams are
prefixed `app`, the Agent's `datadog`.

**Roll back.** Re-run the Deploy workflow from an older commit, or point the
service at a previous image:

```bash
aws ecs update-service --cluster flying-dev --service flying-dev \
  --task-definition flying-dev:<older-revision>
```

**A deploy that will not start.** Migrations run on boot, so a bad migration
crashes the task. The service's circuit breaker notices and puts the previous
version back — the site stays up and the workflow fails. The reason is in the
`app` log stream.

**Run migrations separately.** Once the service runs more than one task, having
each of them migrate on boot is a race. The image already supports the other
shape: set `RUN_MIGRATIONS=0` on the task definition and run them as a one-off
before the rollout.

```bash
aws ecs run-task --cluster flying-dev --launch-type FARGATE \
  --task-definition flying-dev \
  --network-configuration 'awsvpcConfiguration={subnets=[…],securityGroups=[…],assignPublicIp=ENABLED}' \
  --overrides '{"containerOverrides":[{"name":"app","command":["migrate"]}]}'
```

## What it costs

Roughly, in `ap-south-1`, with no traffic to speak of:

| | per month |
| --- | --- |
| Application Load Balancer | ~$18 |
| Fargate, 1 task at 0.5 vCPU / 1 GB | ~$15 |
| ECR, CloudWatch logs, data transfer | ~$2 |
| **Total** | **~$35** |

There is deliberately no NAT gateway. Tasks sit in public subnets with public
IPs so they can reach ECR and Neon directly, and nothing can open a connection
to them except the load balancer's security group. A NAT gateway would be the
more conventional diagram and about $32 a month before a single byte moves.

The load balancer is the floor here. It is also what gives you HTTPS, a stable
address, health-checked rollouts and zero-downtime deploys, which is the trade
being made.

---

## Turning it off

Worth reading **before** you turn it on, not after. The load balancer bills by
the hour whether or not anyone visits, so the thing that costs real money is
forgetting this page exists.

### A cost alarm, first

Two minutes now, and you find out from an email rather than from a statement.

```bash
aws budgets create-budget \
  --account-id "$(aws sts get-caller-identity --query Account --output text)" \
  --budget '{
    "BudgetName":"flying-dev",
    "BudgetLimit":{"Amount":"60","Unit":"USD"},
    "TimeUnit":"MONTHLY",
    "BudgetType":"COST"
  }' \
  --notifications-with-subscribers '[{
    "Notification":{
      "NotificationType":"ACTUAL",
      "ComparisonOperator":"GREATER_THAN",
      "Threshold":80,
      "ThresholdType":"PERCENTAGE"
    },
    "Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]
  }]'
```

Credits are spent silently and stop covering you without warning, so set this
even while they last.

### Pausing without tearing down

```bash
aws ecs update-service --cluster flying-dev --service flying-dev --desired-count 0
```

Stops the Fargate charge (~$15/month) and keeps everything else in place;
`--desired-count 1` brings it back. It does **not** stop the load balancer,
which is most of the bill, so this is for a quiet week, not a quiet month.

### Tearing it down

Order matters. The service stack holds everything that costs money, so it goes
first; if you only get one command done, make it that one.

```bash
# 1. The expensive half: load balancer, Fargate tasks, VPC, log group.
aws cloudformation delete-stack --stack-name flying-dev-service
aws cloudformation wait stack-delete-complete --stack-name flying-dev-service

# 2. The registry and the deploy role. EmptyOnDelete means the images go too.
aws cloudformation delete-stack --stack-name flying-dev-bootstrap
aws cloudformation wait stack-delete-complete --stack-name flying-dev-bootstrap
```

Those `wait` calls are the point. `delete-stack` returns immediately and a
deletion can still fail minutes later — check it finished rather than assuming:

```bash
aws cloudformation describe-stacks --stack-name flying-dev-service 2>&1 | tail -1
# "does not exist" is what you want to see.
```

**The secrets are not in either stack.** They were created with the CLI, so
CloudFormation neither knows nor cares about them. They cost a few cents a
month each and, more to the point, they hold a live database URL and your
session secret:

```bash
aws secretsmanager delete-secret --secret-id flying-dev/app --force-delete-without-recovery
aws secretsmanager delete-secret --secret-id flying-dev/datadog --force-delete-without-recovery
```

Without `--force-delete-without-recovery` they sit in a 30-day recovery window,
still billing, and the name stays taken — which is its own surprise if you ever
rebuild this.

Then confirm nothing is left running:

```bash
aws elbv2 describe-load-balancers --query 'LoadBalancers[].LoadBalancerName'
aws ecs list-clusters
aws ec2 describe-vpcs --query 'Vpcs[?!IsDefault].VpcId'
```

Empty (or default-only) on all three means you are done. Last, delete the
Datadog API key in Datadog itself and the RUM application if you are finished
with it — those live outside AWS entirely.

### What survives, and should

Netlify, Neon and the repository are untouched by any of the above. Tearing
down AWS puts you back exactly where you were: a working site on Netlify, with
the whole Fargate setup still in `infra/` if you ever want it again.
