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
 * CONTEXT is Netlify's ("production", "deploy-preview", "branch-deploy"). On
 * AWS there is no such signal -- the image is built by GitHub Actions, which
 * knows the commit but not what the commit is for -- so the deploy workflow
 * passes NEXT_PUBLIC_DD_ENV in as a build argument instead. An explicit
 * NEXT_PUBLIC_DD_ENV always wins, which is what makes that work.
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
  // Emit .next/standalone: a self-contained server plus only the node_modules
  // the traced code actually reaches. The Docker image copies that instead of
  // the full dependency tree, which is the difference between an image Fargate
  // pulls in seconds and one it pulls in minutes.
  //
  // Opt-in rather than always on, and only the Dockerfile opts in. Netlify is
  // still the live host until AWS takes over, its Next runtime does its own
  // packaging, and changing the shape of the build output underneath a host
  // that currently works is not a risk worth taking for no gain there.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  // dd-trace works by monkey-patching modules as they are required, so it has
  // to be left alone in node_modules. Bundling it through webpack rewrites the
  // very require() calls it needs to intercept and it silently traces nothing.
  serverExternalPackages: ["dd-trace"],
  env: {
    NEXT_PUBLIC_DD_ENV: datadogEnv(),
    NEXT_PUBLIC_DD_VERSION: datadogVersion(),
  },
};

export default nextConfig;
