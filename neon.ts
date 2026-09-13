import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Neon is used purely as the Postgres database for this app. Sign-in runs on
  // the app's own phone-and-password auth in src/lib/auth.ts, so Neon Auth
  // stays off — turning it on would provision a second, unused auth system.
  auth: false,
});
