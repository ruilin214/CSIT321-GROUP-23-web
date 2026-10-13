> Headset-only release: see `docs/HEADSET_ONLY_UPDATE.md` (or `HEADSET_ONLY_UPDATE.md` from this folder) for the current feature set and setup. Earlier simulator references below describe previous versions and are not current features.

# Registration flow update

## Using the application
1. Open the sign-in page, then select **Create an account**. This navigation link is available without filling in login details.
2. On `/register`, enter full name, email, password (at least 8 characters) and matching confirmation.
3. Submit the form. Validation errors and Supabase errors remain visible without leaving the page.
4. If Supabase returns no session, check the email inbox and spam folder for confirmation. Existing accounts may not receive another signup email; use the existing password to sign in.
5. Return to sign in and use the registered credentials.

The registration submit button only disables during submission or when Supabase is not configured. Empty fields use native required/email validation, with additional password confirmation checks. The account name is saved in Supabase Auth user metadata (`full_name`); the existing profiles schema and trainee-role trigger are unchanged. No role is selected by the registering user.

## Installation
Copy your existing `.env.local` next to `package.json`, then run `npm ci` and `npm run dev`. The bundled production preview has no cloud configuration; rebuild after adding environment variables before using preview or deployment. No database migration changes are required for this update.

## Validation
14 automated tests passed; production build passed; ESLint has no errors and one existing Toast Fast Refresh warning. Registration UI tests mock Auth to cover navigation, mismatched passwords, server errors, email-confirmation and no-confirmation responses. Live email delivery and actual Supabase registration still require testing with your configured project. Browser screenshot verification remains pending because the browser download failed.
