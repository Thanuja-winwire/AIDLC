'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { createEngine, formatNumber } = require('../script.js');

function press(e, keys) {
  for (const k of keys.split(' ')) {
    if (/^[0-9]$/.test(k)) e.inputDigit(k);
    else if (k === '.') e.inputDecimal();
    else if (k === '%') e.percent();
    else if (k === '=') e.equals();
    else if (k === 'C') e.clear();
    else if (k === 'D') e.del();
    else e.inputOperator(k);
  }
  return e.getState();
}

test('basic operations', () => {
  assert.strictEqual(press(createEngine(), '7 + 5 =').display, '12');
  assert.strictEqual(press(createEngine(), '7 - 9 =').display, '-2');
  assert.strictEqual(press(createEngine(), '6 × 7 =').display, '42');
  assert.strictEqual(press(createEngine(), '9 ÷ 4 =').display, '2.25');
});

test('left to right chaining', () => {
  assert.strictEqual(press(createEngine(), '2 + 3 × 4 =').display, '20');
});

test('decimals and floating point rounding', () => {
  assert.strictEqual(press(createEngine(), '0 . 1 + 0 . 2 =').display, '0.3');
  assert.strictEqual(press(createEngine(), '. 5').display, '0.5');
  assert.strictEqual(press(createEngine(), '1 . 2 . 3').display, '1.23');
});

test('percent', () => {
  assert.strictEqual(press(createEngine(), '2 0 0 + 1 0 % =').display, '220');
  assert.strictEqual(press(createEngine(), '2 0 0 - 1 0 % =').display, '180');
  assert.strictEqual(press(createEngine(), '5 0 × 1 0 % =').display, '5');
  assert.strictEqual(press(createEngine(), '5 0 %').display, '0.5');
});

test('division by zero and error recovery', () => {
  const e = createEngine();
  let st = press(e, '5 ÷ 0 =');
  assert.strictEqual(st.display, 'Cannot divide by zero');
  assert.ok(st.isError);
  st = press(e, '+ = %');
  assert.ok(st.isError);
  st = press(e, '3');
  assert.strictEqual(st.display, '3');
  assert.ok(!st.isError);
});

test('clear and delete', () => {
  const e = createEngine();
  assert.strictEqual(press(e, '1 2 3 D').display, '12');
  assert.strictEqual(press(e, 'D D').display, '0');
  assert.strictEqual(press(e, '9 + 4 C').display, '0');
  assert.strictEqual(e.getState().expression, '');
  assert.strictEqual(press(createEngine(), '2 + 3 = D').display, '5');
});

test('operator replacement and equals with no operator', () => {
  assert.strictEqual(press(createEngine(), '8 + × 2 =').display, '16');
  assert.strictEqual(press(createEngine(), '8 =').display, '8');
});

test('digit limit', () => {
  const st = press(createEngine(), '1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7');
  assert.strictEqual(st.display, '123456789012345');
});

test('result then new digit starts fresh; operator continues', () => {
  assert.strictEqual(press(createEngine(), '2 + 3 = 4').display, '4');
  assert.strictEqual(press(createEngine(), '2 + 3 = × 2 =').display, '10');
});

test('formatting', () => {
  assert.strictEqual(formatNumber(1e21), '1e+21');
  assert.strictEqual(formatNumber(0.0000001), '0.0000001');
  assert.strictEqual(formatNumber(1.5e-10), '1.5e-10');
});
