# syntax=docker/dockerfile:1.7
#
# Flying Dev on ECS Fargate.
#
# Three stages so the image Fargate pulls carries only what serving needs: no
# compiler, no dev dependencies, no source. What it does carry beyond the built
# app is the Prisma CLI and the migrations folder, because this container is
# also what applies schema changes -- see docker-entrypoint.sh.
#
# Debian slim rather than Alpine: Prisma ships prebuilt query engines per libc,
# and the glibc ones are the well-trodden path. Alpine needs an explicit
# binaryTargets entry in schema.prisma and breaks in ways that only show up at
# runtime, which is the worst place to find out.

FROM node:22-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma's query engine links against OpenSSL, which slim does not include.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app


# --- dependencies -----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci


# --- migration CLI ----------------------------------------------------------
# The Prisma CLI, installed as its own self-contained tree.
#
# Copying node_modules/prisma out of the build tree looks like it should work
# and does not: the CLI reaches into @prisma/config, which requires `effect`,
# which requires more again. Cherry-picking that graph by hand is whack-a-mole
# that ends in a container which builds fine and then dies on boot. Installing
# it properly gets the whole graph and nothing else.
#
# The version is read from package.json rather than written here, so the CLI
# applying a migration can never drift from the client generated against it.
FROM base AS migrator
COPY package.json ./
RUN mkdir -p /cli \
  && cd /cli \
  && npm init -y > /dev/null \
  && npm install --omit=dev --no-audit --no-fund \
       "prisma@$(node -p 'const p=require("/app/package.json"); p.devDependencies?.prisma || p.dependencies?.prisma')"


# --- build ------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next inlines NEXT_PUBLIC_* into the browser bundle at build time, so every
# value the client needs has to be present now -- setting them on the task
# definition would be far too late. The deploy workflow passes them in.
ARG NEXT_PUBLIC_DD_ENV
ARG NEXT_PUBLIC_DD_VERSION
ARG NEXT_PUBLIC_DD_APPLICATION_ID
ARG NEXT_PUBLIC_DD_CLIENT_TOKEN
ARG NEXT_PUBLIC_DD_SITE
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_SUPPORT_PHONE
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_DD_ENV=${NEXT_PUBLIC_DD_ENV} \
    NEXT_PUBLIC_DD_VERSION=${NEXT_PUBLIC_DD_VERSION} \
    NEXT_PUBLIC_DD_APPLICATION_ID=${NEXT_PUBLIC_DD_APPLICATION_ID} \
    NEXT_PUBLIC_DD_CLIENT_TOKEN=${NEXT_PUBLIC_DD_CLIENT_TOKEN} \
    NEXT_PUBLIC_DD_SITE=${NEXT_PUBLIC_DD_SITE} \
    NEXT_PUBLIC_WHATSAPP_NUMBER=${NEXT_PUBLIC_WHATSAPP_NUMBER} \
    NEXT_PUBLIC_SUPPORT_PHONE=${NEXT_PUBLIC_SUPPORT_PHONE} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

ENV BUILD_STANDALONE=1

RUN npx prisma generate

# The build reads the database: /repair/[brand] enumerates brands in
# generateStaticParams, and sitemap.ts walks the catalogue. So the connection
# string has to be available here -- but as a BuildKit secret, mounted for the
# length of one RUN and never written to a layer. Baking it in with ENV would
# put a live credential in the image for anyone who can pull it.
RUN --mount=type=secret,id=database_url \
    --mount=type=secret,id=direct_url \
    DATABASE_URL="$(cat /run/secrets/database_url)" \
    DIRECT_URL="$(cat /run/secrets/direct_url)" \
    npx next build


# --- runtime ----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Don't serve as root. A container escape should land somewhere boring.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# output: "standalone" emits a server.js plus the subset of node_modules the
# traced code actually reaches. .next/static is deliberately not part of it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Migrations run from this image at start-up, so the migration history and the
# CLI have to travel with it. Tracing never sees either: nothing in the
# application imports them.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=migrator --chown=nextjs:nodejs /cli ./.prisma-cli

# The generated client and its query engine. output: "standalone" traces both
# already; copying them explicitly means a change in what Next decides to trace
# cannot quietly leave the app unable to reach the database.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["serve"]
