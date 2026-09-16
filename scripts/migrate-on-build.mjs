/**
 * Apply migrations during a deploy, but only for the deploy that owns them.
 *
 * Every Netlify context -- production, deploy previews, branch builds -- runs
 * the same build command against the same database, so each one calls
 * `prisma migrate deploy` and each one takes Postgres advisory lock 72707369
 * to do it. Two builds close together therefore race, and the loser fails:
 *
 *   Error: P1002 ... Timed out trying to acquire a postgres advisory lock
 *   (SELECT pg_advisory_lock(72707369)). Timeout: 10000ms.
 *
 * which is what took down the previews for #17 and #18 within ten minutes of
 * each other. Previews have nothing to migrate in any case: they share the
 * production database, so the schema they need is already applied. Only the
 * production deploy should be changing it.
 *
 * CONTEXT is Netlify's. It is unset locally and in CI, where migrating is
 * exactly what we want, so the skip is deliberately narrow: only when we know
 * we are a non-production deploy.
 */
import { spawnSync } from "node:child_process";

const context = process.env.CONTEXT;

if (context && context !== "production") {
  console.log(
    `CONTEXT=${context} — skipping migrations. Previews share the production ` +
      `database and must not race it for the migration lock.`
  );
  process.exit(0);
}

console.log(context ? "CONTEXT=production — applying migrations." : "Applying migrations.");

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
