const { states, cities } = require('../../shared/indianCityStates.json');

const normalizeText = (value) => String(value || '').trim().toLocaleLowerCase('en-IN');

const findCity = (city) => {
  const needle = normalizeText(city);
  if (!needle) return null;
  return cities.find((entry) => [entry.name, ...(entry.aliases || [])].some((name) => normalizeText(name) === needle)) || null;
};

const validateFarmLocation = (location) => {
  if (!location || typeof location !== 'object' || Array.isArray(location)) {
    return { error: 'Farm location must include a city/district and state.' };
  }
  if (typeof location.district !== 'string' || !location.district.trim() || location.district.trim().length > 80) {
    return { error: 'City / district is required and must be at most 80 characters.' };
  }
  if (typeof location.state !== 'string' || !location.state.trim()) {
    return { error: 'Please select a state.' };
  }

  const state = states.find((candidate) => normalizeText(candidate) === normalizeText(location.state));
  if (!state) return { error: 'Please select a valid Indian state or union territory.' };

  const city = findCity(location.district);
  if (city && !city.states.some((candidate) => normalizeText(candidate) === normalizeText(state))) {
    return { error: `${city.name} is listed in ${city.states.join(' or ')}, not ${state}.` };
  }
  if (city && city.states.length > 1 && !city.states.some((candidate) => candidate === state)) {
    return { error: `Select the state for ${city.name}: ${city.states.join(' or ')}.` };
  }

  return {
    location: {
      ...location,
      district: city ? city.name : location.district.trim(),
      state,
      village: typeof location.village === 'string' ? location.village.trim() : '',
    },
  };
};

module.exports = { states, cities, findCity, validateFarmLocation };
