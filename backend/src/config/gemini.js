// Backward-compatible barrel export — delegates to focused modules.
// Prefer importing from './gemini/client', './gemini/foodAnalyzer', or
// './gemini/planSuggester' in new code.

const client = require('./gemini/client');
const foodAnalyzer = require('./gemini/foodAnalyzer');
const planSuggester = require('./gemini/planSuggester');

module.exports = {
  // Client
  genAI: client.genAI,
  genAI_legacy: client.genAI_legacy,
  genAI_new: client.genAI_new,
  callGeminiWithFallback: client.callGeminiWithFallback,
  withTimeout: client.withTimeout,
  TEXT_TIMEOUT_MS: client.TEXT_TIMEOUT_MS,
  PROVIDER_TIMEOUT_MS: foodAnalyzer.PROVIDER_TIMEOUT_MS,

  // Food analysis
  analyzeFoodImage: foodAnalyzer.analyzeFoodImage,
  validateAndCorrectMacros: foodAnalyzer.validateAndCorrectMacros,
  validateProteinDensity: foodAnalyzer.validateProteinDensity,
  enforceDensityAndAnchor: foodAnalyzer.enforceDensityAndAnchor,

  // Plan suggestion
  suggestPlanForMeal: planSuggester.suggestPlanForMeal,
};
