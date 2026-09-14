/**
 * siteUrl() decides every absolute URL the site emits -- canonicals, the
 * sitemap, robots.txt and the WhatsApp share card -- so a wrong answer here is
 * wrong everywhere, and quietly: pages still render.
 *
 * The "malformed" case is not hypothetical. A DATABASE_URL pasted with a
 * `psql '` prefix failed a real deploy; the same paste into the site URL used
 * to reach `new URL()` at module scope in layout.tsx and take the whole build
 * down. It must fall through to the next candidate instead.
 */
import { siteUrl } from "../src/lib/siteUrl";
const cases: [string, Record<string,string|undefined>, string][] = [
  ["explicit wins",        {NEXT_PUBLIC_SITE_URL:"https://flyingdev.in", URL:"https://x.netlify.app"}, "https://flyingdev.in"],
  ["netlify URL fallback", {URL:"https://flyingdev.netlify.app"},                                      "https://flyingdev.netlify.app"],
  ["deploy preview",       {DEPLOY_PRIME_URL:"https://deploy-preview-9--fd.netlify.app"},              "https://deploy-preview-9--fd.netlify.app"],
  ["bare hostname typed",  {NEXT_PUBLIC_SITE_URL:"flyingdev.netlify.app"},                             "https://flyingdev.netlify.app"],
  ["trailing slash",       {NEXT_PUBLIC_SITE_URL:"https://flyingdev.in/"},                             "https://flyingdev.in"],
  ["malformed -> no crash",{NEXT_PUBLIC_SITE_URL:"psql 'not a url", URL:"https://fd.netlify.app"},     "https://fd.netlify.app"],
  ["empty string skipped", {NEXT_PUBLIC_SITE_URL:"   ", URL:"https://fd.netlify.app"},                 "https://fd.netlify.app"],
  ["nothing set",          {},                                                                          "http://localhost:3000"],
];
let bad = 0;
for (const [label, env, want] of cases) {
  for (const k of ["NEXT_PUBLIC_SITE_URL","URL","DEPLOY_PRIME_URL"]) delete process.env[k];
  Object.assign(process.env, env);
  const got = siteUrl();
  const ok = got === want;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(22)} -> ${got}${ok ? "" : `   (wanted ${want})`}`);
}
console.log(bad === 0 ? "\nAll 8 siteUrl cases pass." : `\n${bad} FAILED`);
process.exit(bad === 0 ? 0 : 1);
