/**
 * Agricultural Soil Health & Fertilizer Recommendation Engine
 * Analyzes pH, Nitrogen (N), Phosphorus (P), Potassium (K), and Organic Carbon.
 */
function analyzeSoilHealth({ phLevel, nitrogenKgHa, phosphorusKgHa, potassiumKgHa, moisturePercent = 40 }) {
  const recommendations = [];
  let healthGrade = 'Optimal';

  // 1. pH Evaluation
  if (phLevel < 6.0) {
    healthGrade = 'Acidic';
    recommendations.push(
      `Soil is Acidic (pH ${phLevel}). Apply Agricultural Lime (Calcium Carbonate) or Dolomite at 500-800 kg/acre to neutralize acidity and enhance nutrient uptake.`
    );
  } else if (phLevel > 7.8) {
    healthGrade = 'Alkaline';
    recommendations.push(
      `Soil is Alkaline (pH ${phLevel}). Incorporate Agricultural Gypsum (Calcium Sulfate) and organic farmyard manure (FYM) to lower alkalinity and improve soil porosity.`
    );
  } else {
    recommendations.push(`Soil pH (${phLevel}) is in the optimal range (6.0 - 7.5) for high nutrient availability.`);
  }

  // 2. Nitrogen (N) Analysis (Standard baseline: 280 - 560 kg/ha)
  if (nitrogenKgHa < 280) {
    if (healthGrade === 'Optimal') healthGrade = 'Deficient';
    recommendations.push(
      `Low Nitrogen (${nitrogenKgHa} kg/ha). Apply split doses of Urea or Neem-coated Urea (35-45 kg/acre) during vegetative tillering phase, or incorporate green manure (Dhaincha/Sunn hemp).`
    );
  } else if (nitrogenKgHa > 560) {
    recommendations.push(
      `Nitrogen is surplus (${nitrogenKgHa} kg/ha). Avoid top-dressing urea to prevent vegetative lodging and vulnerability to fungal rust.`
    );
  } else {
    recommendations.push(`Nitrogen level (${nitrogenKgHa} kg/ha) is balanced.`);
  }

  // 3. Phosphorus (P) Analysis (Standard baseline: 10 - 25 kg/ha)
  if (phosphorusKgHa < 10) {
    if (healthGrade === 'Optimal') healthGrade = 'Deficient';
    recommendations.push(
      `Low Phosphorus (${phosphorusKgHa} kg/ha). Apply Single Super Phosphate (SSP) or DAP at basal sowing stage to promote vigorous root development.`
    );
  } else if (phosphorusKgHa > 25) {
    recommendations.push(`Phosphorus is sufficient (${phosphorusKgHa} kg/ha). Reduce chemical phosphate fertilizers.`);
  } else {
    recommendations.push(`Phosphorus level (${phosphorusKgHa} kg/ha) is healthy.`);
  }

  // 4. Potassium (K) Analysis (Standard baseline: 110 - 280 kg/ha)
  if (potassiumKgHa < 110) {
    if (healthGrade === 'Optimal') healthGrade = 'Deficient';
    recommendations.push(
      `Low Potassium (${potassiumKgHa} kg/ha). Top-dress Muriate of Potash (MOP) or Sulfate of Potash (SOP) to improve crop disease resistance and grain filling.`
    );
  } else {
    recommendations.push(`Potassium level (${potassiumKgHa} kg/ha) provides good drought and disease resilience.`);
  }

  // 5. Moisture Alert
  if (moisturePercent < 25) {
    recommendations.push('Critical Soil Moisture Deficit (<25%). Initiate micro-drip irrigation immediately to avoid crop wilting.');
  }

  return { healthGrade, recommendations };
}

module.exports = { analyzeSoilHealth };
