const test = require("node:test");
const assert = require("node:assert");
const dns = require("dns");
const nodemailer = require("nodemailer");

// Regression tests for services/mail/index.js:
//  1. sendEmail must be exported (it is destructured by feedback.service,
//     forgotPassword.service and scripts/test-email.js — a missing export
//     previously made those calls throw TypeError).
//  2. sendWelcomeEmail must route through the unified sendEmail path so it
//     falls back to Brevo/Resend when SMTP is down, like every other sender.

const ENV_KEYS = [
  "EMAIL_USER",
  "EMAIL_PASS",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "RESEND_API_KEY",
];

const savedEnv = {};
for (const key of ENV_KEYS) savedEnv[key] = process.env[key];

const originalFetch = globalThis.fetch;
const originalLookup = dns.promises.lookup;
const originalCreateTransport = nodemailer.createTransport;

let mailer;

test.before(() => {
  process.env.EMAIL_USER = "vitalis@example.com";
  process.env.EMAIL_PASS = "app-password";
  process.env.BREVO_API_KEY = "test-brevo-key";
  process.env.BREVO_SENDER_EMAIL = "sender@example.com";
  delete process.env.RESEND_API_KEY;

  // Avoid real DNS + SMTP handshakes: answer the lookup, hand back a transport
  // that verifies but rejects every send so the unified sender must fall back.
  dns.promises.lookup = async () => ({ address: "127.0.0.1" });
  nodemailer.createTransport = () => ({
    verify: async () => true,
    sendMail: async () => {
      throw new Error("smtp down (simulated)");
    },
  });

  const modulePath = require.resolve("../src/services/mail");
  delete require.cache[modulePath];
  mailer = require(modulePath);
});

test.after(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  globalThis.fetch = originalFetch;
  dns.promises.lookup = originalLookup;
  nodemailer.createTransport = originalCreateTransport;
});

test("sendEmail is exported", () => {
  assert.strictEqual(typeof mailer.sendEmail, "function");
});

test("sendWelcomeEmail falls back to Brevo when SMTP fails", async () => {
  let brevoBody = null;
  globalThis.fetch = async (url, options) => {
    brevoBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ messageId: "brevo-mock-id" }),
    };
  };

  const result = await mailer.sendWelcomeEmail("user@example.com", "Test");

  assert.ok(brevoBody, "expected a Brevo HTTP request after SMTP failure");
  assert.strictEqual(brevoBody.to[0].email, "user@example.com");
  assert.strictEqual(brevoBody.subject, "⚡ Welcome to Vitalis Performance OS");
  assert.strictEqual(result.messageId, "brevo-mock-id");
});