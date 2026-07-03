const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — TEXT-ONLY FALLBACK CHAIN
// ─────────────────────────────────────────────────────────────────────────────

async function callGeminiWithFallback(prompt) {
  const models = [
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-8b",
    "gemini-2.5-flash-preview-05-20",
  ];

  for (const modelName of models) {
    try {
      console.log(`[VITALIS AI] Trying ${modelName}...`);
      const model  = genAI.getGenerativeModel({ model: modelName });
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
      model:       "llama-3.3-70b-versatile",
      max_tokens:  1000,
      temperature: 0.3,
      messages:    [{ role: "user", content: prompt }],
    });
    const text = resp.choices[0]?.message?.content;
    if (text) {
      console.log("[VITALIS AI] ✅ Success with Groq llama-3.3-70b-versatile");
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

const FOOD_ANALYSIS_PROMPT = `You are a certified nutritionist and registered dietitian with 20 years
of experience estimating food portions and macronutrients from photographs.

TASK
Carefully examine this food photo, then output a single JSON object with these fields:
  food_name  – string: specific name of the dish (include portion/piece count when visible)
  calories   – integer: total kcal for the VISIBLE PORTION ONLY
  protein    – integer: grams of protein
  carbs      – integer: grams of carbohydrates
  fat        – integer: grams of fat
  suggestion – string: one practical health tip about this food (≤ 15 words)

PORTION ESTIMATION RULES
1. Estimate ONLY what is VISIBLE in the image. Do not assume extras off-screen.
2. Count pieces when applicable and include the count in food_name.
3. Compare food size to standard references: plate (~25cm), bowl (~16cm), utensils, or packaging.
4. A standard Filipino plate of rice = 1 cup (~180g cooked rice).

MACRO RULES (non-negotiable)
5. NEVER output 0g carbs for: fried/breaded foods, rice, bread, pasta, noodles, sauced dishes, desserts, fruits, or drinks with sugar.
6. NEVER output 0g fat for: fried foods, meat dishes, coconut-based dishes, fast food, dairy, or anything cooked in oil.
7. Macro energy MUST match calories within 5%:
   (protein × 4) + (carbs × 4) + (fat × 9) = calories ± 5%
   Verify this math BEFORE outputting. Adjust until it holds.
8. All values must be POSITIVE INTEGERS. No decimals. No negatives.

─── CALIBRATION ANCHORS ────────────────────────────────────────────────────

FILIPINO HOME-COOKED MEALS (standard 1-serving portions):
  Chicken adobo (1 pc thigh + sauce, ~200g):    320 kcal | P: 28g | C: 8g  | F: 18g
  Pork adobo (1 serving ~150g):                 380 kcal | P: 25g | C: 6g  | F: 28g
  Sinigang na baboy (1 bowl ~350ml):            210 kcal | P: 18g | C: 12g | F: 9g
  Sinigang na salmon (1 bowl ~350ml):           240 kcal | P: 22g | C: 10g | F: 11g
  Kare-kare (1 serving with oxtail ~250g):      420 kcal | P: 30g | C: 14g | F: 26g
  Lechon kawali (3 pcs ~150g):                  480 kcal | P: 22g | C: 8g  | F: 40g
  Crispy pata (1 serving ~250g):                650 kcal | P: 38g | C: 10g | F: 50g
  Tinola (1 bowl chicken + sayote ~300ml):      180 kcal | P: 20g | C: 8g  | F: 6g
  Nilaga (1 bowl beef + vegetables ~300ml):     250 kcal | P: 22g | C: 14g | F: 10g
  Bistek tagalog (1 serving ~150g):             310 kcal | P: 26g | C: 8g  | F: 18g
  Caldereta (1 serving ~200g):                  350 kcal | P: 24g | C: 16g | F: 20g
  Mechado (1 serving ~200g):                    320 kcal | P: 22g | C: 14g | F: 18g
  Menudo (1 serving ~200g):                     300 kcal | P: 20g | C: 18g | F: 14g
  Pinakbet (1 serving ~150g):                   140 kcal | P: 8g  | C: 12g | F: 6g
  Pakbet with bagnet (1 serving ~180g):         280 kcal | P: 14g | C: 14g | F: 18g
  Giniling (ground pork ~150g):                 290 kcal | P: 18g | C: 12g | F: 18g
  Tocino (3 pcs ~90g):                          220 kcal | P: 14g | C: 14g | F: 12g
  Longganisa (2 pcs ~80g):                      240 kcal | P: 10g | C: 10g | F: 18g
  Tapa (1 serving ~100g):                       200 kcal | P: 20g | C: 4g  | F: 12g
  Daing na bangus (1 medium piece ~150g):       280 kcal | P: 28g | C: 2g  | F: 18g
  Paksiw na isda (1 serving ~150g):             180 kcal | P: 22g | C: 4g  | F: 8g
  Ginataang manok (1 serving ~200g):            380 kcal | P: 26g | C: 8g  | F: 26g
  Laing (1 serving ~100g):                      220 kcal | P: 6g  | C: 10g | F: 18g
  Dinuguan (1 cup ~200g):                       320 kcal | P: 20g | C: 8g  | F: 22g
  Bulalo (1 bowl ~400ml):                       450 kcal | P: 35g | C: 10g | F: 30g
  Sizzling sisig (1 plate ~200g):               480 kcal | P: 28g | C: 10g | F: 36g
  Bicol express (1 serving ~150g):              340 kcal | P: 16g | C: 10g | F: 26g
  Pork belly liempo grilled (1 slab ~150g):     420 kcal | P: 22g | C: 2g  | F: 36g
  Binagoongang baboy (1 serving ~150g):         380 kcal | P: 20g | C: 6g  | F: 30g

RICE & NOODLES:
  Steamed white rice (1 cup cooked ~180g):      206 kcal | P: 4g  | C: 45g | F: 0g
  Steamed white rice (1.5 cups ~270g):          310 kcal | P: 6g  | C: 68g | F: 1g
  Fried rice (1 cup ~180g):                     290 kcal | P: 6g  | C: 42g | F: 10g
  Garlic fried rice (1 cup ~180g):              300 kcal | P: 5g  | C: 44g | F: 10g
  Pancit canton (1 serving ~200g):              320 kcal | P: 12g | C: 48g | F: 8g
  Pancit bihon (1 serving ~200g):               280 kcal | P: 10g | C: 44g | F: 6g
  Mami soup (1 bowl ~350ml):                    320 kcal | P: 18g | C: 38g | F: 8g
  Lomi (1 bowl ~350ml):                         380 kcal | P: 16g | C: 48g | F: 12g
  Lugaw/arroz caldo (1 bowl ~300ml):            220 kcal | P: 10g | C: 38g | F: 4g
  Goto (1 bowl ~300ml):                         260 kcal | P: 14g | C: 36g | F: 6g
  Spaghetti Filipino-style (1 serving ~250g):   480 kcal | P: 18g | C: 62g | F: 16g
  Pasta carbonara (1 serving ~250g):            520 kcal | P: 18g | C: 52g | F: 26g
  Pasta bolognese (1 serving ~250g):            460 kcal | P: 22g | C: 54g | F: 16g
  Ramen (1 bowl ~450ml):                        520 kcal | P: 22g | C: 62g | F: 18g

FAST FOOD — JOLLIBEE:
  Chickenjoy 1pc (thigh/leg):                   310 kcal | P: 22g | C: 16g | F: 18g
  Chickenjoy 1pc (breast):                      340 kcal | P: 28g | C: 16g | F: 18g
  Chickenjoy bucket 6pcs:                      1860 kcal | P: 132g| C: 96g | F: 108g
  Jolly Spaghetti (regular):                    440 kcal | P: 14g | C: 62g | F: 14g
  Yumburger:                                    260 kcal | P: 12g | C: 30g | F: 10g
  Champ burger:                                 760 kcal | P: 40g | C: 56g | F: 40g
  Burger steak 1pc:                             290 kcal | P: 16g | C: 22g | F: 16g
  Palabok fiesta (regular):                     480 kcal | P: 16g | C: 68g | F: 14g
  Peach mango pie (1pc):                        240 kcal | P: 2g  | C: 36g | F: 10g

FAST FOOD — McDONALD'S:
  McChicken sandwich:                           410 kcal | P: 14g | C: 42g | F: 20g
  Big Mac:                                      550 kcal | P: 26g | C: 44g | F: 30g
  McSpicy burger:                               530 kcal | P: 24g | C: 46g | F: 28g
  Chicken McDo 1pc:                             290 kcal | P: 18g | C: 18g | F: 16g
  McSpaghetti (regular):                        420 kcal | P: 12g | C: 62g | F: 12g
  Large fries:                                  490 kcal | P: 6g  | C: 66g | F: 23g
  Medium fries:                                 380 kcal | P: 4g  | C: 52g | F: 18g
  Apple pie 1pc:                                250 kcal | P: 2g  | C: 34g | F: 12g

FAST FOOD — KFC:
  Original recipe chicken 1pc (thigh):          320 kcal | P: 22g | C: 10g | F: 20g
  Zinger burger:                                620 kcal | P: 28g | C: 56g | F: 30g
  Coleslaw (regular):                           180 kcal | P: 2g  | C: 20g | F: 10g

GENERIC FRIED CHICKEN (non-branded):
  1 piece bone-in fried chicken (~120g):        270 kcal | P: 20g | C: 12g | F: 15g
  6 pieces fried chicken basket:               1000 kcal | P: 75g | C: 50g | F: 60g
  8 pieces fried chicken basket:               1350 kcal | P: 100g| C: 65g | F: 80g
  12 pieces fried chicken basket:              1880 kcal | P: 120g| C: 80g | F: 120g

BREAD, SNACKS & STREET FOOD:
  Pandesal (1 pc ~50g):                         150 kcal | P: 4g  | C: 28g | F: 2g
  Ensaymada (1 pc ~80g):                        310 kcal | P: 6g  | C: 40g | F: 14g
  Monay (1 pc ~80g):                            230 kcal | P: 6g  | C: 44g | F: 2g
  Turon 1pc (~80g):                             180 kcal | P: 2g  | C: 34g | F: 4g
  Banana cue 1pc (~80g):                        160 kcal | P: 1g  | C: 36g | F: 2g
  Fish ball 5pcs (~75g):                        130 kcal | P: 6g  | C: 18g | F: 4g
  Kikiam 3pcs (~60g):                           140 kcal | P: 6g  | C: 14g | F: 6g
  Kwek-kwek 3pcs (~90g):                        200 kcal | P: 8g  | C: 18g | F: 10g
  Isaw (chicken intestine) 2 sticks (~60g):     120 kcal | P: 8g  | C: 6g  | F: 6g
  Betamax 2pcs (~60g):                          100 kcal | P: 8g  | C: 4g  | F: 6g
  Hotdog on stick 1pc (~60g):                   180 kcal | P: 6g  | C: 10g | F: 12g

WESTERN & INTERNATIONAL:
  Grilled chicken breast 200g (no coating):     330 kcal | P: 62g | C: 0g  | F: 7g
  Beef steak 200g (sirloin grilled):            400 kcal | P: 48g | C: 0g  | F: 22g
  Pork chop grilled 150g:                       280 kcal | P: 30g | C: 0g  | F: 16g
  Pepperoni pizza 1 slice (~110g):              285 kcal | P: 12g | C: 36g | F: 10g
  Cheese pizza 1 slice (~100g):                 250 kcal | P: 10g | C: 34g | F: 8g
  Burger with bun (standard ~200g):             550 kcal | P: 30g | C: 40g | F: 30g
  Double patty burger (~300g):                  750 kcal | P: 44g | C: 44g | F: 40g
  Hot dog sandwich:                             290 kcal | P: 10g | C: 26g | F: 16g
  Tuna sandwich (2 slices bread):               320 kcal | P: 20g | C: 34g | F: 10g
  Club sandwich:                                450 kcal | P: 24g | C: 40g | F: 20g
  Caesar salad (no croutons ~200g):             180 kcal | P: 8g  | C: 6g  | F: 14g
  Caesar salad with croutons (~220g):           260 kcal | P: 10g | C: 20g | F: 16g
  French fries regular serving (~115g):         365 kcal | P: 4g  | C: 48g | F: 17g
  Onion rings regular (~90g):                   280 kcal | P: 4g  | C: 36g | F: 14g
  Nachos with cheese (~150g):                   420 kcal | P: 10g | C: 50g | F: 20g
  Salmon fillet 100g cooked:                    208 kcal | P: 28g | C: 0g  | F: 10g
  Tuna steak 150g cooked:                       220 kcal | P: 38g | C: 0g  | F: 6g
  Shrimp grilled 100g:                          100 kcal | P: 20g | C: 0g  | F: 2g
  Fried shrimp 6pcs breaded (~100g):            220 kcal | P: 14g | C: 18g | F: 10g
  Fish fillet fried (~150g):                    320 kcal | P: 22g | C: 20g | F: 16g
  Scrambled eggs 2 large:                       180 kcal | P: 12g | C: 2g  | F: 14g
  Omelette plain 2 eggs:                        190 kcal | P: 13g | C: 2g  | F: 14g
  Sunny side up 2 eggs:                         180 kcal | P: 12g | C: 1g  | F: 14g
  Bacon 3 strips (~30g):                        130 kcal | P: 8g  | C: 0g  | F: 10g
  Pancakes 2 medium (no syrup):                 340 kcal | P: 8g  | C: 56g | F: 10g
  Waffles 1 large (no syrup):                   310 kcal | P: 8g  | C: 48g | F: 10g
  Toast 2 slices white bread:                   160 kcal | P: 6g  | C: 30g | F: 2g

SOUPS & SALADS:
  Tomato soup 1 cup (~240ml):                   90 kcal  | P: 2g  | C: 16g | F: 2g
  Chicken noodle soup 1 cup (~240ml):           120 kcal | P: 8g  | C: 14g | F: 2g
  Cream of mushroom soup 1 cup:                 130 kcal | P: 4g  | C: 16g | F: 6g
  Mixed greens salad (no dressing ~100g):       25 kcal  | P: 2g  | C: 4g  | F: 0g
  Greek salad (~200g):                          180 kcal | P: 6g  | C: 10g | F: 12g

DESSERTS:
  Halo-halo (regular ~350ml):                   310 kcal | P: 4g  | C: 60g | F: 6g
  Leche flan 1 slice (~100g):                   280 kcal | P: 6g  | C: 42g | F: 10g
  Biko 1 piece (~100g):                         240 kcal | P: 3g  | C: 48g | F: 4g
  Puto 2pcs (~80g):                             180 kcal | P: 4g  | C: 36g | F: 2g
  Kutsinta 2pcs (~80g):                         160 kcal | P: 2g  | C: 36g | F: 0g
  Chocolate cake 1 slice (~100g):               350 kcal | P: 4g  | C: 52g | F: 14g
  Cheesecake 1 slice (~100g):                   320 kcal | P: 6g  | C: 32g | F: 18g
  Ice cream 1 scoop (~80g):                     160 kcal | P: 3g  | C: 22g | F: 6g
  Ube ice cream 1 scoop (~80g):                 170 kcal | P: 3g  | C: 24g | F: 6g
  Mango float 1 slice (~150g):                  320 kcal | P: 4g  | C: 48g | F: 12g
  Sans rival 1 slice (~80g):                    360 kcal | P: 6g  | C: 36g | F: 22g
  Cookies 2pcs chocolate chip (~40g):           190 kcal | P: 2g  | C: 26g | F: 8g
  Donut glazed 1pc (~50g):                      210 kcal | P: 3g  | C: 30g | F: 8g

DRINKS:
  Softdrink can 330ml (cola):                   140 kcal | P: 0g  | C: 36g | F: 0g
  Orange juice 1 glass ~250ml:                  110 kcal | P: 2g  | C: 26g | F: 0g
  Milk 1 glass whole ~250ml:                    150 kcal | P: 8g  | C: 12g | F: 8g
  Skim milk 1 glass ~250ml:                     90 kcal  | P: 8g  | C: 12g | F: 0g
  Coffee black (no sugar):                      2 kcal   | P: 0g  | C: 0g  | F: 0g
  Coffee with milk and sugar:                   60 kcal  | P: 2g  | C: 10g | F: 1g
  3-in-1 coffee sachet:                         80 kcal  | P: 1g  | C: 14g | F: 2g
  Milk tea with pearls (medium ~500ml):         380 kcal | P: 4g  | C: 72g | F: 8g
  Fruit shake mango (medium ~300ml):            200 kcal | P: 2g  | C: 44g | F: 2g
  Smoothie with yogurt (medium ~300ml):         220 kcal | P: 8g  | C: 38g | F: 4g
  Beer 1 bottle 330ml:                          150 kcal | P: 1g  | C: 14g | F: 0g

FRUITS:
  Medium banana (~120g):                        105 kcal | P: 1g  | C: 27g | F: 0g
  Medium apple (~180g):                         95 kcal  | P: 0g  | C: 25g | F: 0g
  Medium mango (~200g):                         135 kcal | P: 1g  | C: 35g | F: 0g
  Watermelon 2 slices (~300g):                  90 kcal  | P: 2g  | C: 22g | F: 0g
  Grapes 1 cup (~150g):                         100 kcal | P: 1g  | C: 27g | F: 0g
  Papaya 1 cup (~145g):                         60 kcal  | P: 1g  | C: 15g | F: 0g

DAIRY & EGGS:
  Cheese slice 1pc (~20g):                      70 kcal  | P: 4g  | C: 0g  | F: 6g
  Yogurt plain 1 cup (~245g):                   150 kcal | P: 12g | C: 18g | F: 4g
  Hard boiled egg 1 large:                      78 kcal  | P: 6g  | C: 1g  | F: 5g

─── END OF CALIBRATION ANCHORS ────────────────────────────────────────────────

CRITICAL MISTAKES TO AVOID
- Never output 0g carbs for fried, breaded, sauced, sweet, or starchy foods
- Never output 0g fat for fried, oily, meaty, dairy, or fast food items
- Never assign 2000+ kcal to a single non-shared portion
- Always verify: (protein × 4) + (carbs × 4) + (fat × 9) ≈ your calorie number ± 5%
- If the food is not in the anchors, use the closest similar food as your base estimate

OUTPUT FORMAT (raw JSON only — no markdown, no prose, no code fences):
{"food_name":"...","calories":0,"protein":0,"carbs":0,"fat":0,"suggestion":"..."}`;

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
];

const ZERO_FAT_ALLOWED = [
  'steamed white rice', 'plain rice', 'fruit', 'watermelon', 'banana',
  'apple', 'mango', 'papaya', 'grapes', 'black coffee',
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

  // Enforce carbs for breaded/starchy/sweet foods
  if (carbs === 0 && !isZeroCarbAllowed(food_name)) {
    console.warn(`[VITALIS IMAGE] Zero carb correction for "${food_name}"`);
    carbs = Math.max(5, Math.round(calories * 0.10 / 4));
  }

  // Enforce fat for fried/oily foods
  if (fat === 0 && !isZeroFatAllowed(food_name)) {
    console.warn(`[VITALIS IMAGE] Zero fat correction for "${food_name}"`);
    fat = Math.max(3, Math.round(calories * 0.08 / 9));
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
      carbs = Math.max(15, Math.round(calories * 0.12 / 4));
    }
  }

  // Always recalculate calories from macros — macros are source of truth
  const macroCalories = protein * 4 + carbs * 4 + fat * 9;

  if (macroCalories > 0) {
    const diff = Math.abs(macroCalories - calories) / Math.max(calories, 1);
    if (diff > 0.05) {
      console.warn(
        `[VITALIS IMAGE] Calorie mismatch: stated=${calories}, macro-derived=${macroCalories} — using macro-derived`
      );
      calories = macroCalories;
    }
  }

  // Sanity cap: single dishes rarely exceed 2500 kcal
  if (calories > 2500) {
    console.warn(`[VITALIS IMAGE] Calorie cap: ${calories} → 2500`);
    const scale = 2500 / calories;
    calories = 2500;
    protein  = Math.round(protein * scale);
    carbs    = Math.round(carbs   * scale);
    fat      = Math.round(fat     * scale);
  }

  return { ...parsed, calories, protein, carbs, fat };
}

