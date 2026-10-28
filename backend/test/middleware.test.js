const test = require('node:test');
const assert = require('node:assert/strict');
const { authRateLimit } = require('../middleware/rateLimitMiddleware');
const { sendControllerError } = require('../middleware/errorMiddleware');

const response = () => ({
  headers: {},
  statusCode: 200,
  body: null,
  set(name, value) { this.headers[name] = value; return this; },
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('auth limiter returns 429 after ten attempts per client in the window', () => {
  let nextCount = 0;
  let lastResponse;
  for (let i = 0; i < 11; i += 1) {
    const res = response();
    authRateLimit({ ip: 'test-client-rate-limit' }, res, () => { nextCount += 1; });
    lastResponse = res;
  }
  assert.equal(nextCount, 10);
  assert.equal(lastResponse.statusCode, 429);
  assert.equal(lastResponse.headers['RateLimit-Limit'], '10');
});

test('controller errors map bad model input and duplicate keys to client statuses', () => {
  assert.equal(sendControllerError(response(), { name: 'ValidationError', message: 'invalid field' }).statusCode, 400);
  assert.equal(sendControllerError(response(), { code: 11000, message: 'duplicate' }).statusCode, 409);
  assert.equal(sendControllerError(response(), { name: 'MongooseServerSelectionError', message: 'offline' }).statusCode, 503);
});
