const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const { server } = require("./src/app");
const { verifyTransport } = require("./src/config/mailer");


// Start Server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("================================");
  console.log("🚀 Vitalis Backend Started");
  console.log("================================");
  console.log(`PORT: ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`);

  verifyTransport();
});
