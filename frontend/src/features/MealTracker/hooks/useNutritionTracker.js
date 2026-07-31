import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../config/port";

// ─── API ───────────────────────────────────────────────────────────────────────

const foodLogsUrl = (userId, ...parts) =>
  `${API_BASE_URL}/api/food-logs/${[userId, ...parts].join("/")}`;

const jsonPost = (url, body) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

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

async function apiAnalyzeFoodImage(dataUrl) {
  const base64 = await compressImageToBase64(dataUrl);
  const res  = await jsonPost(`${API_BASE_URL}/api/food-logs/analyze-pic`, { base64Image: base64 });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Analysis failed");
  return data;
}

async function apiSaveFoodLog(userId, meal) {
  const res  = await jsonPost(foodLogsUrl(userId), {
    food_name: meal.food_name,
    calories:  meal.calories  || 0,
    protein:   meal.protein   || 0,
    carbs:     meal.carbs     || 0,
    fat:       meal.fat       || 0,
    image_url: meal.image_url || null,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Save failed");
  return data;
}

async function apiFetchFoodLogs(userId) {
  const res  = await fetch(foodLogsUrl(userId));
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Fetch failed");
  return data;
}

async function apiDeleteFoodLog(userId, mealId) {
  const res  = await fetch(foodLogsUrl(userId, mealId), {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Delete failed");
  return data;
}

// ─── HOOK ──────────────────────────────────────────────────────────────────────

export function useNutritionTracker(USER_ID) {
  const [result,          setResult]          = useState(null);
  const [isAnalyzing,     setIsAnalyzing]     = useState(false);
  const [isLogging,       setIsLogging]       = useState(false);
  const [history,         setHistory]         = useState([]);
  const [historyLoading,  setHistoryLoading]  = useState(false);
  const [toast,           setToast]           = useState(null);
  const [summarySeed,     setSummarySeed]     = useState(0);
  // ↓ NEW: the most recently saved meal (works for both AI-analyzed and manual logs)
  const [lastLoggedMeal,  setLastLoggedMeal]  = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!USER_ID) return;
    setHistoryLoading(true);
    try {
      const data = await apiFetchFoodLogs(USER_ID);
      if (data.records) setHistory(data.records);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, [USER_ID]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleAnalyze = async (dataUrl) => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      setResult(await apiAnalyzeFoodImage(dataUrl));
    } catch (err) {
      showToast("❌ " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLog = async (meal) => {
    setIsLogging(true);
    try {
      await apiSaveFoodLog(USER_ID, meal);
      showToast(`✓ ${meal.food_name} saved!`);
      setResult(null);
      // ↓ NEW: expose the saved meal so the page can decide whether to show a plan suggestion
      setLastLoggedMeal({ ...meal, _ts: Date.now() });
      await loadHistory();
      setSummarySeed((s) => s + 1);
    } catch (err) {
      showToast("❌ " + err.message);
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await apiDeleteFoodLog(USER_ID, mealId);
      setHistory((prev) => prev.filter((m) => m.id !== mealId));
      setSummarySeed((s) => s + 1);
      showToast("🗑️ Meal deleted");
    } catch (err) {
      showToast("❌ " + err.message);
    }
  };

  return {
    result, isAnalyzing, isLogging,
    history, historyLoading,
    toast, summarySeed,
    lastLoggedMeal,   // ← NEW export
    handleAnalyze, handleLog, handleDeleteMeal, setToast,
  };
}