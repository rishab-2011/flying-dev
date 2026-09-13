/**
 * Runs the catalogue seed during a deploy, but only when SEED_ON_BUILD=1.
 *
 * Seeding needs to happen once, against the hosted database. Rather than
 * requiring Node and a checkout on your own machine, set SEED_ON_BUILD=1 in
 * the host's environment variables, deploy once, then remove it.
 *
 * Leaving it on is not destructive — the seed only ever adds what's missing,
 * and never overwrites a price you have edited — but it does re-add models you
 * may have deliberately deleted, so turn it off once the catalogue is loaded.
 */
import { spawnSync } from "node:child_process";

if (process.env.SEED_ON_BUILD !== "1") {
  console.log("SEED_ON_BUILD is not set — skipping the catalogue seed.");
  process.exit(0);
}

console.log("SEED_ON_BUILD=1 — seeding the catalogue…");

const result = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
