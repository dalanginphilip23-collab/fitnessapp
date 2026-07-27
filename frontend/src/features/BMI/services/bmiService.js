import { API_BASE_URL } from "../../../config/port";

export async function saveBmiMeasurement(
  userId,
  { weight, height, age, gender, activityLevel },
) {
  const res = await fetch(`${API_BASE_URL}/api/bmi/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      weight_kg: parseFloat(weight),
      height_cm: parseFloat(height),
      age: age || null,
      gender: gender || null,
      activity_level: activityLevel || null,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not save BMI");
  return data;
}
