// Backward-compatible barrel export — delegates to focused modules.
// Prefer importing from './gemini/client', './gemini/foodAnalyzer', or
// './gemini/planSuggester' in new code.

const client = require('./gemini/client');
const foodAnalyzer = require('./gemini/foodAnalyzer');
const planSuggester = require('./gemini/planSuggester');

module.exports = {
  // Client
  callGeminiWithFallback: client.callGeminiWithFallback,
  withTimeout: client.withTimeout,
  TEXT_TIMEOUT_MS: client.TEXT_TIMEOUT_MS,

  // Food analysis
  analyzeFoodImage: foodAnalyzer.analyzeFoodImage,

  // Plan suggestion
  suggestPlanForMeal: planSuggester.suggestPlanForMeal,
};
