# The Clarity Audit — GHL edition

A self-contained web audit that captures leads into GoHighLevel and emails each
person their results. No database, no Resend, nothing to upgrade.

**Stack:** GitHub (code) + Vercel (hosting + one serverless function) + your
existing GoHighLevel (leads + email).

```
index.html            The audit (React in a single file, runs in the browser)
api/submit.js         Serverless function — forwards each lead to GHL
results-email.html    Paste-in HTML for the GHL results email
ghl-setup-guide.md    Step-by-step GHL configuration
README.md             This file
```

## How it works

1. A visitor completes the audit and enters their email.
2. The page POSTs their email + scores to `/api/submit` (same origin — no CORS,
   no keys in the browser).
3. `api/submit.js` forwards that JSON to your **GHL inbound webhook** (URL stored
   as a private Vercel environment variable).
4. A GHL workflow saves the contact and sends the results email.

## What's already filled in

- **Booking link.** The CTA points to
  `https://www.empoweredman.co/strategy-session?el=clarityaudit` in both
  `index.html` (the `BOOKING_URL` constant) and `results-email.html`.

## The one thing you still need to set

- **The GHL webhook URL.** You get this in `ghl-setup-guide.md` step 2, then paste
  it into Vercel as the `GHL_WEBHOOK_URL` environment variable (below). It is never
  placed in the page source.

## Deploy (about 10 minutes)

### 1. Put the code on GitHub
- Create a new repository (e.g. `clarity-audit`).
- Upload these files, keeping `api/submit.js` inside an `api/` folder.

### 2. Import into Vercel
- vercel.com → **Add New → Project → Import** your GitHub repo.
- Framework preset: **Other** (it's a static page + an `api/` function; no build
  step needed). Click **Deploy**.

### 3. Add the environment variable
- In Vercel: **Project → Settings → Environment Variables**.
- Add `GHL_WEBHOOK_URL` = the inbound webhook URL from GHL (guide step 2).
- **Redeploy** so the variable takes effect (Deployments → ⋯ → Redeploy).

### 4. Finish the GHL side
- Follow `ghl-setup-guide.md` to create the fields, workflow, and email.

### 5. Test end to end
- Open your Vercel URL, take the audit with your own email.
- Confirm: the contact appears in GHL with the scores, and the results email
  arrives. If the contact appears but no email, re-check the workflow's Send Email
  step. If nothing appears, re-check `GHL_WEBHOOK_URL` in Vercel.

## Free-tier notes

- **Vercel Hobby** hosts this fine.
- **GHL** handles all leads and email — this uses your existing account and does
  not touch your Resend domain.
- Supabase and Resend are **not used** in this build.

## Local preview (optional)

The audit compiles React in the browser, so you can just open `index.html` in a
browser to click through the UI. The `/api/submit` call only works once deployed
to Vercel (it needs the serverless function), so lead capture won't fire from a
plain local file — that's expected.
