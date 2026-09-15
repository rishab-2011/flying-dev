/**
 * A preview build must not report as production.
 *
 * NODE_ENV is "production" for every built deploy, previews included, so
 * tagging on it alone files preview errors and timings next to real customer
 * traffic. These cases pin the resolution that keeps them apart.
 */
import { datadogEnv, datadogVersion } from "../next.config.mjs";

let failed = 0;
const check = (name, got, want) => {
  const ok = got === want;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(46)} -> ${got}${ok ? "" : `   (wanted ${want})`}`);
  if (!ok) failed++;
};

const KEYS = [
  "NEXT_PUBLIC_DD_ENV", "NEXT_PUBLIC_DD_VERSION", "CONTEXT",
  "COMMIT_REF", "GITHUB_SHA", "AWS_COMMIT_ID", "NODE_ENV",
];
const withEnv = (env, fn) => {
  const saved = {};
  for (const k of KEYS) { saved[k] = process.env[k]; delete process.env[k]; }
  Object.assign(process.env, env);
  try { return fn(); } finally {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
};

check("netlify production",            withEnv({ CONTEXT: "production", NODE_ENV: "production" }, datadogEnv), "production");
check("netlify deploy preview",        withEnv({ CONTEXT: "deploy-preview", NODE_ENV: "production" }, datadogEnv), "sandbox");
check("netlify branch deploy",         withEnv({ CONTEXT: "branch-deploy", NODE_ENV: "production" }, datadogEnv), "sandbox");
check("local dev",                     withEnv({ NODE_ENV: "development" }, datadogEnv), "development");
check("built off-Netlify is not prod", withEnv({ NODE_ENV: "production" }, datadogEnv), "unknown");
check("explicit override wins",        withEnv({ NEXT_PUBLIC_DD_ENV: "staging", CONTEXT: "production" }, datadogEnv), "staging");

check("version from netlify COMMIT_REF", withEnv({ COMMIT_REF: "0f32f7412345678" }, datadogVersion), "0f32f74");
check("version from GITHUB_SHA",         withEnv({ GITHUB_SHA: "abcdef1234567890" }, datadogVersion), "abcdef1");
check("version falls back to dev",       withEnv({}, datadogVersion), "dev");

console.log(failed === 0 ? "\nAll 9 Datadog env cases pass." : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
