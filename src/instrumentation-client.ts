/**
 * Runs once in the browser before the app hydrates (Next 15.3+).
 *
 * Both calls are no-ops unless NEXT_PUBLIC_DD_APPLICATION_ID and
 * NEXT_PUBLIC_DD_CLIENT_TOKEN are set, so this file costs nothing until
 * Datadog is actually configured in Netlify.
 */
import { startDatadog, readConsent } from "@/lib/datadog";

startDatadog(readConsent());
