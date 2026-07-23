import { useState } from 'react';
import { classifyBMI } from '../constants/bmiConstants';
import { saveBmiMeasurement } from '../services/bmiService';

const FALLBACK_AI_SUGGESTION =
  'Focus on high-density nutrition and maintaining a consistent activity log to optimize your body composition.';

/**
 * Encapsulates all BMI page state and the calculate/save flow.
 * Extracted verbatim (same behavior) from the original BMI.jsx page component.
 */
export function useBMI(userId) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('other');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);

  const calculateBMI = async () => {
    if (!weight || !height) {
      setError('Please enter both weight and height.');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setAiSuggestion('');
    setShowAIModal(true);

    const heightM = parseFloat(height) / 100;
    const bmiValue = parseFloat((parseFloat(weight) / (heightM * heightM)).toFixed(1));
    const cat = classifyBMI(bmiValue);
    setBmi(bmiValue);
    setCategory(cat);

    try {
      const data = await saveBmiMeasurement(userId, { weight, height, age, gender });
      if (data.aiSuggestion) setAiSuggestion(data.aiSuggestion);
    } catch (err) {
      console.error('[BMI] Error:', err.message);
      setAiSuggestion(FALLBACK_AI_SUGGESTION);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    weight, setWeight,
    height, setHeight,
    age, setAge,
    gender, setGender,
    bmi,
    category,
    aiSuggestion,
    isAnalyzing,
    error,
    showAIModal, setShowAIModal,
    calculateBMI,
  };
}
