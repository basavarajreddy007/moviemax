const axios = require("axios");

async function run() {
  const baseUrl = (process.env.SERVER_URL || "http://localhost:5000").replace(/\/$/, "");
  const email = `test_flow_${Date.now()}@example.com`;
  const password = "password123";
  const name = "Flow Test User";

  console.log("=== STEP 1: Registration ===");
  try {
    const regRes = await axios.post(`${baseUrl}/api/auth/register`, {
      name,
      email,
      password
    });
    console.log("Registration Status:", regRes.status);
    console.log("Registration Response:", regRes.data);

    const regOtp = regRes.data.data.otp;
    console.log("Registration OTP:", regOtp);

    console.log("\n=== STEP 2: Verify Registration OTP ===");
    const verifyRes = await axios.post(`${baseUrl}/api/auth/verify-otp`, {
      email,
      otp: regOtp
    });
    console.log("Verify Registration OTP Status:", verifyRes.status);
    console.log("Verify Registration OTP Response:", verifyRes.data);

    const token = verifyRes.data.data.token;
    console.log("Token:", token);

    console.log("\n=== STEP 3: Login ===");
    const loginRes = await axios.post(`${baseUrl}/api/auth/login`, {
      email,
      password
    });
    console.log("Login Status:", loginRes.status);
    console.log("Login Response:", loginRes.data);

    const loginOtp = loginRes.data.data.otp;
    console.log("Login OTP:", loginOtp);

    console.log("\n=== STEP 4: Verify Login OTP ===");
    const verifyLoginRes = await axios.post(`${baseUrl}/api/auth/verify-login-otp`, {
      email,
      otp: loginOtp
    });
    console.log("Verify Login OTP Status:", verifyLoginRes.status);
    console.log("Verify Login OTP Response:", verifyLoginRes.data);

    const jwtToken = verifyLoginRes.data.data.token;
    console.log("JWT Token:", jwtToken);

    console.log("\n=== STEP 5: Request Protected Route ===");
    const meRes = await axios.get(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`
      }
    });
    console.log("Me Route Status:", meRes.status);
    console.log("Me Route Response:", meRes.data);

  } catch (error) {
    console.error("Error in auth flow:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

run();
