/**
 * The container entrypoint's guards.
 *
 * docker-entrypoint.sh is the only thing standing between a bad DIRECT_URL and
 * the failure mode that took down four Netlify deploys in a row: Prisma cannot
 * hold a Postgres session advisory lock through PgBouncer, so `migrate deploy`
 * against a pooled host hangs and dies with P1002. On Fargate that reads as a
 * task that starts, sits there, and never turns healthy -- ten minutes of
 * staring at an ALB before anyone suspects the connection string.
 *
 * Failing immediately with the reason is worth a great deal, so the guards are
 * tested rather than trusted. The prisma CLI is stubbed: what is under test is
 * the shell logic, not Prisma.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, copyFileSync, chmodSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "fd-entrypoint-"));
mkdirSync(join(dir, "node_modules", ".bin"), { recursive: true });
copyFileSync("docker-entrypoint.sh", join(dir, "docker-entrypoint.sh"));
chmodSync(join(dir, "docker-entrypoint.sh"), 0o755);
writeFileSync(join(dir, "node_modules", ".bin", "prisma"), '#!/bin/sh\necho "STUB prisma $*"\n');
chmodSync(join(dir, "node_modules", ".bin", "prisma"), 0o755);

let failed = 0;
function run(args, env) {
  try {
    const stdout = execFileSync("./docker-entrypoint.sh", args, {
      cwd: dir,
      env: { PATH: process.env.PATH, ...env },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out: stdout };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

function check(name, args, env, wantCode, wantText) {
  const { code, out } = run(args, env);
  const ok = code === wantCode && out.includes(wantText);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) {
    console.log(`      exit ${code} (wanted ${wantCode}); looked for ${JSON.stringify(wantText)}`);
    console.log(`      got: ${out.trim()}`);
    failed++;
  }
}

const UNPOOLED = "postgresql://u:p@ep-still-bar-123.ap-southeast-1.aws.neon.tech/neondb";
const POOLED = "postgresql://u:p@ep-still-bar-123-pooler.ap-southeast-1.aws.neon.tech/neondb";

check("a missing DIRECT_URL stops the container", ["migrate"], {}, 1, "DIRECT_URL is not set");
check("a pooled DIRECT_URL stops the container", ["migrate"], { DIRECT_URL: POOLED }, 1, "P1002");
check("an unpooled DIRECT_URL migrates", ["migrate"], { DIRECT_URL: UNPOOLED }, 0, "migrate deploy");
check("RUN_MIGRATIONS=0 skips the guards too", ["migrate"], { RUN_MIGRATIONS: "0" }, 0, "skipping migrations");
check("an explicit command still runs", ["echo", "passthrough"], { DIRECT_URL: UNPOOLED }, 0, "passthrough");

rmSync(dir, { recursive: true, force: true });

console.log(failed ? `\n${failed} entrypoint check(s) failed.` : "\nAll entrypoint checks passed.");
process.exit(failed ? 1 : 0);
