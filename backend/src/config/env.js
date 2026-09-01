const logger = require('../utils/logger');

const REQUIRED_VARS = [
  { key: 'DB_HOST', description: 'Database host address' },
  { key: 'DB_USER', description: 'Database user' },
  { key: 'DB_PASS', description: 'Database password' },
  { key: 'DB_NAME', description: 'Database name' },
  { key: 'JWT_SECRET', description: 'Secret for signing JWTs' },
  { key: 'GEMINI_API_KEY', description: 'Google Gemini API key' },
  { key: 'GROQ_API_KEY', description: 'Groq API key' },
  { key: 'GOOGLE_CLIENT_ID', description: 'Google OAuth client ID' },
  { key: 'GOOGLE_CLIENT_SECRET', description: 'Google OAuth client secret' },
  { key: 'BREVO_API_KEY', description: 'Brevo (Sendinblue) API key' },
  { key: 'BREVO_SENDER_EMAIL', description: 'Brevo sender email address' },
];

const OPTIONAL_VARS = [
  { key: 'MIGRATE_TOKEN', description: 'Token for admin migration endpoint' },
];

const URL_VARS = [
  { keys: ['FRONTEND_URL', 'CLIENT_URL'], description: 'Frontend URL for CORS and redirects' },
];

function validateEnv() {
  const missing = [];
  const warnings = [];

  for (const { key, description } of REQUIRED_VARS) {
    if (!process.env[key] || process.env[key].trim() === '') {
      missing.push(`  ✗ ${key} — ${description}`);
    }
  }

  for (const { key, description } of OPTIONAL_VARS) {
    if (!process.env[key] || process.env[key].trim() === '') {
      warnings.push(`  ⚠ ${key} — ${description}`);
    }
  }

  for (const { keys, description } of URL_VARS) {
    const hasAny = keys.some(k => process.env[k] && process.env[k].trim() !== '');
    if (!hasAny) {
      missing.push(`  ✗ ${keys.join(' or ')} — ${description}`);
    }
  }

  if (warnings.length > 0) {
    logger.warn('[Env] Optional variables not set:\n' + warnings.join('\n'));
  }

  if (missing.length > 0) {
    logger.error('[Env] Required environment variables are missing:\n' + missing.join('\n'));
    process.exit(1);
  }

  logger.info('[Env] All required environment variables validated');

  return {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
    FRONTEND_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL,
    CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL,
    MIGRATE_TOKEN: process.env.MIGRATE_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  };
}

module.exports = { validateEnv };
