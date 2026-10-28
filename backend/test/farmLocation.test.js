const test = require('node:test');
const assert = require('node:assert/strict');
const Farm = require('../models/Farm');
const { findCity, validateFarmLocation } = require('../utils/indianCityState');
const { createFarm, getFarms } = require('../controllers/farmController');

test('common Indian city mapping recognizes Madhya Pradesh, Maharashtra, Rajasthan, and Uttar Pradesh cities', () => {
  assert.deepEqual(findCity('Bhopal').states, ['Madhya Pradesh']);
  assert.deepEqual(findCity('Indore').states, ['Madhya Pradesh']);
  assert.deepEqual(findCity('Mumbai').states, ['Maharashtra']);
  assert.deepEqual(findCity('Pune').states, ['Maharashtra']);
  assert.deepEqual(findCity('Jaipur').states, ['Rajasthan']);
  assert.deepEqual(findCity('Lucknow').states, ['Uttar Pradesh']);
});

test('known incorrect city-state combinations and unresolved ambiguous cities are rejected', () => {
  assert.match(validateFarmLocation({ district: 'Bhopal', state: 'Maharashtra' }).error, /Madhya Pradesh/);
  assert.match(validateFarmLocation({ district: 'Bilaspur', state: 'Maharashtra' }).error, /Chhattisgarh or Himachal Pradesh/);
  assert.equal(validateFarmLocation({ district: 'Bilaspur', state: 'Chhattisgarh' }).location.state, 'Chhattisgarh');
});

test('valid farm creation stores the canonical city and matching state', async () => {
  const originalCreate = Farm.create;
  let created;
  Farm.create = async (data) => { created = data; return { ...data, _id: 'test-farm' }; };
  try {
    const req = {
      user: { _id: 'test-user', role: 'farmer' },
      body: {
        farmName: 'Bhopal plot', totalAreaAcres: 2, location: { district: ' bhopal ', state: 'madhya pradesh', village: 'Test' },
      },
    };
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; },
    };
    await createFarm(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(created.location.district, 'Bhopal');
    assert.equal(created.location.state, 'Madhya Pradesh');
  } finally {
    Farm.create = originalCreate;
  }
});

test('invalid farm creation is rejected before MongoDB create is called', async () => {
  const originalCreate = Farm.create;
  let called = false;
  Farm.create = async () => { called = true; };
  try {
    const req = {
      user: { _id: 'test-user', role: 'farmer' },
      body: { farmName: 'Bad plot', totalAreaAcres: 2, location: { district: 'Bhopal', state: 'Maharashtra' } },
    };
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; },
    };
    await createFarm(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.payload.message, /Madhya Pradesh/);
    assert.equal(called, false);
  } finally {
    Farm.create = originalCreate;
  }
});

test('farm list repairs only the signed-in user’s unambiguous city/state mistakes', async () => {
  const originalFind = Farm.find;
  const originalUpdateOne = Farm.updateOne;
  const updates = [];
  const records = [
    { _id: 'owned-bhopal', userId: 'current-user', location: { district: 'Bhopal', state: 'Maharashtra' } },
    { _id: 'owned-ambiguous', userId: 'current-user', location: { district: 'Bilaspur', state: 'Maharashtra' } },
  ];
  Farm.find = (filter) => ({ sort: async () => { assert.equal(String(filter.userId), 'current-user'); return records; } });
  Farm.updateOne = async (filter, update) => { updates.push({ filter, update }); };
  try {
    const req = { user: { _id: 'current-user', role: 'farmer' } };
    const res = { json(payload) { this.payload = payload; return this; } };
    await getFarms(req, res);
    assert.equal(updates.length, 1);
    assert.equal(String(updates[0].filter.userId), 'current-user');
    assert.equal(updates[0].filter._id, 'owned-bhopal');
    assert.equal(updates[0].update.$set['location.state'], 'Madhya Pradesh');
  } finally {
    Farm.find = originalFind;
    Farm.updateOne = originalUpdateOne;
  }
});
