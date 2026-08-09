const axios = require("axios");

async function run() {
  try {
    const url = "http://localhost:5173/uploads/1783162775644-330652651.mp4";
    console.log("Testing proxy for:", url);
    const res = await axios.head(url);
    console.log("Proxy response status:", res.status);
    console.log("Proxy response headers:", res.headers);
  } catch (error) {
    console.error("Proxy failed:", error.message);
    if (error.response) {
      console.error("Proxy response headers:", error.response.headers);
    }
  }
}
run();
