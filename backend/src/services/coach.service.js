const { callGeminiWithFallback } = require('../config/gemini');

async function getCoachReply(prompt, system) {
  const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
  return callGeminiWithFallback(fullPrompt);
}

module.exports = { getCoachReply };
