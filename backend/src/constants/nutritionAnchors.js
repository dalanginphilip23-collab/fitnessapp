// Structured nutrition anchors extracted from foodAnalysisPrompt.js for code-level verification
// Used to snap known dishes to ground truth and to validate density bands.
// Values are per REFERENCE portion as in prompt; density = calories / grams *100

const DENSITY_BANDS = [
  { keywords: ['steamed white rice','plain rice','white rice','brown rice','steamed rice','jasmine rice'], min: 110, max: 125 },
  { keywords: ['fried rice','paella','garlic rice'], min: 150, max: 175 },
  { keywords: ['noodles','pasta','pancit','bihon','canton','spaghetti','ramen'], min: 130, max: 180 },
  { keywords: ['bread','pandesal','toast','roll','bun','tortilla'], min: 250, max: 310 },
  { keywords: ['banana'], min: 85, max: 95 },
  { keywords: ['grapes','apple','mango','fruit','watermelon','orange','papaya','pineapple'], min: 50, max: 65 },
  { keywords: ['salad','garden salad','leafy','coleslaw'], min: 20, max: 60 },
  { keywords: ['steamed vegetables','cooked vegetables','vegetable','sayote','kalabasa','pinakbet'], min: 35, max: 80 },
  { keywords: ['grilled chicken','white fish','grilled fish','steamed fish'], min: 110, max: 170 },
  { keywords: ['adobo','tinola','stewed chicken','pork stew'], min: 150, max: 200 },
  { keywords: ['nilaga','mechado','beef','pork','menudo','caldereta','bistek'], min: 160, max: 260 },
  { keywords: ['bicol express','curry','coconut','ginataang'], min: 200, max: 240 },
  { keywords: ['lechon kawali','crispy pata','deep fried pork','fried pork'], min: 260, max: 360 },
  { keywords: ['sisig','sizzling'], min: 220, max: 260 },
  { keywords: ['steak','grilled steak','beef steak'], min: 200, max: 280 },
  { keywords: ['fried chicken','breaded chicken','cutlet','chicken joy','chickenjoy'], min: 240, max: 310 },
  { keywords: ['burger','cheeseburger','chicken sandwich','burger steak'], min: 250, max: 360 },
  { keywords: ['fries','french fries','potato fries'], min: 300, max: 340 },
  { keywords: ['pizza'], min: 250, max: 300 },
  { keywords: ['turon','kwek','fish balls','street snacks','kikiam','calamares'], min: 170, max: 260 },
  { keywords: ['longganisa','tocino','processed meat','ham','bacon'], min: 250, max: 320 },
  { keywords: ['egg','boiled egg','fried egg','omelette'], min: 140, max: 200 },
  { keywords: ['dessert','pastry','halo','leche flan','biko','cake','donut'], min: 210, max: 310 },
  { keywords: ['oil','mayo','butter','sauce','gravy','dressing'], min: 700, max: 900 },
  { keywords: ['soup','broth','sinigang','bulalo','nilaga soup'], min: 30, max: 80 },
  { keywords: ['sushi','sashimi','maki'], min: 100, max: 180 },
  { keywords: ['sandwich','sub','wrap','burrito'], min: 180, max: 280 },
  { keywords: ['oatmeal','porridge','lugaw','arroz caldo','champorado'], min: 60, max: 120 },
  { keywords: ['smoothie','shake','juice','drink','milktea'], min: 40, max: 90 },
  { keywords: ['yogurt','pudding','flan','custard'], min: 80, max: 160 },
  { keywords: ['nuts','peanut','cashew','almond'], min: 500, max: 650 },
  { keywords: ['ice cream','sorbet','gelato'], min: 160, max: 250 },
];

