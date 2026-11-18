import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPin, isValidPin, verifyPin } from './privacyLock';

test('isValidPin enforces exactly 4 digits', () => {
  assert.equal(isValidPin('1234'), true);
  assert.equal(isValidPin('0000'), true);
  assert.equal(isValidPin('123'), false);
  assert.equal(isValidPin('12345'), false);
  assert.equal(isValidPin('abcd'), false);
});

test('hashPin and verifyPin validate matching and non-matching PINs', async () => {
  const hash = await hashPin('2468');
  assert.equal(hash.length, 64);
  assert.equal(await verifyPin('2468', hash), true);
  assert.equal(await verifyPin('1357', hash), false);
  assert.equal(await verifyPin('bad', hash), false);
});
