# Google Apps Script email verification setup

The browser never calls Apps Script directly. The flow is:

`scheme guidance form → FastAPI → signed Apps Script request → email → OTP confirmation → existing rule engine → one result email`

The FastAPI token binds the OTP to the selected published scheme, its exact
verified version, and a hash of the confirmed backend profile. A changed profile
or changed scheme version must start verification again. Apps Script stores only
an HMAC of the OTP, expires it after five minutes, locks every state transition,
limits attempts and resends, rejects replayed backend requests, and de-duplicates
result emails by decision ID.

## 1. Create and configure the Apps Script project

1. Open [Google Apps Script](https://script.google.com/) using the Google account
   that should send Yojana Saathi email.
2. Create a standalone project named `Yojana Saathi Email Verification`.
3. Replace the default editor content with [`Code.gs`](./Code.gs).
4. In **Project Settings**, enable **Show `appsscript.json` manifest file in
   editor**, then replace that file with [`appsscript.json`](./appsscript.json).
5. Generate a random secret of at least 32 characters. From a terminal, one safe
   option is:

   ```bash
   openssl rand -hex 32
   ```

6. In **Project Settings → Script properties**, add:

   | Property | Value |
   | --- | --- |
   | `SHARED_SECRET` | The generated 64-character value |

   Never place this value in frontend variables, source control, screenshots, or
   browser code.

## 2. Deploy the web app

1. Select **Deploy → New deployment → Web app**.
2. Set **Execute as** to **Me** so `MailApp` sends from the project owner.
3. Set access to the narrowest option compatible with the deployed FastAPI
   server. Apps Script consumer deployments may require **Anyone**; the endpoint
   is still protected by timestamped HMAC signatures, nonce replay prevention,
   OTP/email throttles, and strict action validation.
4. Deploy, authorize only the requested `script.send_mail` scope, and copy the
   production URL ending in `/exec`. The `/dev` test URL is editor-only and must
   not be used in Render.

After any code change, create a new deployment version or edit the existing
deployment to use the new version.

## 3. Configure FastAPI locally

Add these server-only values to `services/api/.env`:

```dotenv
GAS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GAS_SHARED_SECRET=the_exact_same_value_as_the_script_property
VERIFICATION_STATE_SECRET=a_different_random_value_of_at_least_32_characters
```

Restart FastAPI after changing the environment. Do not prefix these values with
`NEXT_PUBLIC_`. The frontend needs only its existing API base URL and live mode:

```dotenv
NEXT_PUBLIC_API_MODE=live
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 4. Configure Render

The Blueprint declares `GAS_WEB_APP_URL`, `GAS_SHARED_SECRET`, and
`VERIFICATION_STATE_SECRET` as secret values. Add the same three values in the
Render service environment and redeploy. Use a different state secret from the
Apps Script shared secret.

## 5. Test safely

1. Start the API and web app.
2. Confirm a profile, open one verified scheme, and open its application-guidance
   page.
3. Enter a name and an email inbox you control.
4. Confirm that the API response contains only a signed verification token and
   expiry—not the OTP.
5. Test a wrong code, then the correct code. Confirm eligibility is not evaluated
   and no result email is sent on the wrong code.
6. Confirm the result displayed in the UI matches the existing scheme-rule
   result and that exactly one result email arrives.
7. Submit the same confirmation request again. The response may be idempotently
   repeated, but Apps Script must report the result email as already sent.
8. Change a confirmed profile value after requesting a code. Confirmation must
   return a conflict and require a new code.

Automated backend tests cover eligible, not-eligible, needs-review, wrong,
expired, reused, attempt-limited, malformed, profile-tampering, duplicate, and
retryable-delivery paths. Real Gmail delivery, Apps Script quotas, and the
deployed endpoint still require this manual smoke test because they depend on
the owner Google account.

## Operations and common errors

- Use **Apps Script → Executions** to inspect failures. The code logs only safe
  error codes; it never logs OTPs, tokens, email addresses, or profile data.
- `resend_cooldown` means wait 60 seconds. `rate_limited` means the address has
  reached the hourly OTP limit. `too_many_attempts` requires a new OTP.
- `delivery_unavailable` can mean the sender's daily recipient quota is
  exhausted. `MailApp.getRemainingDailyQuota()` is checked before each email.
- A 503 saying verification is not configured means one or more of the three
  backend environment variables is missing.
- A signature failure usually means the two shared-secret values differ or the
  server clock is more than five minutes out of sync.
- Script Properties are appropriate for this small workflow, not an unlimited
  datastore. Monitor property storage and Gmail quotas before production scale;
  move challenge/idempotency state to a durable database if traffic grows.

Official references: [Apps Script web apps](https://developers.google.com/apps-script/guides/web),
[MailApp](https://developers.google.com/apps-script/reference/mail/mail-app),
[Lock Service](https://developers.google.com/apps-script/reference/lock), and
[Properties Service](https://developers.google.com/apps-script/guides/properties).
