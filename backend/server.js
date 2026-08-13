const dns = require("dns");
// Force IPv4-first DNS resolution. Some hosts (e.g. Render) can resolve
// smtp.gmail.com to an IPv6 (AAAA) address that has no working route, which
// made nodemailer fail with "connect ENETUNREACH <ipv6>::465". Preferring
// IPv4 fixes outbound SMTP reliably on those platforms (Node >= 17).
dns.setDefaultResultOrder("ipv4first");

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
