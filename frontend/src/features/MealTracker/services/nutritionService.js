import api from "../../../api/client";

// Nutrition Tracker API helpers. All requests ride the session cookie.

const foodLogsPath = (userId, ...parts) =>
  `/api/food-logs/${[userId, ...parts].join("/")}`;

async function compressImageToBase64(dataUrl, mimeType = "image/jpeg") {
  // Fast path: use createImageBitmap + OffscreenCanvas when available
  try {
    // dataUrl -> blob via fetch (fast, no base64 decode double)
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    // keep original mime for backend
    const actualMime = blob.type || mimeType;
    const bitmap = await createImageBitmap(blob);
    const MAX_WIDTH = 600; // 768->600 cuts ~40% pixels, still keeps plate cues
    const scale = bitmap.width > MAX_WIDTH ? MAX_WIDTH / bitmap.width : 1;
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    let canvas, ctx;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(w, h);
      ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0, w, h);
      const outBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.75 });
      bitmap.close();
      const b64 = await blobToBase64(outBlob);
      return { base64: b64.split(',')[1], mimeType: 'image/jpeg' };
    }
    canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const dataUrlOut = canvas.toDataURL('image/jpeg', 0.75);
    return { base64: dataUrlOut.split(',')[1], mimeType: 'image/jpeg' };
  } catch (_) {
    // fallback: classic Image path
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 600;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ base64: canvas.toDataURL("image/jpeg", 0.75).split(",")[1], mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error("Image compression failed"));
      img.src = dataUrl;
    });
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function analyzeFoodImage(dataUrl, opts = {}) {
  const { signal } = opts;
  const { base64, mimeType } = await compressImageToBase64(dataUrl);
  const { ok, data } = await api("/api/food-logs/analyze-pic", {
    method: "POST",
    body: { base64Image: base64, mimeType },
    signal,
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