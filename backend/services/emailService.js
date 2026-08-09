const nodemailer = require("nodemailer");
const config = require("../config/env");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!config.SMTP_ENABLED) {
    console.warn("SMTP is disabled. Email sending is currently disabled.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    tls: { rejectUnauthorized: config.IS_PRODUCTION },
  });

  return transporter;
};

const verifySmtpConnection = async () => {
  if (!config.SMTP_ENABLED) {
    console.warn("SMTP is disabled. Skipping SMTP verification.");
    return true;
  }

  try {
    const transport = getTransporter();
    if (!transport) {
      throw new Error("SMTP transport is not configured.");
    }
    await transport.verify();
    console.log("SMTP Connected - Email service ready");
    return true;
  } catch (error) {
    if (error.code === "EAUTH") {
      console.error("SMTP Authentication Failed.");
      console.error("  Cause: Invalid SMTP_USER or SMTP_PASS.");
      console.error("  Fix: If using Gmail, generate a Google App Password at:");
      console.error("  https://myaccount.google.com/apppasswords");
    } else if (error.code === "ESOCKET") {
      console.error(`SMTP Connection Timeout / DNS Error.`);
      console.error(`  Cause: Cannot reach ${config.SMTP_HOST}:${config.SMTP_PORT}`);
      console.error(`  Try: telnet ${config.SMTP_HOST} ${config.SMTP_PORT}`);
    } else if (error.code === "ECONNREFUSED") {
      console.error("SMTP Connection Refused.");
      console.error(`  Cause: Server rejected the connection on port ${config.SMTP_PORT}`);
      console.error("  Fix: Gmail uses port 587 (STARTTLS) or 465 (SSL). Verify SMTP_PORT.");
    } else {
      console.error("SMTP Verification Failed:", error.message);
    }
    return false;
  }
};

