if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

require("dotenv").config();

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
