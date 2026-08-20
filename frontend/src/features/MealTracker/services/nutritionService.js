import api from "../../../api/client";

// Nutrition Tracker API helpers. All requests ride the session cookie.

const foodLogsPath = (userId, ...parts) =>
  `/api/food-logs/${[userId, ...parts].join("/")}`;

async function compressImageToBase64(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 512;
      const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7).split(",")[1]);
    };
    img.onerror = () => reject(new Error("Image compression failed"));
    img.src = dataUrl;
  });
}

export async function analyzeFoodImage(dataUrl) {
  const base64 = await compressImageToBase64(dataUrl);
  const { ok, data } = await api("/api/food-logs/analyze-pic", {
    method: "POST",
    body: { base64Image: base64 },
  });
  if (!ok) throw new Error(data?.error || "Analysis failed");
  return data;
}

export async function saveFoodLog(userId, meal) {
  const { ok, data } = await api(foodLogsPath(userId), {
    method: "POST",
    body: {
      food_name: meal.food_name,
      calories:  meal.calories  || 0,
      protein:   meal.protein   || 0,
      carbs:     meal.carbs     || 0,
      fat:       meal.fat       || 0,
      image_url: meal.image_url || null,
    },
  });
  if (!ok) throw new Error(data?.error || "Save failed");
  return data;
}

export async function fetchFoodLogs(userId) {
  const { ok, data } = await api(foodLogsPath(userId));
  if (!ok) throw new Error(data?.error || "Fetch failed");
  return data;
}

export async function deleteFoodLog(userId, mealId) {
  const { ok, data } = await api(foodLogsPath(userId, mealId), { method: "DELETE" });
  if (!ok) throw new Error(data?.error || "Delete failed");
  return data;
}

export async function fetchDailyStats(userId, date) {
  const { ok, data } = await api(`/api/stats/daily/${userId}?date=${date}`);
  if (!ok) return null;
  return data;
}

export async function suggestPlan(userId, meal) {
  const { ok, data } = await api(foodLogsPath(userId, "suggest-plan"), {
    method: "POST",
    body: {
      food_name: meal.food_name,
      calories:  meal.calories || 0,
      protein:   meal.protein  || 0,
      carbs:     meal.carbs    || 0,
      fat:       meal.fat      || 0,
    },
  });
  if (!ok) throw new Error(data?.error || "Could not get a suggestion");
  return data;
}