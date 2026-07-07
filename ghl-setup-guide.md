# GoHighLevel setup guide

This connects the audit to GHL: it saves each lead with their scores, then emails
them their results. Do these four steps in order. Budget ~30 minutes the first time.

The data the audit sends looks like this (one POST per completed audit):

```json
{
  "email": "john@example.com",
  "overall_tax": 5.4,
  "band": "Moderate–High",
  "man": 7.2, "lover": 3.1, "father": 4.8, "leader": 5.5, "producer": 6.0,
  "overall_pct": 54,
  "man_pct": 72, "lover_pct": 31, "father_pct": 48, "leader_pct": 55, "producer_pct": 60,
  "heaviest": "Man", "lightest": "Lover",
  "refer": false,
  "has_partner": true, "has_children": true,
  "submitted_at": "2026-07-08T12:00:00.000Z"
}
```

---

## Step 1 — Create the custom fields

In GHL: **Settings → Custom Fields → Add Field**. Create each of these (type
**Single Line / Text** is fine for all of them). The **field key** is what the
merge tokens use, so match them exactly.

| Field name          | Field key (auto-generated, verify it)  | Holds                    |
|---------------------|----------------------------------------|--------------------------|
| Alcohol Tax         | `alcohol_tax`                          | overall score, e.g. 5.4  |
| Alcohol Band        | `alcohol_band`                         | Low / Moderate / etc.    |
| Man Score           | `man_score`                            | 7.2                      |
| Lover Score         | `lover_score`                          | 3.1                      |
| Father Score        | `father_score`                         | 4.8                      |
| Leader Score        | `leader_score`                         | 5.5                      |
| Producer Score      | `producer_score`                       | 6.0                      |
| Man Pct             | `man_pct`                              | 72                       |
| Lover Pct           | `lover_pct`                            | 31                       |
| Father Pct          | `father_pct`                           | 48                       |
| Leader Pct          | `leader_pct`                           | 55                       |
| Producer Pct        | `producer_pct`                         | 60                       |
| Heaviest Dimension  | `heaviest_dimension`                   | Man                      |
| Lightest Dimension  | `lightest_dimension`                   | Lover                    |
| Morning Flag        | `morning_flag`                         | true / false (the screen)|

> The `_pct` fields (0–100) are only used to draw the bar widths in the email.
> The `_score` fields (0–10) are the numbers people actually read.

---

## Step 2 — Create the inbound webhook (the workflow trigger)

1. Go to **Automation → Workflows → Create Workflow → Start from scratch**.
2. Add a trigger → choose **Inbound Webhook**.
3. GHL shows you a **webhook URL**. Copy it. This is the value you'll paste into
   Vercel as `GHL_WEBHOOK_URL` (see README.md, step 4). **Keep it private.**
4. To let GHL "learn" the field names, it wants a sample payload. Easiest way:
   deploy the site first (README steps 1–4), complete one real audit with your own
   email, and GHL will capture that sample automatically. Or paste the sample JSON
   above into GHL's "Fetch sample" box if your version supports it.

---

## Step 3 — Map the webhook data onto the contact

Still in the workflow, after the trigger:

1. Add action → **Create/Update Contact** (or **Upsert Contact**).
2. Set **Email** = the inbound webhook's `email` value (pick it from the field
   picker — it appears as `{{inboundWebhookRequest.email}}` or similar).
3. Map each custom field to its matching webhook value:
   - `Alcohol Tax` ← `overall_tax`
   - `Alcohol Band` ← `band`
   - `Man Score` ← `man`, `Lover Score` ← `lover`, … (all five)
   - `Man Pct` ← `man_pct`, … (all five)
   - `Heaviest Dimension` ← `heaviest`, `Lightest Dimension` ← `lightest`
   - `Morning Flag` ← `refer`
4. Optionally add a **Tag** like `clarity-audit-lead` so these are easy to find.

---

## Step 4 — Send the results email

Add a **Send Email** action after the contact update.

1. Click to build the email, add a **Custom HTML / Code** element.
2. Open `results-email.html` (in this folder), copy all of it, paste it in.
3. The booking link is already set to
   `https://www.empoweredman.co/strategy-session?el=clarityaudit`. Change it here
   if you ever need a different destination.
4. Set the **From** name/address to whatever GHL sending identity you want to use
   (this uses GHL's own email sending — it does **not** touch your Resend domain).
5. Send yourself a test.

### Optional but recommended — the support-first branch

The audit sets `refer: true` for anyone who reports morning drinking / physical
withdrawal. For those people a hard sell is the wrong move. In the workflow, add
an **If/Else** right after the contact update:

- **If** `Morning Flag` (or the webhook `refer`) **is true** → send a short,
  supportive email (point them to talk to a doctor first; SAMHSA 1-800-662-4357)
  and **skip** the booking CTA.
- **Else** → send the standard `results-email.html`.

---

## How the pieces connect

```
Visitor finishes audit
        │  POST { email, scores… }
        ▼
  /api/submit  (Vercel function — holds the webhook URL as an env var)
        │  forwards the JSON
        ▼
  GHL Inbound Webhook  →  Update Contact (custom fields)  →  Send results email
```

That's the whole loop. No database, no Resend, nothing to upgrade.
