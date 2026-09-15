/**
 * Resolve the Datadog environment and version at build time.
 *
 * These have to be decided here rather than read at runtime. Next inlines only
 * NEXT_PUBLIC_* into the browser bundle, and the signals that say which deploy
 * this is -- Netlify's CONTEXT and COMMIT_REF -- carry no such prefix, so a
 * client component reading them directly would see undefined.
 *
 * Why it matters: NODE_ENV is "production" for every built deploy, previews
 * included. Tagging on that alone would file a preview build's errors and page
 * timings alongside real customer traffic, which is how a dashboard stops
 * meaning anything.
 *
 * CONTEXT is Netlify's ("production", "deploy-preview", "branch-deploy"), and
 * the fallbacks below keep this working if the site moves to AWS or anywhere
 * else. An explicit NEXT_PUBLIC_DD_ENV always wins.
 */
export function datadogEnv() {
  if (process.env.NEXT_PUBLIC_DD_ENV) return process.env.NEXT_PUBLIC_DD_ENV;

  const context = process.env.CONTEXT;
  if (context === "production") return "production";
  // Any other Netlify context is a preview or a branch build: sandbox.
  if (context) return "sandbox";

  // Not on Netlify. A production build elsewhere is still not assumed to be
  // production -- say so explicitly rather than have it quietly claim to be.
  return process.env.NODE_ENV === "production" ? "unknown" : "development";
}

/** Lets Datadog attribute an error to the commit that introduced it. */
export function datadogVersion() {
  const sha =
    process.env.NEXT_PUBLIC_DD_VERSION ||
    process.env.COMMIT_REF ||        // Netlify
    process.env.GITHUB_SHA ||        // GitHub Actions
    process.env.AWS_COMMIT_ID;       // Amplify
  return sha ? sha.slice(0, 7) : "dev";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_DD_ENV: datadogEnv(),
    NEXT_PUBLIC_DD_VERSION: datadogVersion(),
  },
};

export default nextConfig;