// Per-dish anchors: normalized name -> {grams, calories, protein, carbs, fat}
// Expanded to cover all 30+ Filipino anchors for 90% capstone accuracy
const ANCHORS = {
  // ── BURGERS & FAST FOOD ──
  'basic single beef patty burger w cheese': { grams: 150, calories: 530, protein: 27, carbs: 40, fat: 27 },
  'double patty beef burger w cheese': { grams: 250, calories: 650, protein: 37, carbs: 41, fat: 41 },
  'fast food cheeseburger small': { grams: 115, calories: 300, protein: 15, carbs: 32, fat: 13 },
  'chicken sandwich breaded fast food': { grams: 220, calories: 550, protein: 28, carbs: 45, fat: 30 },
  'chicken sandwich grilled fast food': { grams: 200, calories: 380, protein: 37, carbs: 30, fat: 12 },
  'burger steak': { grams: 250, calories: 400, protein: 22, carbs: 35, fat: 18 },

  // ── FRIES & SIDES ──
  'fries small': { grams: 70, calories: 230, protein: 2, carbs: 29, fat: 11 },
  'fries medium': { grams: 115, calories: 365, protein: 4, carbs: 47, fat: 17 },
  'fries large': { grams: 150, calories: 480, protein: 6, carbs: 61, fat: 23 },
  'onion rings regular': { grams: 100, calories: 410, protein: 5, carbs: 45, fat: 24 },
  'mashed potato': { grams: 200, calories: 220, protein: 5, carbs: 32, fat: 8 },

  // ── FILIPINO HOME-COOKED ──
  'chicken adobo 1 pc thigh sauce': { grams: 200, calories: 320, protein: 28, carbs: 8, fat: 18 },
  'pork adobo': { grams: 150, calories: 380, protein: 25, carbs: 6, fat: 28 },
  'sinigang na baboy': { grams: 350, calories: 210, protein: 18, carbs: 12, fat: 9 },
  'sinigang na salmon': { grams: 350, calories: 240, protein: 22, carbs: 10, fat: 12 },
  'sinigang na shrimp': { grams: 350, calories: 180, protein: 20, carbs: 10, fat: 5 },
  'kare kare oxtail': { grams: 250, calories: 420, protein: 30, carbs: 14, fat: 26 },
  'lechon kawali 3 pcs': { grams: 150, calories: 480, protein: 22, carbs: 8, fat: 40 },
  'crispy pata': { grams: 250, calories: 650, protein: 38, carbs: 10, fat: 50 },
  'tinola chicken sayote': { grams: 300, calories: 180, protein: 20, carbs: 11, fat: 6 },
  'nilaga beef vegetables': { grams: 300, calories: 250, protein: 22, carbs: 17, fat: 10 },
  'bistek tagalog': { grams: 150, calories: 310, protein: 26, carbs: 8, fat: 18 },
  'caldereta': { grams: 200, calories: 350, protein: 24, carbs: 16, fat: 20 },
  'mechado': { grams: 200, calories: 320, protein: 22, carbs: 14, fat: 18 },
  'menudo': { grams: 200, calories: 300, protein: 20, carbs: 21, fat: 14 },
  'pinakbet': { grams: 150, calories: 140, protein: 8, carbs: 12, fat: 6 },
  'sizzling sisig': { grams: 200, calories: 480, protein: 28, carbs: 10, fat: 36 },
  'bicol express': { grams: 150, calories: 340, protein: 16, carbs: 10, fat: 26 },
  'bulalo': { grams: 400, calories: 450, protein: 35, carbs: 10, fat: 30 },
  'dinuguan': { grams: 200, calories: 320, protein: 20, carbs: 8, fat: 22 },
  'laing': { grams: 150, calories: 250, protein: 8, carbs: 10, fat: 20 },
  'ginataang kalabasa': { grams: 200, calories: 180, protein: 8, carbs: 18, fat: 10 },
  'escabeche': { grams: 200, calories: 220, protein: 18, carbs: 15, fat: 10 },
  'relleno': { grams: 250, calories: 350, protein: 25, carbs: 20, fat: 18 },
  'kare kare vegetables': { grams: 200, calories: 280, protein: 12, carbs: 18, fat: 18 },

  // ── RICE & NOODLES ──
  'steamed white rice 1 cup': { grams: 180, calories: 206, protein: 4, carbs: 45, fat: 0 },
  'steamed white rice 3/4 cup': { grams: 135, calories: 155, protein: 3, carbs: 34, fat: 0 },
  'steamed white rice 1/2 cup': { grams: 90, calories: 103, protein: 2, carbs: 22, fat: 0 },
  'fried rice 1 cup': { grams: 180, calories: 290, protein: 6, carbs: 42, fat: 10 },
  'garlic rice 1 cup': { grams: 180, calories: 260, protein: 5, carbs: 38, fat: 9 },
  'pancit canton': { grams: 200, calories: 320, protein: 12, carbs: 48, fat: 8 },
  'pancit bihon': { grams: 200, calories: 280, protein: 10, carbs: 44, fat: 6 },
  'pancit palabok': { grams: 200, calories: 300, protein: 10, carbs: 42, fat: 10 },
  'lugaw arroz caldo': { grams: 300, calories: 220, protein: 10, carbs: 38, fat: 4 },
  'bam-i': { grams: 200, calories: 310, protein: 10, carbs: 45, fat: 9 },
  'sotanghon': { grams: 200, calories: 260, protein: 8, carbs: 42, fat: 5 },
  'spaghetti': { grams: 250, calories: 350, protein: 14, carbs: 55, fat: 8 },
  'spaghetti with meat sauce': { grams: 300, calories: 450, protein: 20, carbs: 55, fat: 16 },
  'carbonara': { grams: 250, calories: 420, protein: 18, carbs: 45, fat: 18 },
  'ramen': { grams: 400, calories: 450, protein: 20, carbs: 55, fat: 16 },
  'instant noodles': { grams: 250, calories: 380, protein: 10, carbs: 52, fat: 14 },

  // ── FILIPINO BREAKFAST ──
  'pandesal plain': { grams: 35, calories: 110, protein: 3, carbs: 19, fat: 2 },
  'tapsilog': { grams: 400, calories: 430, protein: 25, carbs: 46, fat: 15 },
  'tosilog': { grams: 420, calories: 480, protein: 24, carbs: 50, fat: 20 },
  'longsilog': { grams: 450, calories: 520, protein: 26, carbs: 48, fat: 24 },
  'champorado': { grams: 250, calories: 240, protein: 5, carbs: 48, fat: 3 },
  'corned beef': { grams: 100, calories: 250, protein: 16, carbs: 2, fat: 20 },
  'hotdog': { grams: 60, calories: 180, protein: 8, carbs: 4, fat: 15 },
  'spam': { grams: 56, calories: 180, protein: 7, carbs: 2, fat: 16 },

  // ── FILIPINO STREET FOOD & SNACKS ──
  'turon 1pc': { grams: 80, calories: 180, protein: 2, carbs: 34, fat: 4 },
  'banana cue 1pc': { grams: 80, calories: 160, protein: 1, carbs: 36, fat: 2 },
  'fish ball 5pcs': { grams: 75, calories: 130, protein: 6, carbs: 18, fat: 4 },
  'kwek kwek 3pcs': { grams: 90, calories: 200, protein: 8, carbs: 18, fat: 10 },
  'isaw': { grams: 30, calories: 55, protein: 5, carbs: 1, fat: 3 },
  'betamax': { grams: 25, calories: 45, protein: 5, carbs: 0, fat: 3 },
  'helmet': { grams: 30, calories: 50, protein: 4, carbs: 1, fat: 3 },
  'adidas': { grams: 40, calories: 70, protein: 6, carbs: 2, fat: 4 },

  // ── FILIPINO DESSERTS ──
  'halo halo': { grams: 350, calories: 310, protein: 4, carbs: 60, fat: 6 },
  'leche flan 1 slice': { grams: 100, calories: 280, protein: 6, carbs: 42, fat: 10 },
  'biko 1 piece': { grams: 100, calories: 240, protein: 3, carbs: 48, fat: 4 },
  'bibingka': { grams: 100, calories: 220, protein: 4, carbs: 38, fat: 6 },
  'kakanin': { grams: 80, calories: 200, protein: 2, carbs: 42, fat: 3 },
  'sapin sapin': { grams: 80, calories: 180, protein: 1, carbs: 40, fat: 2 },
  'suman': { grams: 80, calories: 170, protein: 2, carbs: 38, fat: 2 },
  'puto': { grams: 50, calories: 110, protein: 2, carbs: 24, fat: 1 },
  'kutsinta': { grams: 50, calories: 120, protein: 1, carbs: 28, fat: 1 },

  // ── LIGHT ITEMS & FRUITS ──
  'banana': { grams: 118, calories: 105, protein: 1, carbs: 26, fat: 0 },
  'apple': { grams: 182, calories: 95, protein: 0, carbs: 24, fat: 0 },
  'orange': { grams: 131, calories: 62, protein: 1, carbs: 15, fat: 0 },
  'mango': { grams: 165, calories: 99, protein: 1, carbs: 24, fat: 0 },
  'watermelon': { grams: 280, calories: 85, protein: 2, carbs: 20, fat: 0 },
  'grapes': { grams: 150, calories: 105, protein: 1, carbs: 27, fat: 0 },
  'papaya': { grams: 150, calories: 60, protein: 1, carbs: 15, fat: 0 },
  'pineapple': { grams: 165, calories: 82, protein: 1, carbs: 22, fat: 0 },
  'avocado': { grams: 150, calories: 240, protein: 3, carbs: 12, fat: 22 },

  // ── EGGS & BASICS ──
  'boiled egg 1 large': { grams: 50, calories: 75, protein: 6, carbs: 1, fat: 5 },
  'fried egg 1': { grams: 46, calories: 90, protein: 6, carbs: 1, fat: 7 },
  'plain white toast 1 slice': { grams: 25, calories: 67, protein: 2, carbs: 13, fat: 1 },
  'garden salad no dressing': { grams: 150, calories: 35, protein: 2, carbs: 7, fat: 0 },
  'black coffee': { grams: 240, calories: 2, protein: 0, carbs: 0, fat: 0 },
  'oatmeal': { grams: 230, calories: 150, protein: 5, carbs: 27, fat: 3 },

  // ── PIZZA & WESTERN ──
  'pizza cheese slice': { grams: 110, calories: 240, protein: 11, carbs: 27, fat: 10 },
  'pizza pepperoni slice': { grams: 110, calories: 300, protein: 13, carbs: 27, fat: 15 },
  'hotdog with bun': { grams: 100, calories: 290, protein: 11, carbs: 24, fat: 17 },
  'taco beef': { grams: 85, calories: 170, protein: 8, carbs: 13, fat: 10 },
  'burrito': { grams: 300, calories: 550, protein: 25, carbs: 65, fat: 20 },
  'sushi california 8pcs': { grams: 200, calories: 290, protein: 9, carbs: 40, fat: 10 },
  'chicken wings breaded 1pc': { grams: 65, calories: 160, protein: 11, carbs: 5, fat: 11 },
  'chicken nuggets 6pcs': { grams: 100, calories: 280, protein: 14, carbs: 22, fat: 14 },

  // ── DRINKS ──
  'soft drink 1 can': { grams: 330, calories: 140, protein: 0, carbs: 35, fat: 0 },
  'orange juice 1 glass': { grams: 250, calories: 110, protein: 2, carbs: 26, fat: 0 },
  'milkshake regular': { grams: 400, calories: 530, protein: 10, carbs: 80, fat: 18 },
  'coffee with milk sugar': { grams: 240, calories: 80, protein: 2, carbs: 13, fat: 2 },
  'milktea': { grams: 500, calories: 350, protein: 4, carbs: 65, fat: 8 },
  'protein shake': { grams: 350, calories: 150, protein: 25, carbs: 10, fat: 3 },

  // ── PROTEIN SOURCES ──
  'grilled chicken breast': { grams: 150, calories: 230, protein: 43, carbs: 0, fat: 5 },
  'grilled salmon fillet': { grams: 150, calories: 280, protein: 30, carbs: 0, fat: 18 },
  'beef steak grilled': { grams: 150, calories: 310, protein: 32, carbs: 0, fat: 20 },
  'pork chop grilled': { grams: 130, calories: 250, protein: 25, carbs: 0, fat: 16 },
  'shrimp grilled': { grams: 100, calories: 120, protein: 24, carbs: 0, fat: 2 },
  'tofu fried': { grams: 100, calories: 270, protein: 18, carbs: 4, fat: 20 },

  // ── DAIRY & MISC ──
  'yogurt plain': { grams: 170, calories: 100, protein: 17, carbs: 6, fat: 1 },
  'cheese slice': { grams: 20, calories: 70, protein: 4, carbs: 0, fat: 6 },
  'peanut butter 1 tbsp': { grams: 16, calories: 95, protein: 4, carbs: 3, fat: 8 },
  'honey 1 tbsp': { grams: 21, calories: 64, protein: 0, carbs: 17, fat: 0 },
};

