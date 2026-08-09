const config = require("../config/env");
const { verifySmtpConnection, sendEmail } = require("../services/emailService");

const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
const missing = required.filter((k) => !config[k]);
if (missing.length) {
  missing.forEach((k) => console.error(`Missing: ${k}`));
  console.error("Fill in all required SMTP environment variables in backend/.env");
  process.exit(1);
}

console.log("=== SMTP Configuration ===");
console.log(`  Host: ${config.SMTP_HOST}`);
console.log(`  Port: ${config.SMTP_PORT}`);
console.log(`  User: ${config.SMTP_USER}`);
console.log(`  From: ${config.EMAIL_FROM}`);
console.log(`  Pass length: ${config.SMTP_PASS.length} characters`);
console.log(`  Pass has spaces: ${/\s/.test(config.SMTP_PASS)}`);
console.log("");

(async () => {
  console.log("Testing SMTP connection...");
  const verified = await verifySmtpConnection();

  if (!verified) {
    console.log("\n=== DIAGNOSIS ===");
    if (/\s/.test(config.SMTP_PASS)) {
      console.log("PROBLEM: SMTP_PASS contains spaces. Google App Passwords are 16 characters without spaces.");
    }
    if (config.SMTP_PASS.length < 10) {
      console.log("PROBLEM: SMTP_PASS is too short. App Passwords are 16 characters.");
    }
    if (config.SMTP_PASS.length > 20) {
      console.log("NOTE: SMTP_PASS is longer than expected for an App Password.");
    }
    console.log("\nGmail SMTP Requirements:");
    console.log("  1. Enable 2-Step Verification: https://myaccount.google.com/security");
    console.log("  2. Generate App Password:      https://myaccount.google.com/apppasswords");
    console.log("  3. Copy the 16-character password (no spaces) into SMTP_PASS");
    process.exit(1);
  }

  const testTo = process.argv[2] || config.SMTP_USER;
  console.log(`Sending test email to: ${testTo}\n`);

  const result = await sendEmail({
    to: testTo,
    subject: "Test Email from MOVIEMAX",
    html: "<h1>Test Email</h1><p>If you receive this, SMTP is working correctly.</p>",
  });

  if (result.success) {
    console.log("TEST PASSED: Email sent successfully!");
    console.log(`  Message ID: ${result.messageId}`);
    if (result.accepted?.length) console.log(`  Accepted: ${result.accepted.join(", ")}`);
    if (result.rejected?.length) console.log(`  Rejected: ${result.rejected.join(", ")}`);
  } else {
    console.log("TEST FAILED: Could not send email.");
    console.log(`  Error: ${result.error}`);
    process.exit(1);
  }
})();
