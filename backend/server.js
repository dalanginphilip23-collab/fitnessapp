require("dotenv").config();

const { server } = require("./src/app");
const { verifyTransport } = require("./src/config/mailer");

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

  // Non-fatal SMTP health check — logs clearly if the Gmail App Password is
  // invalid so nobody thinks verification emails are going out when they aren't.
  verifyTransport();
});
