const axios = require("axios");

async function run() {
  try {
    const url = "http://localhost:5000/uploads/1783162775644-330652651.mp4";
    console.log("Fetching headers for:", url);
    const res = await axios.head(url);
    console.log("Status:", res.status);
    console.log("Headers:", res.headers);
  } catch (error) {
    console.error("Error fetching video:", error.message);
    if (error.response) {
      console.error("Response headers:", error.response.headers);
    }
  }
}
run();