function normalize(s=''){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' '); }

// Fuzzy match: check if two normalized strings share significant words
// Dish-specific words (>5 chars) are weighted higher than generic words
function fuzzyMatch(input, anchor) {
  const inputWords = input.split(' ').filter(w => w.length > 2);
  const anchorWords = anchor.split(' ').filter(w => w.length > 2);
  if (inputWords.length === 0 || anchorWords.length === 0) return false;

  // Weight: words > 5 chars = 2pts (dish-specific), else = 1pt
  const wordWeight = (w) => w.length > 5 ? 2 : 1;
  const anchorWeight = anchorWords.reduce((sum, w) => sum + wordWeight(w), 0);
  const matchWeight = anchorWords.filter(w => inputWords.includes(w)).reduce((sum, w) => sum + wordWeight(w), 0);

  return anchorWeight > 0 && matchWeight / anchorWeight >= 0.5;
}

function findDensityBand(foodName){
  const n = normalize(foodName);
  // Exact match first
  for(const band of DENSITY_BANDS){
    if(band.keywords.some(k=> n.includes(normalize(k)))) return band;
  }
  // Fuzzy match for multi-word food names
  for(const band of DENSITY_BANDS){
    if(band.keywords.some(k => fuzzyMatch(n, normalize(k)))) return band;
  }
  return null;
}

