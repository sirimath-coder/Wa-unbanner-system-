# SIRIMATH WhatsApp Appeal Assistant — Vercel

## Files
- `index.html` — animated frontend
- `api/send.js` — Vercel serverless email endpoint
- `package.json` — Nodemailer dependency
- `vercel.json` — function configuration

## What this app does
It emails a submitted appeal draft to the site owner's configured inbox. It does **not** automatically submit the appeal to WhatsApp and cannot unban an account. After reviewing the email, the account owner should use WhatsApp's official contact/support channel.

## Deploy to Vercel
1. Upload this folder to a GitHub repository, or import the repository into Vercel.
2. In Vercel project → Settings → Environment Variables, add:
   - `SMTP_USER` = `devsirimath@gmail.com`
   - `SMTP_PASS` = your Google **App Password** (not your normal Gmail password)
   - `APPEAL_TO` = `devsirimath@gmail.com`
   - Optional `SUPPORT_TO` = an address you control for replies (leave unset if not needed)
3. Apply the variables to Production (and Preview if you want), then redeploy.
4. Test with your own number/details and verify the email arrives in the configured inbox.

## Gmail App Password
Use Google's official Account security settings. App Passwords require 2-Step Verification and may not be available for some managed/work accounts. Never place the App Password in `index.html`, GitHub, or chat.

## Important delivery detail
This build intentionally sends the form to `APPEAL_TO` (your inbox) for review; it does not send user-submitted content to an arbitrary recipient or claim to contact WhatsApp automatically. Once reviewed, copy/submit the appeal via WhatsApp's official contact channel:
https://www.whatsapp.com/contact/

## Production hardening
- Add Vercel Firewall/rate limiting or a CAPTCHA before public launch.
- Consider an email provider with verified sending domain if Gmail SMTP quotas/availability become a problem.
- Never collect WhatsApp verification codes or account passwords.
- The page says “email delivered to configured inbox” only when SMTP reports success; that is not confirmation of WhatsApp support receipt.
