/* Calculator: engine, formatter and DOM wiring in one dependency-free file.
 * The engine is pure and is exported for Node tests; the DOM layer runs only in a browser. */
(function (root) {
  'use strict';

  var MAX_DIGITS = 15;
  var DIV_ZERO = 'Cannot divide by zero';
  var INVALID = 'Invalid result';

  // ---------- Formatter ----------
  function roundResult(n) {
    return Number(n.toPrecision(12)); // BR-9
  }

  function trimZeros(s) {
    return s.indexOf('.') === -1 ? s : s.replace(/0+$/, '').replace(/\.$/, '');
  }

  function formatNumber(n) { // BR-10
    if (n === 0) return '0';
    var abs = Math.abs(n);
    if (abs >= 1e15 || abs < 1e-9) {
      var parts = n.toExponential(7).split('e');
      return trimZeros(parts[0]) + 'e' + parts[1];
    }
    if (abs < 1e-6) return trimZeros(n.toFixed(18));
    return String(n);
  }

  // ---------- Engine ----------
  function createEngine() {
    var s;

    function reset() {
      s = { current: '0', prev: null, op: null, waiting: false, overwrite: false, error: null, expr: '' };
    }

    function fail(msg) {
      reset();
      s.error = msg;
      s.current = msg;
    }

    function compute(a, op, b) {
      if (op === '÷' && b === 0) return { error: DIV_ZERO };
      var r;
      if (op === '+') r = a + b;
      else if (op === '-') r = a - b;
      else if (op === '×') r = a * b;
      else r = a / b;
      if (!isFinite(r)) return { error: INVALID };
      return { value: roundResult(r) };
    }

    function digitCount(str) {
      return str.replace(/[^0-9]/g, '').length;
    }

    function startFresh() {
      if (s.error) reset();
    }

    function inputDigit(d) {
      startFresh();
      if (s.overwrite) {
        s.current = d;
        s.overwrite = false;
        s.waiting = false;
        if (!s.op) s.expr = '';
      } else if (s.current === '0') {
        s.current = d;
      } else if (digitCount(s.current) < MAX_DIGITS) { // BR-4
        s.current += d;
      }
    }

    function inputDecimal() {
      startFresh();
      if (s.overwrite) {
        s.current = '0.';
        s.overwrite = false;
        s.waiting = false;
        if (!s.op) s.expr = '';
        return;
      }
      if (s.current.indexOf('.') !== -1) return; // BR-3
      if (digitCount(s.current) >= MAX_DIGITS) return;
      s.current += '.';
    }

    function inputOperator(op) {
      if (s.error) return; // BR-8
      if (s.op && s.waiting) { // BR-11
        s.op = op;
        s.expr = formatNumber(s.prev) + ' ' + op;
        return;
      }
      var val = Number(s.current);
      if (s.op) {
        var r = compute(s.prev, s.op, val);
        if (r.error) return fail(r.error);
        val = r.value;
        s.current = formatNumber(val);
      }
      s.prev = val;
      s.op = op;
      s.waiting = true;
      s.overwrite = true;
      s.expr = formatNumber(val) + ' ' + op;
    }

    function percent() {
      if (s.error) return;
      var val = Number(s.current);
      var r = (s.op === '+' || s.op === '-') ? (s.prev * val) / 100 : val / 100; // BR-2
      if (!isFinite(r)) return fail(INVALID);
      s.current = formatNumber(roundResult(r));
      s.overwrite = true;
      s.waiting = false;
    }

    function equals() {
      if (s.error || !s.op) return; // BR-8, BR-12
      var b = Number(s.current);
      var r = compute(s.prev, s.op, b);
      if (r.error) return fail(r.error);
      s.expr = formatNumber(s.prev) + ' ' + s.op + ' ' + formatNumber(b) + ' =';
      s.current = formatNumber(r.value);
      s.prev = null;
      s.op = null;
      s.waiting = false;
      s.overwrite = true;
    }

    function clear() { reset(); } // BR-6

    function del() { // BR-5
      if (s.error) return reset();
      if (s.overwrite) return;
      s.current = s.current.slice(0, -1);
      if (s.current === '' || s.current === '-') s.current = '0';
    }

    function getState() {
      return { display: s.current, expression: s.expr, isError: !!s.error };
    }

    reset();
    return {
      inputDigit: inputDigit, inputDecimal: inputDecimal, inputOperator: inputOperator,
      percent: percent, equals: equals, clear: clear, del: del, getState: getState
    };
  }

  var api = { createEngine: createEngine, formatNumber: formatNumber, roundResult: roundResult };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CalculatorEngine = api;

  // ---------- DOM layer (browser only) ----------
  if (typeof document === 'undefined') return;

  var engine = createEngine();
  var resultEl, exprEl, displayEl;

  function render() {
    var st = engine.getState();
    resultEl.textContent = st.display;
    exprEl.textContent = st.expression;
    displayEl.classList.toggle('is-error', st.isError);
    var len = st.display.length;
    var size = len <= 9 ? 1 : Math.max(0.28, 9 / len);
    resultEl.style.setProperty('--fit', String(size));
  }

  function run(action, value) {
    switch (action) {
      case 'digit': engine.inputDigit(value); break;
      case 'decimal': engine.inputDecimal(); break;
      case 'operator': engine.inputOperator(value); break;
      case 'percent': engine.percent(); break;
      case 'equals': engine.equals(); break;
      case 'clear': engine.clear(); break;
      case 'delete': engine.del(); break;
    }
    render();
  }

  function keyToAction(e) {
    var k = e.key;
    if (/^[0-9]$/.test(k)) return ['digit', k];
    if (k === '.' || k === ',') return ['decimal'];
    if (k === '+') return ['operator', '+'];
    if (k === '-') return ['operator', '-'];
    if (k === '*' || k === 'x' || k === 'X') return ['operator', '×'];
    if (k === '/') return ['operator', '÷'];
    if (k === '%') return ['percent'];
    if (k === 'Enter' || k === '=') return ['equals'];
    if (k === 'Backspace') return ['delete'];
    if (k === 'Escape' || k === 'c' || k === 'C') return ['clear'];
    return null;
  }

  function flash(action, value) {
    var sel = '[data-action="' + action + '"]' + (value ? '[data-value="' + value + '"]' : '');
    var btn = document.querySelector(sel);
    if (!btn) return;
    btn.classList.add('is-pressed');
    setTimeout(function () { btn.classList.remove('is-pressed'); }, 120);
  }

  function init() {
    resultEl = document.getElementById('result');
    exprEl = document.getElementById('expression');
    displayEl = document.getElementById('display');

    document.getElementById('keypad').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-action]');
      if (!btn) return;
      run(btn.getAttribute('data-action'), btn.getAttribute('data-value'));
    });

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var m = keyToAction(e);
      if (!m) return;
      e.preventDefault(); // stops "/" quick-find and Enter re-clicking a focused button
      run(m[0], m[1]);
      flash(m[0], m[1]);
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
