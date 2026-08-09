const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "..", ".env");
const hasEnvFile = fs.existsSync(envPath);
if (hasEnvFile) {
  dotenv.config({ path: envPath });
} else {
  console.warn("WARN: No .env file found at backend/.env. Falling back to environment variables.");
}

const requiredVariables = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];

const missingRequired = requiredVariables.filter((key) => !process.env[key]);
const issues = [];

if (missingRequired.length > 0) {
  issues.push(`Missing required environment variables: ${missingRequired.join(", ")}`);
}

if (!process.env.CLIENT_URL) {
  console.warn("WARN: CLIENT_URL is not set. CORS will fall back to hardcoded origins.");
}

const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
if (!smtpConfigured) {
  console.warn("WARN: SMTP not fully configured. Email features will be disabled.");
}

if (!process.env.OPENROUTER_API_KEY && !process.env.TINYFISH_API_KEY) {
  console.warn("WARN: No AI API key configured. AI features are disabled.");
}

const validEnvs = ["development", "production", "test"];
if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
  issues.push(`NODE_ENV has an unexpected value: ${process.env.NODE_ENV}. Valid values are: ${validEnvs.join(", ")}`);
}

const port = parseInt(process.env.PORT, 10);
if (process.env.PORT && Number.isNaN(port)) {
  issues.push("PORT must be a valid integer.");
}

if (issues.length > 0) {
  console.error("\nENV VALIDATION ERRORS:");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log("Environment validation passed.");
process.exit(0);
