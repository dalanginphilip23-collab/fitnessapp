// Structured nutrition anchors extracted from foodAnalysisPrompt.js for code-level verification
// Used to snap known dishes to ground truth and to validate density bands.
// Values are per REFERENCE portion as in prompt; density = calories / grams *100

const DENSITY_BANDS = [
  { keywords: ['steamed white rice','plain rice','white rice','brown rice','steamed rice','jasmine rice'], min: 110, max: 125 },
  { keywords: ['fried rice','paella'], min: 150, max: 175 },
  { keywords: ['noodles','pasta','pancit','bihon','canton'], min: 130, max: 180 },
  { keywords: ['bread','pandesal','toast','roll'], min: 250, max: 310 },
  { keywords: ['banana'], min: 85, max: 95 },
  { keywords: ['grapes','apple','mango','fruit','watermelon'], min: 50, max: 65 },
  { keywords: ['salad','garden salad','leafy'], min: 20, max: 60 },
  { keywords: ['steamed vegetables','cooked vegetables','vegetable'], min: 35, max: 80 },
  { keywords: ['grilled chicken','white fish','grilled fish'], min: 110, max: 170 },
  { keywords: ['adobo','tinola','stewed chicken'], min: 150, max: 200 },
  { keywords: ['nilaga','mechado','beef','pork'], min: 160, max: 260 },
  { keywords: ['bicol express','curry','coconut'], min: 200, max: 240 },
  { keywords: ['lechon kawali','crispy pata','deep fried pork'], min: 260, max: 360 },
  { keywords: ['sisig','sizzling'], min: 220, max: 260 },
  { keywords: ['steak','grilled steak'], min: 200, max: 280 },
  { keywords: ['fried chicken','breaded chicken','cutlet'], min: 240, max: 310 },
  { keywords: ['burger','cheeseburger','chicken sandwich'], min: 250, max: 360 },
  { keywords: ['fries','french fries'], min: 300, max: 340 },
  { keywords: ['pizza'], min: 250, max: 300 },
  { keywords: ['turon','kwek','fish balls','street snacks'], min: 170, max: 260 },
  { keywords: ['longganisa','tocino','processed meat','ham'], min: 250, max: 320 },
  { keywords: ['egg','boiled egg','fried egg'], min: 140, max: 200 },
  { keywords: ['dessert','pastry','halo','leche flan','biko'], min: 210, max: 310 },
  { keywords: ['oil','mayo','butter','sauce'], min: 700, max: 900 },
];

// Per-dish anchors: normalized name -> {grams, calories, protein, carbs, fat}
// Expanded to cover all 30+ Filipino anchors for 90% capstone accuracy
const ANCHORS = {
  'basic single beef patty burger w cheese': { grams: 150, calories: 530, protein: 27, carbs: 40, fat: 27 },
  'double patty beef burger w cheese': { grams: 250, calories: 650, protein: 37, carbs: 41, fat: 41 },
  'fast food cheeseburger small': { grams: 115, calories: 300, protein: 15, carbs: 32, fat: 13 },
  'chicken sandwich breaded fast food': { grams: 220, calories: 550, protein: 28, carbs: 45, fat: 30 },
  'chicken sandwich grilled fast food': { grams: 200, calories: 380, protein: 37, carbs: 30, fat: 12 },
  'fries small': { grams: 70, calories: 230, protein: 2, carbs: 29, fat: 11 },
  'fries medium': { grams: 115, calories: 365, protein: 4, carbs: 47, fat: 17 },
  'fries large': { grams: 150, calories: 480, protein: 6, carbs: 61, fat: 23 },
  'chicken adobo 1 pc thigh sauce': { grams: 200, calories: 320, protein: 28, carbs: 8, fat: 18 },
  'pork adobo': { grams: 150, calories: 380, protein: 25, carbs: 6, fat: 28 },
  'sinigang na baboy': { grams: 350, calories: 210, protein: 18, carbs: 12, fat: 9 },
  'sinigang na salmon': { grams: 350, calories: 240, protein: 22, carbs: 10, fat: 12 },
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
  'steamed white rice 1 cup': { grams: 180, calories: 206, protein: 4, carbs: 45, fat: 0 },
  'fried rice 1 cup': { grams: 180, calories: 290, protein: 6, carbs: 42, fat: 10 },
  'pancit canton': { grams: 200, calories: 320, protein: 12, carbs: 48, fat: 8 },
  'pancit bihon': { grams: 200, calories: 280, protein: 10, carbs: 44, fat: 6 },
  'lugaw arroz caldo': { grams: 300, calories: 220, protein: 10, carbs: 38, fat: 4 },
  'turon 1pc': { grams: 80, calories: 180, protein: 2, carbs: 34, fat: 4 },
  'banana cue 1pc': { grams: 80, calories: 160, protein: 1, carbs: 36, fat: 2 },
  'fish ball 5pcs': { grams: 75, calories: 130, protein: 6, carbs: 18, fat: 4 },
  'kwek kwek 3pcs': { grams: 90, calories: 200, protein: 8, carbs: 18, fat: 10 },
  'halo halo': { grams: 350, calories: 310, protein: 4, carbs: 60, fat: 6 },
  'leche flan 1 slice': { grams: 100, calories: 280, protein: 6, carbs: 42, fat: 10 },
  'biko 1 piece': { grams: 100, calories: 240, protein: 3, carbs: 48, fat: 4 },
  'pandesal plain': { grams: 35, calories: 110, protein: 3, carbs: 19, fat: 2 },
  'tapsilog': { grams: 400, calories: 430, protein: 25, carbs: 46, fat: 15 },
  'tosilog': { grams: 420, calories: 480, protein: 24, carbs: 50, fat: 20 },
  'longsilog': { grams: 450, calories: 520, protein: 26, carbs: 48, fat: 24 },
  'champorado': { grams: 250, calories: 240, protein: 5, carbs: 48, fat: 3 },
  'banana': { grams: 118, calories: 105, protein: 1, carbs: 26, fat: 0 },
  'apple': { grams: 182, calories: 95, protein: 0, carbs: 24, fat: 0 },
  'boiled egg 1 large': { grams: 50, calories: 75, protein: 6, carbs: 1, fat: 5 },
  'fried egg 1': { grams: 46, calories: 90, protein: 6, carbs: 1, fat: 7 },
  'plain white toast 1 slice': { grams: 25, calories: 67, protein: 2, carbs: 13, fat: 1 },
  'garden salad no dressing': { grams: 150, calories: 35, protein: 2, carbs: 7, fat: 0 },
  'black coffee': { grams: 240, calories: 2, protein: 0, carbs: 0, fat: 0 },
};

function normalize(s=''){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' '); }

function findDensityBand(foodName){
  const n = normalize(foodName);
  for(const band of DENSITY_BANDS){
    if(band.keywords.some(k=> n.includes(normalize(k)))) return band;
  }
  return null;
}

function findAnchor(foodName){
  const n = normalize(foodName);
  // exact or substring match
  for(const [key, val] of Object.entries(ANCHORS)){
    const nk = normalize(key);
    if(n === nk || n.includes(nk) || nk.includes(n)) return { key, ...val };
  }
  return null;
}

module.exports = { DENSITY_BANDS, ANCHORS, findDensityBand, findAnchor, normalize };
