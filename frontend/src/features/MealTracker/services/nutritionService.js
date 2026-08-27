import api from "../../../api/client";

// Nutrition Tracker API helpers. All requests ride the session cookie.

const foodLogsPath = (userId, ...parts) =>
  `/api/food-logs/${[userId, ...parts].join("/")}`;

async function compressImageToBase64(dataUrl) {
  const MAX_WIDTH = 640; // 640px keeps plate detail, ~45% fewer pixels than 1080p
  const QUALITY = 0.72; // 0.72 vs 0.75 saves ~18% base64 size, no visible loss for food
  const MAX_BYTES = 900_000; // ~0.9MB base64 (~675KB JPEG) - fast upload on Render free
  // Fast path: fetch -> blob -> createImageBitmap -> OffscreenCanvas
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (blob.size > 8_000_000) throw new Error("Image too large (max 8MB)");
    const bitmap = await createImageBitmap(blob);
    const scale = bitmap.width > MAX_WIDTH ? MAX_WIDTH / bitmap.width : 1;
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    let outBlob;
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0, w, h);
      outBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY });
      bitmap.close();
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      bitmap.close();
      const dataUrlOut = canvas.toDataURL('image/jpeg', QUALITY);
      return { base64: dataUrlOut.split(',')[1], mimeType: 'image/jpeg' };
    }
    // If still too large, re-compress at lower quality
    if (outBlob.size > MAX_BYTES) {
      const canvas2 = document.createElement('canvas');
      canvas2.width = w; canvas2.height = h;
      // need to redraw from outBlob to canvas2 at lower quality - shortcut: use 0.6
      const bmp2 = await createImageBitmap(outBlob);
      canvas2.getContext('2d').drawImage(bmp2, 0, 0, w, h);
      bmp2.close();
      const dataUrl2 = canvas2.toDataURL('image/jpeg', 0.6);
      return { base64: dataUrl2.split(',')[1], mimeType: 'image/jpeg' };
    }
    const b64 = await blobToBase64(outBlob);
    return { base64: b64.split(',')[1], mimeType: 'image/jpeg' };
  } catch (err) {
    if (err.message?.includes("too large")) throw err;
    // fallback: classic Image path
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ base64: canvas.toDataURL("image/jpeg", QUALITY).split(",")[1], mimeType: 'image/jpeg' });
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