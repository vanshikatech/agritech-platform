import cityStateData from '../../../shared/indianCityStates.json';

export const INDIAN_STATES = cityStateData.states;
export const INDIAN_CITIES = cityStateData.cities;

const normalizeText = (value) => String(value || '').trim().toLocaleLowerCase('en-IN');

export const findIndianCity = (city) => {
  const needle = normalizeText(city);
  if (!needle) return null;
  return INDIAN_CITIES.find((entry) => [entry.name, ...(entry.aliases || [])].some((name) => normalizeText(name) === needle)) || null;
};

export const validateIndianCityState = (city, state) => {
  const match = findIndianCity(city);
  if (!match || !state) return { valid: true, match };
  const valid = match.states.some((candidate) => normalizeText(candidate) === normalizeText(state));
  return {
    valid,
    match,
    message: valid ? '' : match.states.length > 1
      ? `Select the correct state for ${match.name}: ${match.states.join(' or ')}.`
      : `${match.name} is in ${match.states[0]}, not ${state}.`,
  };
};