function findAnchor(foodName){
  const n = normalize(foodName);
  // 1. Exact match
  for(const [key, val] of Object.entries(ANCHORS)){
    const nk = normalize(key);
    if(n === nk) return { key, ...val };
  }
  // 2. Substring match (anchor is substring of input or vice versa)
  for(const [key, val] of Object.entries(ANCHORS)){
    const nk = normalize(key);
    if(n.includes(nk) || nk.includes(n)) return { key, ...val };
  }
  // 3. Fuzzy match — find BEST match (highest weight ratio)
  let bestMatch = null;
  let bestScore = 0;
  for(const [key, val] of Object.entries(ANCHORS)){
    const nk = normalize(key);
    const inputWords = n.split(' ').filter(w => w.length > 2);
    const anchorWords = nk.split(' ').filter(w => w.length > 2);
    if (inputWords.length === 0 || anchorWords.length === 0) continue;
    const wordWeight = (w) => w.length > 5 ? 2 : 1;
    const anchorWeight = anchorWords.reduce((sum, w) => sum + wordWeight(w), 0);
    const matchWeight = anchorWords.filter(w => inputWords.includes(w)).reduce((sum, w) => sum + wordWeight(w), 0);
    const score = anchorWeight > 0 ? matchWeight / anchorWeight : 0;
    if (score >= 0.5 && score > bestScore) {
      bestScore = score;
      bestMatch = { key, ...val };
    }
  }
  return bestMatch;
}

module.exports = { DENSITY_BANDS, ANCHORS, findDensityBand, findAnchor, normalize };
