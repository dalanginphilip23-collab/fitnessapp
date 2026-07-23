import { API_BASE_URL } from '../../../config/port';

/**
 * Saves a BMI measurement for a user and returns the parsed response,
 * which may include an `aiSuggestion` field.
 * Behavior (endpoint, method, payload, error handling) is unchanged
 * from the original inline fetch in BMI.jsx.
 */
export async function saveBmiMeasurement(userId, { weight, height, age, gender }) {
  const res = await fetch(`${API_BASE_URL}/api/bmi/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      weight_kg: parseFloat(weight),
      height_cm: parseFloat(height),
      age: age || null,
      gender: gender || null,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not save BMI');
  return data;
}
