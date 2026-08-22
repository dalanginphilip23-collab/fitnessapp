const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const FOOD_ANALYSIS_PROMPT = require("../constants/foodAnalysisPrompt");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });


// SECTION 1 — TEXT-ONLY FALLBACK CHAIN

async function callGeminiWithFallback(prompt) {
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
  ];

  for (const modelName of models) {
    try {
      console.log(`[VITALIS AI] Trying ${modelName}...`);
      const model  = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 1000,
          thinkingConfig: { thinkingLevel: "low" },
        },
      });
      const result = await model.generateContent(prompt);
      const text   = result.response.text();
      if (text) {
        console.log(`[VITALIS AI] ✅ Success with ${modelName}`);
        return text;
      }
    } catch (err) {
      console.error(`[VITALIS AI] ❌ ${modelName} failed:`, err.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.warn("[VITALIS AI] All Gemini text models failed → Groq fallback");
  try {
    const resp = await groq.chat.completions.create({
      model:       "openai/gpt-oss-120b",
      max_tokens:  1000,
      temperature: 0.3,
      messages:    [{ role: "user", content: prompt }],
    });
    const text = resp.choices[0]?.message?.content;
    if (text) {
      console.log("[VITALIS AI] ✅ Success with Groq openai/gpt-oss-120b");
      return text;
    }
  } catch (groqErr) {
    console.error("[VITALIS AI] ❌ Groq fallback failed:", groqErr.message);
  }

  console.warn("[VITALIS AI] All models failed — returning static fallback");
  return "I'm currently experiencing high demand. Please try again in a moment.";
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — FOOD IMAGE ANALYSIS (vision)
// ─────────────────────────────────────────────────────────────────────────────
// FOOD_ANALYSIS_PROMPT is imported from ../constants/foodAnalysisPrompt.js —
// see that file for what it contains and why.

// ─── FOOD CATEGORY DETECTION ──────────────────────────────────────────────────

const BREADED_FOOD_KEYWORDS = [
  'fried', 'breaded', 'battered', 'crispy', 'nugget', 'tempura',
  'katsu', 'schnitzel', 'fish and chips', 'popcorn chicken', 'tender',
  'wing', 'drumstick', 'karaage', 'panko', 'chicken piece', 'chickenjoy',
  'kwek', 'fish ball', 'kikiam', 'calamares',
];

const ZERO_CARB_ALLOWED = [
  'grilled chicken breast', 'plain grilled', 'boiled egg', 'hard boiled',
  'steamed fish', 'grilled fish', 'tuna steak', 'salmon fillet',
  'beef steak', 'pork chop grilled', 'shrimp grilled', 'bacon',
  'black coffee', 'coffee', 'tea', 'water', 'diet soda', 'sugar-free',
];

const ZERO_FAT_ALLOWED = [
  'steamed white rice', 'plain rice', 'fruit', 'watermelon', 'banana',
  'apple', 'mango', 'papaya', 'grapes', 'black coffee',
  'garden salad', 'green salad', 'vegetable salad', 'steamed vegetables',
  'tea', 'coffee',
];

function isBreadedFood(foodName = '') {
  const lower = foodName.toLowerCase();
  return BREADED_FOOD_KEYWORDS.some(kw => lower.includes(kw));
}

function isZeroCarbAllowed(foodName = '') {
  const lower = foodName.toLowerCase();
  return ZERO_CARB_ALLOWED.some(kw => lower.includes(kw));
}

function isZeroFatAllowed(foodName = '') {
  const lower = foodName.toLowerCase();
  return ZERO_FAT_ALLOWED.some(kw => lower.includes(kw));
}

function extractPieceCount(foodName = '') {
  const match = foodName.match(/\(?\b(\d+)\s*p(?:cs|ieces?|c)?\b\)?/i);
  return match ? parseInt(match[1]) : null;
}

// ─── MACRO VALIDATION & CORRECTION ───────────────────────────────────────────

function validateAndCorrectMacros(parsed) {
  let { calories, protein, carbs, fat, food_name = '' } = parsed;

  // Clamp negatives
  protein  = Math.max(0, Math.round(Number(protein)  || 0));
  carbs    = Math.max(0, Math.round(Number(carbs)    || 0));
  fat      = Math.max(0, Math.round(Number(fat)      || 0));
  calories = Math.max(1, Math.round(Number(calories) || 0));
  const statedCalories = calories; // model's direct portion-based estimate

  let injectedCarbs = false;
  let injectedFat = false;

  // Enforce carbs for breaded/starchy/sweet foods
  if (carbs === 0 && !isZeroCarbAllowed(food_name)) {
    console.warn(`[VITALIS IMAGE] Zero carb correction for "${food_name}"`);
    carbs = Math.max(5, Math.round(statedCalories * 0.10 / 4));
    injectedCarbs = true;
  }

  // Enforce fat for fried/oily foods
  if (fat === 0 && !isZeroFatAllowed(food_name)) {
    console.warn(`[VITALIS IMAGE] Zero fat correction for "${food_name}"`);
    fat = Math.max(3, Math.round(statedCalories * 0.08 / 9));
    injectedFat = true;
  }

  // Protein cap for fried chicken by piece count
  if (isBreadedFood(food_name)) {
    const pieceCount = extractPieceCount(food_name);
    if (pieceCount) {
      const maxProtein = pieceCount * 25;
      if (protein > maxProtein) {
        console.warn(`[VITALIS IMAGE] Protein cap: ${protein}g → ${maxProtein}g for ${pieceCount} pieces`);
        protein = maxProtein;
      }
    }

    // Minimum carbs for breaded foods
    if (carbs < 10) {
      carbs = Math.max(15, Math.round(statedCalories * 0.12 / 4));
      injectedCarbs = true;
    }
  }

  // ─── Calorie reconciliation ────────────────────────────────────────────────
  // Vision models estimate TOTAL energy from visible portions far more reliably
  // than they guess each macro independently — per-macro guesses skew high and
  // the old "macros always win" rule inflated light meals (~100 kcal snack came
  // back as 400+ once its guessed macros were summed). Policy:
  //   ≤5% off                          → keep the model's numbers untouched
  //   >5% off, ratio within [0.85,1.15] → snap to macro-derived (mild cleanup)
  //   otherwise / any phantom injection → trust the STATED calories and
  //                                       rescale the macros to fit them.
  const macroCalories = protein * 4 + carbs * 4 + fat * 9;

  if (macroCalories <= 0) {
    calories = statedCalories;
  } else {
    const ratio = macroCalories / statedCalories;
    const drift = Math.abs(macroCalories - statedCalories) / statedCalories;
    const injected = injectedCarbs || injectedFat;

    if (!injected && drift <= 0.05) {
      calories = statedCalories;
    } else if (!injected && ratio >= 0.85 && ratio <= 1.15) {
      console.warn(
        `[VITALIS IMAGE] Calorie mismatch: stated=${statedCalories}, macro-derived=${macroCalories} — using macro-derived`
      );
      calories = macroCalories;
    } else {
      console.warn(
        `[VITALIS IMAGE] Macro/energy divergence (stated=${statedCalories}, macros=${macroCalories}) — keeping stated calories, rescaling macros`
      );
      const scale = statedCalories / macroCalories;
      protein = Math.max(0, Math.round(protein * scale));
      carbs   = Math.max(0, Math.round(carbs   * scale));
      fat     = Math.max(0, Math.round(fat     * scale));
      calories = statedCalories;
    }
  }

  
  const pieceCountForCap = extractPieceCount(food_name);
  const calorieCap = pieceCountForCap ? Math.min(pieceCountForCap * 350, 6000) : 2500;

  if (calories > calorieCap) {
    console.warn(`[VITALIS IMAGE] Calorie cap: ${calories} → ${calorieCap}`);
    const scale = calorieCap / calories;
    calories = calorieCap;
    protein  = Math.round(protein * scale);
    carbs    = Math.round(carbs   * scale);
    fat      = Math.round(fat     * scale);
  }

  return { ...parsed, calories, protein, carbs, fat };
}

// JSON PARSER 

function parseNutritionJSON(raw) {
  const clean = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g,      '')
    .trim();

  try { return JSON.parse(clean); } catch (_) {}

  const match = clean.match(/\{[\s\S]*?\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) {}
  }

  const extract = (key) => {
    const m = clean.match(new RegExp(`"${key}"\\s*:\\s*"?([^",}]+)"?`));
    return m ? m[1].trim() : null;
  };

  const food_name = extract('food_name');
  const calories  = extract('calories');
  if (!food_name || !calories) return null;

  return {
    food_name:  food_name,
    calories:   Number(calories)           || 0,
    protein:    Number(extract('protein')) || 0,
    carbs:      Number(extract('carbs'))   || 0,
    fat:        Number(extract('fat'))     || 0,
    suggestion: extract('suggestion')      || '',
  };
}

// VISION PROVIDERS 

async function analyzeWithGroqVision(base64Data, mimeType) {
  console.log("[VITALIS IMAGE] Trying Groq Qwen3.6 vision...");
  const resp = await groq.chat.completions.create({
    model:            "qwen/qwen3.6-27b",
    max_tokens:       500,
    temperature:      0,
    reasoning_effort: "none",
    messages: [
      {
        role:    "user",
        content: [
          { type: "text",      text:      FOOD_ANALYSIS_PROMPT },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
        ],
      },
    ],
  });

  const text = resp.choices[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");
  console.log("[VITALIS IMAGE] Groq raw:", text.slice(0, 200));
  return text;
}

const GEMINI_VISION_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
];

async function analyzeWithGeminiVision(base64Data, mimeType) {
  let lastErr;
  for (const modelName of GEMINI_VISION_MODELS) {
    try {
      console.log(`[VITALIS IMAGE] Trying Gemini vision (${modelName})...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 500,
          thinkingConfig: { thinkingLevel: "low" },
        },
      });

      const result = await model.generateContent([
        FOOD_ANALYSIS_PROMPT,
        { inlineData: { data: base64Data, mimeType } },
      ]);

      const text = result.response.text();
      if (!text) throw new Error("Gemini returned empty response");
      console.log(`[VITALIS IMAGE] Gemini (${modelName}) raw:`, text.slice(0, 200));

      const usage = result.response.usageMetadata;
      if (usage) {
        console.log(
          `[VITALIS IMAGE] (${modelName}) tokens — thoughts: ${usage.thoughtsTokenCount || 0}, ` +
          `output: ${usage.candidatesTokenCount || 0}, total: ${usage.totalTokenCount || 0}`
        );
      }

      return text;
    } catch (err) {
      console.error(`[VITALIS IMAGE] ❌ Gemini (${modelName}) failed:`, err.message);
      lastErr = err;
    }
  }
  throw lastErr;
}

// ─── TIMEOUT GUARD ───────────────────────────────────────────────────────────
// A hung AI request used to block the whole analysis indefinitely (no deadline
// existed anywhere in this path). This caps each provider attempt so a stalled
// call bails to the next provider instead of freezing the user's upload.
const PROVIDER_TIMEOUT_MS = 25000;

function withTimeout(promiseFactory, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
  });
  return Promise.race([promiseFactory(), timeout]).finally(
    () => clearTimeout(timer)
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

async function analyzeFoodImage(base64Data, mimeType = "image/jpeg") {
  // Gemini first — its flash models are markedly better at portion-size
  // estimation from photos. Groq vision remains as the availability fallback.
  const providers = [
    ["gemini", () => analyzeWithGeminiVision(base64Data, mimeType)],
    ["groq",   () => analyzeWithGroqVision(base64Data, mimeType)],
  ];

  const startedAt = Date.now();

  for (const [name, provider] of providers) {
    try {
      const t0 = Date.now();
      const raw = await withTimeout(provider, PROVIDER_TIMEOUT_MS, name);
      console.log(`[VITALIS IMAGE] ${name} responded in ${Date.now() - t0}ms`);
      const parsed = parseNutritionJSON(raw);

      if (!parsed) {
        console.warn("[VITALIS IMAGE] Parse failed — trying next provider");
        continue;
      }

      const corrected = validateAndCorrectMacros(parsed);
      console.log(
        `[VITALIS IMAGE] ✅ Final result in ${Date.now() - startedAt}ms total:`,
        JSON.stringify(corrected)
      );
      return JSON.stringify(corrected);
    } catch (err) {
      console.error("[VITALIS IMAGE] ❌ Provider failed:", err.message);
    }
  }

  console.error("[VITALIS IMAGE] All vision providers failed — returning fallback");
  return JSON.stringify({
    food_name:  "Unknown food",
    calories:   0,
    protein:    0,
    carbs:      0,
    fat:        0,
    suggestion: "Could not analyze the image. Please try a clearer photo.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — PLAN SUGGESTION
// ─────────────────────────────────────────────────────────────────────────────

function buildSuggestPlanPrompt(meal, plans, dailyContext) {
  const plansForPrompt = plans.map(p => ({
    id:           p.id,
    title:        p.title,
    tag:          p.tag,
    intensity:    p.intensity,
    target_focus: p.target_focus,
    duration:     p.duration,
    description:  p.description,
    is_enrolled:  p.is_enrolled === 1,
  }));

  return `
You are a fitness AI coach inside a nutrition and training app.

The user just logged this meal:
- Food: ${meal.food_name}
- Calories: ${meal.calories} kcal
- Protein: ${meal.protein}g, Carbs: ${meal.carbs}g, Fat: ${meal.fat}g

Daily context:
- Calories logged today (including this meal): ${dailyContext.caloriesSoFar} kcal
- Daily calorie goal: ${dailyContext.calorieGoal} kcal

Available training plans:
${JSON.stringify(plansForPrompt)}

Instructions:
1. Judge whether this meal is light, balanced, or heavy relative to the day.
2. If plans exist, pick the single best plan id. Prefer enrolled plans; only recommend
   a non-enrolled plan if no enrolled plan fits. If plans array is empty, set recommended_plan_id to null.
3. Estimate how many minutes of that plan would help balance this meal. Null if no plan.
4. Write a friendly 1-2 sentence message. Reassuring if balanced/light; practical and motivating if heavy. Never shame the user.
5. One short sentence of reasoning: why this plan fits nutritionally.

Respond with ONLY raw JSON, no markdown:
{
  "message": "string",
  "reasoning": "string",
  "recommended_plan_id": number or null,
  "estimated_minutes": number or null
}
`.trim();
}

async function suggestPlanForMeal(meal, plans, dailyContext) {
  const prompt = buildSuggestPlanPrompt(meal, plans, dailyContext);
  const raw    = await callGeminiWithFallback(prompt);
  return raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  genAI,
  callGeminiWithFallback,
  analyzeFoodImage,
  suggestPlanForMeal,
  validateAndCorrectMacros,
};