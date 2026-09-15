/**
 * Datadog RUM and browser logs.
 *
 * Two gates stand in front of this, and both matter.
 *
 * The first is configuration: with no application id and client token set, the
 * SDK is never initialised and the consent banner never appears. So merging
 * this changes nothing about the live site until those variables are added in
 * Netlify -- there is no half-configured state that ships a broken tracker.
 *
 * The second is consent. This site collects names, phone numbers and home
 * addresses, and India's DPDP Act wants a clear affirmative choice before that
 * kind of behavioural data goes to a third party. RUM is started with
 * trackingConsent "not-granted", which loads the SDK but sends nothing; only
 * setTrackingConsent("granted") opens the tap. Declining leaves it closed for
 * the life of the browser profile.
 *
 * Session replay is deliberately off and inputs are masked. Replay would record
 * a customer typing their home address into the booking form and store that
 * recording on Datadog's servers -- an unnecessary liability for a business
 * whose technicians then visit that address.
 */
export const CONSENT_STORAGE_KEY = "fd-analytics-consent";
export type Consent = "granted" | "denied";

/** Datadog's regional endpoint. Defaults to AP1, the closest to India. */
const site = process.env.NEXT_PUBLIC_DD_SITE || "ap1.datadoghq.com";
const applicationId = process.env.NEXT_PUBLIC_DD_APPLICATION_ID;
const clientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN;

/** True only when both credentials are present, so the rest can stay inert. */
export function isDatadogConfigured(): boolean {
  return Boolean(applicationId && clientToken);
}

/**
 * Read the stored choice.
 *
 * localStorage throws in a Safari private window and when a browser is set to
 * block site data, so a failure here has to read as "no choice yet" rather than
 * take the page down.
 */
export function readConsent(): Consent | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
}

export function writeConsent(consent: Consent): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // A browser refusing storage still gets the in-memory choice below; it is
    // simply asked again next visit. That is the correct way round to fail.
  }
}

let started = false;

/**
 * Initialise the SDKs. Safe to call more than once.
 *
 * The two SDKs are imported dynamically, and that is not a style choice: a
 * static import pulls ~72 kB into the bundle of every page, for every visitor,
 * whether or not Datadog is configured and whether or not they consented. This
 * way the chunk is fetched only when both credentials exist, so an unconfigured
 * site carries none of it and a customer on a patchy mobile connection loads
 * the booking funnel at its original weight.
 */
export async function startDatadog(consent: Consent | null): Promise<void> {
  if (!isDatadogConfigured() || started) return;
  started = true;

  const [{ datadogRum }, { datadogLogs }] = await Promise.all([
    import("@datadog/browser-rum"),
    import("@datadog/browser-logs"),
  ]);

  const common = {
    clientToken: clientToken!,
    site,
    service: "flying-dev",
    env: process.env.NODE_ENV,
    sessionSampleRate: 100,
    // Start closed. Nothing leaves the browser until consent is granted.
    trackingConsent: (consent === "granted" ? "granted" : "not-granted") as
      | "granted"
      | "not-granted",
  };

  datadogRum.init({
    ...common,
    applicationId: applicationId!,
    sessionReplaySampleRate: 0,
    defaultPrivacyLevel: "mask-user-input",
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
  });

  datadogLogs.init({
    ...common,
    forwardErrorsToLogs: true,
  });
}

/** Apply a choice the customer has just made, and remember it. */
export async function applyConsent(consent: Consent): Promise<void> {
  writeConsent(consent);
  if (!isDatadogConfigured()) return;

  await startDatadog(consent);

  const [{ datadogRum }, { datadogLogs }] = await Promise.all([
    import("@datadog/browser-rum"),
    import("@datadog/browser-logs"),
  ]);
  const value = consent === "granted" ? "granted" : "not-granted";
  datadogRum.setTrackingConsent(value);
  datadogLogs.setTrackingConsent(value);
}
