# Supabase Edge Functions

Two functions wire the lead pipeline to Resend so the owner is notified by email when a new lead lands, and the customer gets a confirmation for quotes.

| Function | Trigger | Sends |
|---|---|---|
| `notify-quote` | `quotes` table INSERT | Owner notification + customer confirmation |
| `notify-contact` | `contacts` table INSERT | Owner notification only |

Shared helpers (Resend client, HTML wrapper, escape) live in `_shared/email.ts`.

---

## One-time setup

### 1. Install the Supabase CLI

```powershell
# Windows (winget)
winget install Supabase.CLI

# macOS / Linux (homebrew)
brew install supabase/tap/supabase

# Or via npm globally
npm install -g supabase
```

Verify:
```bash
supabase --version
```

### 2. Sign in and link this repo to your Supabase project

```bash
supabase login
# Opens a browser to authenticate

cd "d:/React/Grow Modern Hub/grow-modern-hub"
supabase link --project-ref <YOUR_PROJECT_REF>
# Your project ref is the subdomain in your Supabase URL:
# https://<PROJECT_REF>.supabase.co
```

### 3. Set the Resend API key as a function secret

```bash
supabase secrets set RESEND_API_KEY=re_your_real_key_here
```

Optional overrides (defaults are baked into the code):
```bash
supabase secrets set OWNER_EMAIL=cyrildave.legaspi@gmail.com
supabase secrets set ADMIN_URL=https://grow-modern-hub.vercel.app/admin
supabase secrets set FROM_ADDRESS="GreenGrows <onboarding@resend.dev>"
```

### 4. Deploy the functions

```bash
supabase functions deploy notify-quote
supabase functions deploy notify-contact
```

Each deploys in ~30 seconds. The CLI prints the function's invocation URL.

---

## Wire the Database Webhooks

Supabase invokes these functions automatically when a row is inserted. Configure once per table.

1. Open Supabase dashboard → **Database → Webhooks** → **Create a new hook**.
2. **For `notify-quote`:**
   - Name: `quotes-notify`
   - Table: `quotes`
   - Events: ✅ Insert (uncheck Update, Delete)
   - Method: `POST`
   - URL: paste the `notify-quote` function URL from step 4 above
   - HTTP Headers: leave default
   - HTTP Params: leave empty
   - Save.
3. **Repeat for `notify-contact`:**
   - Name: `contacts-notify`
   - Table: `contacts`
   - Events: ✅ Insert
   - URL: the `notify-contact` function URL
   - Save.

---

## Test it

After deploying + wiring webhooks, submit a real quote on `/products` (or the contact form on `/`):

- Your inbox (cyrildave.legaspi@gmail.com) should receive an owner notification within ~3 seconds.
- For quotes, the customer's email should also receive a confirmation.

### Debug a failed delivery

If no email arrives:

1. **Supabase Dashboard → Database → Webhooks → click the webhook → Logs** — see the HTTP response code from the function. 2xx means the function ran; 5xx means it errored out.
2. **Supabase Dashboard → Edge Functions → notify-quote (or notify-contact) → Logs** — see the function's stdout/stderr. The function logs the Resend API error if delivery failed.
3. **Resend Dashboard → Emails** — every send attempt shows here with deliverability status (sent, bounced, complained).

Common causes:
- `RESEND_API_KEY` not set or wrong → "RESEND_API_KEY is not configured" in function logs.
- API key revoked → Resend returns 401.
- Email landed in spam → check Resend's "delivered" status; the email did send.

---

## Local development (optional)

To test the function locally before deploying:

```bash
supabase functions serve notify-quote --env-file .env.local
# Function runs at http://localhost:54321/functions/v1/notify-quote
```

You can POST a fake webhook payload with curl:

```bash
curl -X POST http://localhost:54321/functions/v1/notify-quote \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "quotes",
    "record": {
      "id": "test-1234",
      "created_at": "2026-05-13T00:00:00Z",
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+63 917 000 0000",
      "product": "NPK 20-20-20",
      "quantity": "100 bags",
      "message": "Test message",
      "status": "pending",
      "admin_notes": null
    }
  }'
```

Requires `.env.local` to define `RESEND_API_KEY`. Different from the frontend `.env.local` — for functions, put it in `supabase/.env.local`.
