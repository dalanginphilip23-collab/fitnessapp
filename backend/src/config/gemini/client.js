const Groq = require("groq-sdk");
const logger = require('../../utils/logger');

let genAI_new = null;
let genAI_legacy = null;
try {
  const { GoogleGenAI } = require("@google/genai");
  genAI_new = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  logger.warn("[VITALIS AI] @google/genai not available, will use legacy SDK only:", e.message);
}
try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  genAI_legacy = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (e) {
  logger.warn("[VITALIS AI] legacy @google/generative-ai not available:", e.message);
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PRIMARY_GEMINI_MODEL = "gemini-3.6-flash";

const TEXT_TIMEOUT_MS = 15000;

function withTimeout(promiseFactory, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
  });
  const p = typeof promiseFactory === 'function' ? promiseFactory() : promiseFactory;
  return Promise.race([p, timeout]).finally(
    () => clearTimeout(timer)
  );
}

async function callViaNewSDK(prompt) {
  if (!genAI_new) throw new Error("New SDK not initialized");
  const res = await genAI_new.models.generateContent({
    model: PRIMARY_GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 2000, temperature: 0.3 },
  });
  return res.text || res.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callViaLegacy(prompt, modelName) {
  if (!genAI_legacy) throw new Error("Legacy SDK not initialized");
  const model = genAI_legacy.getGenerativeModel({
    model: modelName,
    generationConfig: { maxOutputTokens: 1000, temperature: 0.3 },
  });
  const run = () => model.generateContent(prompt).then(r => r.response.text());
  return withTimeout(run, TEXT_TIMEOUT_MS, `text-${modelName}`);
}

async function callGeminiWithFallback(prompt, opts = {}) {
  const legacyModels = ["gemini-2.0-flash"];

  if (genAI_new) {
    try {
      logger.info(`[VITALIS AI] Trying ${PRIMARY_GEMINI_MODEL} (new SDK)...`);
      const text = await withTimeout(() => callViaNewSDK(prompt), TEXT_TIMEOUT_MS, `text-${PRIMARY_GEMINI_MODEL}-new`);
      if (text) {
        logger.info(`[VITALIS AI] Success with ${PRIMARY_GEMINI_MODEL} (new SDK)`);
        return text;
      }
    } catch (err) {
      if (String(err.message).includes('timed out')) logger.error(`[VITALIS AI] ${err.message}`);
      else logger.error(`[VITALIS AI] ${PRIMARY_GEMINI_MODEL} (new SDK) failed:`, err.message);
      await new Promise(r => setTimeout(r, 500));
    }
  }

  for (const modelName of legacyModels) {
    try {
      logger.info(`[VITALIS AI] Trying ${modelName}...`);
      const text = await callViaLegacy(prompt, modelName);
      if (text) {
        logger.info(`[VITALIS AI] Success with ${modelName}`);
        return text;
      }
    } catch (err) {
      if (String(err.message).includes('timed out')) logger.error(`[VITALIS AI] ${err.message}`);
      else logger.error(`[VITALIS AI] ${modelName} failed:`, err.message);
      await new Promise(r => setTimeout(r, 500));
    }
  }

  logger.warn("[VITALIS AI] All Gemini text models failed -> Groq fallback");
  try {
    const resp = await withTimeout(
      () => groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
      TEXT_TIMEOUT_MS,
      "groq-fallback",
    );
    let text = resp.choices[0]?.message?.content || "";
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/<think>[\s\S]*$/g, '').trim();
    if (text) {
      logger.info("[VITALIS AI] Success with Groq qwen/qwen3.6-27b");
      return text;
    }
  } catch (groqErr) {
    logger.error("[VITALIS AI] Groq fallback failed:", groqErr.message);
  }

  logger.warn("[VITALIS AI] All models failed - returning static fallback");
  return "I'm currently experiencing high demand. Please try again in a moment.";
}

module.exports = {
  genAI: genAI_legacy,
  genAI_legacy,
  genAI_new,
  groq,
  PRIMARY_GEMINI_MODEL,
  callGeminiWithFallback,
  withTimeout,
  TEXT_TIMEOUT_MS,
};
