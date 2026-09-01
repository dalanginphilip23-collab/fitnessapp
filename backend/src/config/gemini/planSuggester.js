const { callGeminiWithFallback } = require("./client");
const logger = require('../../utils/logger');

function buildSuggestPlanPrompt(meal, plans, dailyContext) {
  const plansForPrompt = plans.map(p => ({
    id: p.id,
    title: p.title,
    tag: p.tag,
    intensity: p.intensity,
    target_focus: p.target_focus,
    duration: p.duration,
    description: p.description,
    is_enrolled: p.is_enrolled === 1,
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
  const raw = await callGeminiWithFallback(prompt);
  return raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

module.exports = { suggestPlanForMeal, buildSuggestPlanPrompt };
