const net = require("net");
const dns = require("dns");

function probe(host, port, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    const finish = (ok, detail) => {
      socket.destroy();
      resolve({ host, port, ok, ms: Math.round(Date.now() - start), detail });
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true, "connected"));
    socket.once("timeout", () => finish(false, "ETIMEDOUT"));
    socket.once("error", (err) => finish(false, err.code || err.message));
    socket.connect(port, host);
  });
}

async function smtpProbe(req, res) {
  const named = [
    ["smtp.gmail.com", 465, "Gmail SSL"],
    ["smtp.gmail.com", 587, "Gmail STARTTLS"],
    ["smtp-relay.gmail.com", 465, "Gmail Relay SSL"],
    ["smtp-relay.gmail.com", 587, "Gmail Relay STARTTLS"],
    ["smtp.zoho.com", 587, "Zoho STARTTLS"],
    ["mail.brevo.com", 587, "Brevo STARTTLS"],
    ["smtp.sendgrid.net", 587, "SendGrid STARTTLS"],
  ];

  const pins = [];
  try {
    const addrs = await dns.promises.resolve4("smtp.gmail.com");
    for (const a of addrs.slice(0, 3)) {
      for (const p of [25, 465, 587]) {
        pins.push([a, p, "gmail-ip"]);
      }
    }
  } catch {
    pins.push(["142.251.8.108", 587, "gmail-ip-fallback"]);
  }

  const jobs = [];
  for (const [h, p, label] of named) {
    jobs.push(probe(h, p).then((r) => ({ ...r, label })));
  }
  for (const [h, p, label] of pins) {
    jobs.push(probe(h, p).then((r) => ({ ...r, label })));
  }

  const settled = await Promise.allSettled(jobs);
  const results = settled
    .filter((x) => x.status === "fulfilled")
    .map((x) => x.value);

  res.json({
    success: true,
    renderedAt: new Date().toISOString(),
    requests: results.length,
    results,
  });
}

module.exports = { smtpProbe };