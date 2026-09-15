import { existsSync } from "node:fs";
import { chromium } from "playwright";

/**
 * Launch Chromium wherever the tests happen to be running.
 *
 * Some environments ship a pre-installed browser and set
 * PLAYWRIGHT_BROWSERS_PATH to point at it; passing executablePath there avoids
 * a download and a version mismatch against the bundled build. A CI runner has
 * no such browser, and naming a path that does not exist fails the launch
 * outright -- which is what a hardcoded /opt/pw-browsers/chromium did.
 *
 * So use the pinned binary only when it is actually on disk, and otherwise let
 * Playwright resolve the one it installed itself.
 */
const PINNED = process.env.PLAYWRIGHT_CHROMIUM_PATH || "/opt/pw-browsers/chromium";

export function launchChromium(options = {}) {
  return existsSync(PINNED)
    ? chromium.launch({ executablePath: PINNED, ...options })
    : chromium.launch(options);
}