// ─── JSON PARSER ──────────────────────────────────────────────────────────────

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

// ─── VISION PROVIDERS ─────────────────────────────────────────────────────────

async function analyzeWithGroqVision(base64Data, mimeType) {
  console.log("[VITALIS IMAGE] Trying Groq LLaMA-4 Scout vision...");
  const resp = await groq.chat.completions.create({
    model:       "meta-llama/llama-4-scout-17b-16e-instruct",
    max_tokens:  300,
    temperature: 0,
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

async function analyzeWithGeminiVision(base64Data, mimeType) {
  console.log("[VITALIS IMAGE] Trying Gemini vision fallback...");
  const model = genAI.getGenerativeModel({
    model:            "gemini-1.5-flash",
    generationConfig: { temperature: 0, maxOutputTokens: 300 },
  });

  const result = await model.generateContent([
    FOOD_ANALYSIS_PROMPT,
    { inlineData: { data: base64Data, mimeType } },
  ]);

  const text = result.response.text();
  if (!text) throw new Error("Gemini returned empty response");
  console.log("[VITALIS IMAGE] Gemini raw:", text.slice(0, 200));
  return text;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

async function analyzeFoodImage(base64Data, mimeType = "image/jpeg") {
  const providers = [
    () => analyzeWithGroqVision(base64Data, mimeType),
    () => analyzeWithGeminiVision(base64Data, mimeType),
  ];

  for (const provider of providers) {
    try {
      const raw    = await provider();
      const parsed = parseNutritionJSON(raw);

      if (!parsed) {
        console.warn("[VITALIS IMAGE] Parse failed — trying next provider");
        continue;
      }

      const corrected = validateAndCorrectMacros(parsed);
      console.log("[VITALIS IMAGE] ✅ Final result:", JSON.stringify(corrected));
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
};