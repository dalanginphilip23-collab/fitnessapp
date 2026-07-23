// BMI category thresholds, matching the calculation previously inlined in BMI.jsx
export const BMI_CATEGORY = {
  UNDERWEIGHT: 'Underweight',
  HEALTHY: 'Healthy Weight',
  OVERWEIGHT: 'Overweight',
  OBESE: 'Obese',
};

// Color used per category, keyed by category label (unchanged from original inline map)
export const CATEGORY_COLOR = {
  [BMI_CATEGORY.UNDERWEIGHT]: 'var(--success)',
  [BMI_CATEGORY.HEALTHY]: 'var(--accent)',
  [BMI_CATEGORY.OVERWEIGHT]: 'var(--warning)',
  [BMI_CATEGORY.OBESE]: 'var(--error)',
};

// Reference legend shown in the "BMI Scale" card
export const BMI_SCALE_LEGEND = [
  { label: 'Underweight', range: '< 18.5', color: 'var(--success)' },
  { label: 'Healthy', range: '18.5 – 24.9', color: 'var(--accent)' },
  { label: 'Overweight', range: '25 – 29.9', color: 'var(--warning)' },
  { label: 'Obese', range: '≥ 30', color: 'var(--error)' },
];

/**
 * Classifies a numeric BMI value into a category label.
 * Same thresholds as the original inline logic in BMI.jsx.
 */
export function classifyBMI(bmiValue) {
  if (bmiValue < 18.5) return BMI_CATEGORY.UNDERWEIGHT;
  if (bmiValue < 25) return BMI_CATEGORY.HEALTHY;
  if (bmiValue < 30) return BMI_CATEGORY.OVERWEIGHT;
  return BMI_CATEGORY.OBESE;
}
