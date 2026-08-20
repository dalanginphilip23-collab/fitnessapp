import { useState, useEffect, useCallback } from "react";
import {
  analyzeFoodImage,
  saveFoodLog,
  fetchFoodLogs,
  deleteFoodLog,
} from "../services/nutritionService";

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
      const data = await fetchFoodLogs(USER_ID);
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
      setResult(await analyzeFoodImage(dataUrl));
    } catch (err) {
      showToast("❌ " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLog = async (meal) => {
    setIsLogging(true);
    try {
      await saveFoodLog(USER_ID, meal);
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
      await deleteFoodLog(USER_ID, mealId);
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