const nodemailer = require("nodemailer");

function text(value, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  // Simple origin check; also configure Vercel deployment protection/rate limits for production.
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) return res.status(403).json({ error: "Request origin not allowed." });
    } catch {
      return res.status(403).json({ error: "Invalid request origin." });
    }
  }

  const { SMTP_USER, SMTP_PASS, APPEAL_TO, SUPPORT_TO } = process.env;
  if (!SMTP_USER || !SMTP_PASS || !APPEAL_TO) {
    return res.status(503).json({
      error: "Email service is not configured. Add SMTP_USER, SMTP_PASS and APPEAL_TO in Vercel Environment Variables."
    });
  }

  const body = req.body || {};
  const owner = text(body.owner, 80);
  const countryCode = text(body.countryCode, 8);
  const phone = text(body.phone, 20).replace(/\D/g, "");
  const reason = text(body.reason, 700);
  const message = text(body.message, 5000);

  if (!owner || !countryCode.startsWith("+") || phone.length < 6 || phone.length > 15 || !message) {
    return res.status(400).json({ error: "Please provide a valid name, phone number and appeal message." });
  }

  // Email is sent to the address configured by the site owner, not to arbitrary user-supplied recipients.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  try {
    await transporter.sendMail({
      from: `"SIRIMATH Appeal Assistant" <${SMTP_USER}>`,
      to: APPEAL_TO,
      ...(SUPPORT_TO ? { replyTo: SUPPORT_TO } : {}),
      subject: `WhatsApp account review request — ${countryCode}${phone}`,
      text: `A user submitted an account review request through your website.\n\nOwner name: ${owner}\nAccount number: ${countryCode}${phone}\n\nAppeal draft:\n\n${message}\n\nAdditional context:\n${reason || "(not provided)"}\n\nNote: This is a user-submitted appeal draft. Review the details before forwarding it to WhatsApp Support.`,
      textEncoding: "quoted-printable"
    });
    return res.status(200).json({
      ok: true,
      message: "Appeal request email delivered to the configured inbox. This does not mean WhatsApp has received it or lifted the restriction."
    });
  } catch (error) {
    console.error("Email send failed:", error && error.message ? error.message : "unknown error");
    return res.status(502).json({ error: "Email could not be sent. Check the Gmail App Password and Vercel environment variables." });
  }
};
