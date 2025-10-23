# Notifications Cloud Functions

This package provides Firebase Cloud Functions to send email reminders from info@beauty-mirror.com based on user preferences and scheduled Updates.

## What it does
- Reads `Users/{uid}.NotificationPrefs` (emailReminders, weeklyEmail, mobilePush)
- Joins `Users/{uid}/Updates` (task instances for today) with `Users/{uid}.Activities` to compute the scheduled reminder time:
  - If user chose only procedure time → send at that time
  - If `NotifyBefore` is set on Activity → send earlier by that offset
- Sends email via SMTP (Nodemailer) and marks it as sent in `Users/{uid}/NotificationsSent/{updateId}-email` to avoid duplicates.

## Environment variables
Set the following before deploy (for example using GitHub Actions or your hosting platform env):

- `SMTP_HOST` — SMTP server host
- `SMTP_PORT` — SMTP port (465 for SMTPS, otherwise 587)
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password
- `SMTP_FROM` — Sender email (defaults to `info@beauty-mirror.com`)

## Deploy

1. Install dependencies and build:
   - `npm install`
   - `npm run build`
2. Deploy functions:
   - `firebase deploy --only functions`

If your Firebase project uses multiple functions packages/targets, configure your `firebase.json` accordingly to point to this folder (`notifications_functions`).

## Notes / Assumptions
- Updates store `date` as `YYYY-MM-DD` and `time` as `{ hour, minute }` in local user semantics. The function interprets these in UTC for simplicity; to avoid timezone drift, store user TZ in profile and adjust time math accordingly.
- `NotifyBefore` parsing supports values like `15m`, `30m`, `1h`, or `10 minutes`. Unknown formats are treated as 0.
- Weekly summary emails (weeklyEmail) are not implemented yet here — add a separate scheduled function if needed.
