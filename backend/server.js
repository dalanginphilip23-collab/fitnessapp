require("dotenv").config();

const REQUIRED_ENV = ["JWT_SECRET", "CLIENT_URL"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const { server } = require("./src/app");

// ============================
// Start Server
// ============================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("================================");
  console.log("🚀 Vitalis Backend Started");
  console.log("================================");
  console.log(`PORT: ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`);
});