const sendEmail = async ({ to, subject, html }, retries = 2) => {
  const transport = getTransporter();
  if (!transport) {
    const message = "SMTP is disabled or misconfigured. Email cannot be sent.";
    console.warn(message);
    return { success: false, error: message };
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const info = await transport.sendMail({
        from: `"MOVIEMAX" <${config.EMAIL_FROM}>`,
        to,
        subject,
        html,
      });

      if (info.messageId) console.log(`Email sent: ${info.messageId} to ${to}`);
      if (info.accepted?.length) console.log(`  Accepted: ${info.accepted.join(", ")}`);
      if (info.rejected?.length) console.log(`  Rejected: ${info.rejected.join(", ")}`);
      if (info.response) console.log(`  SMTP Response: ${info.response}`);

      return { success: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const logLevel = isLastAttempt ? console.error : console.warn;
      logLevel(`Email send attempt ${attempt + 1}/${retries + 1} failed:`);
      logLevel(`  To: ${to}, Subject: ${subject}`);
      logLevel(`  Error: ${error.message}`);
      if (isLastAttempt) console.error(error.stack);

      const isRetryable =
        error.code === "ETIMEOUT" || error.code === "ESOCKET" || error.code === "ECONNREFUSED";
      if (isLastAttempt || !isRetryable) {
        return { success: false, error: error.message, code: error.code, command: error.command };
      }
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return { success: false, error: "Exhausted all retry attempts" };
};

const sendOtpEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Your OTP for Email Verification",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#0B0B0B;font-family:'Segoe UI',sans-serif}
.container{max-width:600px;margin:0 auto;padding:40px 20px}
.logo{font-size:32px;font-weight:700;color:#E50914;letter-spacing:2px;text-align:center;padding:30px 0}
.content{background:linear-gradient(135deg,#1F1F1F,#2A2A2A);border-radius:16px;padding:40px;text-align:center}
.otp-code{display:inline-block;background:#0B0B0B;color:#FFD54F;font-size:48px;font-weight:700;letter-spacing:12px;padding:20px 40px;border-radius:12px;margin:20px 0}
.footer{text-align:center;padding:30px 0;color:#666;font-size:12px}
</style></head><body>
<div class="container">
  <div class="logo">MOVIEMAX</div>
  <div class="content">
    <h2 style="color:#fff;margin-bottom:20px">Email Verification</h2>
    <p style="color:#B3B3B3">Use the following OTP to verify your email address</p>
    <div class="otp-code">${otp}</div>
    <p style="color:#B3B3B3;font-size:14px">Valid for <span style="color:#E50914">10 minutes</span>. Do not share this code.</p>
  </div>
  <div class="footer">&copy; 2026 MOVIEMAX. All rights reserved.</div>
</div></body></html>`,
  });
};

const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: "Welcome to MOVIEMAX!",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#0B0B0B;font-family:'Segoe UI',sans-serif}
.container{max-width:600px;margin:0 auto;padding:40px 20px}
.logo{font-size:32px;font-weight:700;color:#E50914;letter-spacing:2px;text-align:center;padding:30px 0}
.content{background:linear-gradient(135deg,#1F1F1F,#2A2A2A);border-radius:16px;padding:40px;text-align:center}
.btn{display:inline-block;background:#E50914;color:#fff;text-decoration:none;padding:15px 40px;border-radius:8px;font-size:16px;font-weight:600}
.footer{text-align:center;padding:30px 0;color:#666;font-size:12px}
</style></head><body>
<div class="container">
  <div class="logo">MOVIEMAX</div>
  <div class="content">
    <h2 style="color:#fff">Welcome, ${name}!</h2>
    <p style="color:#B3B3B3;font-size:16px;line-height:1.8">Your account has been created. Start exploring thousands of movies, TV shows, and web series.</p>
    <a href="${config.CLIENT_URL}/" class="btn">Start Watching</a>
  </div>
  <div class="footer">&copy; 2026 MOVIEMAX. All rights reserved.</div>
</div></body></html>`,
  });
};

const sendPasswordResetOtp = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Password Reset OTP",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#0B0B0B;font-family:'Segoe UI',sans-serif}
.container{max-width:600px;margin:0 auto;padding:40px 20px}
.logo{font-size:32px;font-weight:700;color:#E50914;letter-spacing:2px;text-align:center;padding:30px 0}
.content{background:linear-gradient(135deg,#1F1F1F,#2A2A2A);border-radius:16px;padding:40px;text-align:center}
.otp-code{display:inline-block;background:#0B0B0B;color:#FFD54F;font-size:48px;font-weight:700;letter-spacing:12px;padding:20px 40px;border-radius:12px;margin:20px 0}
.footer{text-align:center;padding:30px 0;color:#666;font-size:12px}
</style></head><body>
<div class="container">
  <div class="logo">MOVIEMAX</div>
  <div class="content">
    <h2 style="color:#fff">Password Reset Request</h2>
    <p style="color:#B3B3B3">Use the following OTP to reset your password</p>
    <div class="otp-code">${otp}</div>
    <p style="color:#B3B3B3;font-size:14px">Valid for <span style="color:#E50914">10 minutes</span>. If you didn't request this, ignore this email.</p>
  </div>
  <div class="footer">&copy; 2026 MOVIEMAX. All rights reserved.</div>
</div></body></html>`,
  });
};

const sendSubscriptionConfirmation = async (email, planName, amount) => {
  return sendEmail({
    to: email,
    subject: "Subscription Confirmed!",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;padding:0;background:#0B0B0B;font-family:'Segoe UI',sans-serif}
.container{max-width:600px;margin:0 auto;padding:40px 20px}
.logo{font-size:32px;font-weight:700;color:#E50914;letter-spacing:2px;text-align:center;padding:30px 0}
.content{background:linear-gradient(135deg,#1F1F1F,#2A2A2A);border-radius:16px;padding:40px;text-align:center}
.plan-name{display:inline-block;background:#E50914;color:#fff;font-size:20px;font-weight:700;padding:10px 30px;border-radius:8px;margin:20px 0}
.btn{display:inline-block;background:#E50914;color:#fff;text-decoration:none;padding:15px 40px;border-radius:8px;font-size:16px;font-weight:600;margin-top:20px}
.footer{text-align:center;padding:30px 0;color:#666;font-size:12px}
</style></head><body>
<div class="container">
  <div class="logo">MOVIEMAX</div>
  <div class="content">
    <div style="font-size:64px">&#10004;</div>
    <h2 style="color:#fff">Subscription Confirmed!</h2>
    <div class="plan-name">${planName}</div>
    <p style="color:#B3B3B3;font-size:16px">Amount: ${amount}</p>
    <p style="color:#B3B3B3">Thank you for subscribing! Enjoy unlimited access to premium content.</p>
    <a href="${config.CLIENT_URL}/" class="btn">Start Watching</a>
  </div>
  <div class="footer">&copy; 2026 MOVIEMAX. All rights reserved.</div>
</div></body></html>`,
  });
};

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendPasswordResetOtp,
  sendSubscriptionConfirmation,
  verifySmtpConnection,
  getTransporter,
  sendEmail,
};
