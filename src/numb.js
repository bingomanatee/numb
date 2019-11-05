const ABSENT = Symbol('absent');

const CURRIES = 'ifValid,ifInvalid,ifPositive,ifNegative,ifWhole,ifZero,ifLT,ifGT,ifLTE,ifGTE,ifEQ'.split(',');
const UNARY_TESTS = 'isValid,isInvalid,isPositive,isNegative,isWhole,isZero,isInfinite,isInfiniteNeg,isEven,isOdd'.split(',');
const COMPARITAVE_TESTS = 'isGT,isLT,isGTE,isLTE,isEQ,isMultOf,isNotMultOf'.split(',');


const is = {
  n(value) {
    if (Number.isNaN(value)) {
      return false;
    }
    return typeof value === 'number' || typeof value === 'bigint';
  },
  f(value) {
    return typeof value === 'function';
  },
  s(value) {
    return typeof value === 'string';
  },
  nil(value) {
    return value === null;
  },
  a(value) {
    return Array.isArray(value);
  },
};

const flatten = (value) => {
  if (value instanceof Numb) {
    return [value.value];
  }
  if (!Array.isArray(value)) {
    return [value];
  }
  let out = [];
  for (let i = 0; i < value.length; ++i) {
    const v = value[i];
    if (Array.isArray(v)) {
      out = out.concat(flatten(v));
    } else {
      out.push(v);
    }
  }
  return out.map(v);
};

const v = (value) => (value instanceof Numb ? value.value : value);
const _N = (value, alt) => (value instanceof Numb ? value : new Numb(value, alt));

const nullProxy = typeof (Proxy) !== 'undefined' ? new Proxy({}, {
  get(obj, prop) {
    if (CURRIES.includes(prop) || prop === 'else') {
      return () => nullProxy;
    }
    return obj[prop];
  },
}) : {};

function proxy(target, testName, limit = ABSENT) {
  const p = new Proxy(target, {
    get(obj, prop) {
      if (prop === 'else') {
        return (fnInner) => {
          if (UNARY_TESTS.includes(testName)) {
            if (target[testName]) {
              return nullProxy;
            }
            if (is.f(fnInner)) {
              fnInner(target.source);
            }
          }

          if (COMPARITAVE_TESTS.includes(testName) && (limit !== ABSENT)) {
            if ((!target[testName](limit))) {
              if (is.f(fnInner)) {
                fnInner(target.source);
              }
              return target;
            }
            return nullProxy;
          }

          return target;
        };
      }
      if (target[testName]) {
        if (CURRIES.includes(prop)) {
          return Reflect.getPrototypeOf(target)[prop].bind(target);
        }
        return target[prop];
      }
      return nullProxy[prop];
    },
  });
  return p;
}

class Numb {
  constructor(value, alt = ABSENT) {
    this.source = value;
    this.alt = alt;
    if (is.f(value)) {
      try {
        this.value = value();
      } catch (err) {
        if (alt !== ABSENT) {
          if (is.f(alt)) {
            this.value = alt(err);
          } else {
            this.value = alt;
          }
        } else {
          this.value = NaN;
        }
      }
    } else {
      this.value = value;
      if (is.f(alt)) {
        this.fix(alt);
      }
    }
    this._lock = true;
  }

  catch(fn) {
    this._catch = fn;
  }

  do(fn, src) {
    this._f(fn, src);
    try {
      return fn(this.value);
    } catch (err) {
      if (this._catch) {
        return this._catch(err, src);
      }
      throw (err);
    }
  }

  doV(fn, src) {
    this._f(fn, src);
    try {
      return fn(this.source);
    } catch (err) {
      if (this._catch) {
        return this._catch(err, src);
      }
      throw (err);
    }
  }

  /**
   * fix only activates to fix bad values.
   * @param fn
   * @returns {Numb}
   */
  fix(fn) {
    if (this.isInvalid) {
      this._value = is.f(fn) ? this.doV(fn) : fn;
    }
    return this;
  }

  get type() {
    return typeof this.value;
  }

  get originalType() {
    return typeof this.source;
  }

  then(fn) {
    if (this.isValid) {
      return this.do(fn);
    }
    return nullProxy;
  }

  else(fn) {
    if (this.isValid) {
      return nullProxy;
    }
    if (is.f(fn)) {
      this.do(() => fn(this.source));
    }
    return this;
  }

  set value(value) {
    if (this._lock) {
      throw new Error('cannot update value of numb');
    }
    if (is.n(value) || is.nil(value)) {
      this._value = value;
    } else if (is.s(value)) {
      this._value = Number.parseFloat(value);
    } else {
      this._value = Number.NaN;
    }
  }

  get value() {
    return this._value;
  }

  get isValid() {
    return is.n(this.value);
  }

  get isInvalid() {
    return !this.isValid;
  }

  // ---------------------- UNARY TRANSFORMERS

  abs() {
    if (this.isValid && this.isNegative) {
      return this.negate();
    }
    return this;
  }

  absN() {
    if (this.isValid && this.isPositive) {
      return this.negate();
    }
    return this;
  }

  ceil() {
    if (this.isInvalid) {
      return this;
    }
    return new Numb(Math.ceil(this.value));
  }

  floor() {
    if (this.isInvalid) {
      return this;
    }
    return new Numb(Math.floor(this.value));
  }

  round() {
    if (this.isInvalid) {
      return this;
    }
    return new Numb(Math.round(this.value));
  }

  mod(n) {
    const modValue = _N(n);
    if (modValue.isInvalid || this.isInvalid) {
      return Numb.doc(this, 'mod', n);
    }
    return new Numb(this.value % modValue.value);
  }

  sq() {
    if (this.isInvalid) {
      return new Numb(Number.NaN);
    }
    return new Numb(this.value ** 2);
  }

  sqrt(abs) {
    if (this.isInvalid) {
      return this;
    }
    if (this.value < 0) {
      if (abs) {
        return this.negate().sqrt().negate();
      }
      return Numb.doc(this, 'sqrt');
    }
    return _N(Math.sqrt(this.value));
  }

  negate() {
    return this.times(-1);
  }

  // --------------- BINARY TRANSFORMERS: basic math

  pow(n) {
    if (this.isInvalid) {
      return this;
    }
    const nValue = _N(n);
    if (nValue.isInvalid) {
      return _N(NaN);
    }
    return _N(this.value ** nValue.value);
  }

  times(n, ignoreBad) {
    const nValue = _N(n);
    if (ignoreBad && nValue.isInvalid) {
      return this;
    }
    if (this.isInvalid || !nValue.isValid) {
      return Numb.doc(this, 'times', n);
    }
    return new Numb(this.value * nValue.value);
  }

  div(n) {
    const nValue = _N(n);
    if (this.isInvalid || nValue.isInvalid) {
      return Numb.doc(this, 'times', n);
    }
    return new Numb(this.value / nValue.value);
  }

  sum(n, ignoreBad = false) {
    let candidates = flatten(n);
    if (this.isValid) {
      candidates.push(this.value);
    }
    if (ignoreBad) {
      candidates = candidates.filter(is.n);
    } else if (!candidates.every(is.n)) {
      return _N(NaN);
    }

    return _N(candidates.reduce((n, value) => n + v(value), 0));
  }

  add(...args) {
    return this.plus(...args);
  }

  sub(...args) {
    return this.minus(...args);
  }

  // --------------- TRIGONOMETERS

  sin(isDeg = false) {
    if (this.isInvalid) {
      return this;
    }
    if (isDeg) {
      return this.rad().sin();
    }
    return _N(Math.sin(this.value));
  }

  cos(isDeg = false) {
    if (this.isInvalid) {
      return this;
    }
    if (isDeg) {
      return this.rad().cos();
    }
    return _N(Math.cos(this.value));
  }

  tan(isDeg = false) {
    if (this.isInvalid) {
      return this;
    }
    if (isDeg) {
      return this.rad().tan();
    }
    return _N(Math.tan(this.value));
  }

  arcSin(isDeg = false) {
    if (this.isInvalid) {
      return this;
    }
    if (isDeg) {
      return this.arcSin().deg();
    }
    return _N(Math.asin(this.value));
  }

  arcCos(isDeg = false) {
    if (this.isInvalid) {
      return this;
    }
    return isDeg ? this.arcCos().deg() : _N(Math.acos(this.value));
  }

  arcTan(isDeg = false) {
    if (this.isInvalid) {
      return this;
    }
    return isDeg ? this.arcTan().deg() : _N(Math.atan(this.value));
  }

  arcTan2(v2, isDeg = false) {
    const v2Value = _N(v2);
    if (v2Value.isInvalid) {
      return Numb.doc(this, 'arcTan2', v2, isDeg);
    }
    return this.isInvalid ? this : isDeg ? _N(Math.atan2(this.value, v2.value)).deg() : _N(Math.atan2(this.value, v2.value));
  }

  log() {
    return this.isInvalid ? this : _N(Math.log(this.value));
  }

  log10() {
    return this.isInvalid ? this : _N(Math.log10(this.value));
  }

  clampDeg() {
    if (this.isInvalid) {
      return this;
    }
    return !this.isNegative ? this.mod(360) : _N(360).minus(this.abs().clampDeg());
  }

  clampDeg180() {
    if (this.isInvalid) {
      return this;
    }
    if (this.isEQ(-180)) {
      return this;
    }
    const out = this.clampDeg();
    return out.isGT(180) ? out.sub(360) : out;
  }

  deg() {
    return this.isInvalid ? this : this.times(180 / (Math.PI));
  }

  rad() {
    if (this.isInvalid) {
      return this;
    }
    return this.times((Math.PI) / 180);
  }

  pi() {
    return _N(Math.PI);
  }

  // --------------- BINARY TRANSFORMERS: summary

  sumS(...args) {
    return _N().sum(...args);
  }

  mean(n, ignoreBad = false) {
    let candidates = flatten(n);
    if (this.isValid) {
      candidates.push(this.value);
    }

    if (ignoreBad) {
      candidates = candidates.filter(is.n);
    } else if (!candidates.every(is.n)) {
      return Numb.doc(this, 'mean', candidates);
    }
    if (candidates.length < 1) {
      return Numb.doc(this, 'mean', candidates);
    }

    return this.sum(candidates).div(candidates.length);
  }

  meanS(...args) {
    return _N().mean(...args);
  }

  minus(n, ignoreBad = false) {
    const nValue = _N(n);
    if (ignoreBad) {
      if (nValue.isInvalid) {
        return this;
      }
      if (this.isInvalid) {
        return nValue.negate();
      }
    } else if ((nValue.isInvalid || this.isInvalid)) {
      return _N(NaN);
    }

    return new Numb(this.value - nValue.value);
  }

  plus(n, ignoreBad = false) {
    const nValue = _N(n);
    if (ignoreBad) {
      if (nValue.isInvalid) {
        return this;
      }
      if (this.isInvalid) {
        return nValue;
      }
    } else if ((nValue.isInvalid || this.isInvalid)) {
      return _N(NaN);
    }

    return _N(this.value + nValue.value);
  }

  // ---------------- TRANSFORMERS: summary

  max(n, ignoreBad = false) {
    const candidates = flatten(n);
    if (n.length < 1) {
      return this;
    }

    if (ignoreBad) {
      const goodValues = [this.value, ...candidates].map(v).filter(is.n);
      if (goodValues.length < 1) {
        return Numb.doc(this, 'max', candidates);
      }
      const out = new Numb(goodValues.shift());
      return out.max(goodValues);
    }

    if (this.isInvalid || !candidates.every(is.n)) {
      return Numb.doc(this, 'max', candidates);
    }

    return new Numb(Math.max(...candidates, this.value));
  }

  min(n, ignoreBad = false) {
    const candidates = flatten(n);
    if (n.length < 1) {
      return this;
    }

    if (ignoreBad) {
      const goodValues = [this.value, ...candidates].map(v).filter(is.n);
      if (goodValues.length < 1) {
        return Numb.doc(this, 'min', candidates, true);
      }
      const out = new Numb(goodValues.shift());
      return out.min(goodValues);
    }

    if (this.isInvalid || !candidates.every(is.n)) {
      return Numb.doc(this, 'min', candidates);
    }

    return new Numb(Math.min(...candidates, this.value));
  }

  clamp(a, b, ignoreBad = false) {
    if (Array.isArray(a)) {
      return this.clamp(...a);
    }
    if (this.isInvalid) {
      return this;
    }
    const aValue = _N(a);
    const bValue = _N(b);
    if ((!ignoreBad) && (aValue.isInvalid || bValue.isInvalid)) {
      return Numb.doc(this, 'clamp', a, b);
    }
    const min = aValue.min(b);
    const max = aValue.max(b);
    return this.max(min).min(max);
  }

  // --------------- LOGIC TESTS

  get isInfinite() {
    return this.isInvalid ? null : this.value === Number.POSITIVE_INFINITY;
  }

  get isInfiniteNeg() {
    return this.isInvalid ? null : this.value === Number.NEGATIVE_INFINITY;
  }

  get isWhole() {
    return this.isInvalid ? null : this.value === Math.round(this.value) && !this.isNegative;
  }

  get isFloat() {
    return this.isInvalid ? null : this.value !== Math.round(this.value);
  }

  get isPositive() {
    return this.isInvalid ? null : this.value > 0;
  }

  get isNegative() {
    return this.isInvalid ? null : this.value < 0;
  }

  get isZero() {
    return this.isInvalid ? null : this.value === 0;
  }

  isGT(value) {
    if (!is.n(value)) {
      return null;
    }
    return this.isInvalid ? null : this.value > value;
  }

  isLT(value) {
    if (!is.n(value)) {
      return null;
    }
    return this.isInvalid ? null : this.value < value;
  }

  isGTE(value) {
    if (!is.n(value)) {
      return null;
    }
    return this.isInvalid ? null : this.value >= value;
  }

  isLTE(value) {
    if (!is.n(value)) {
      return null;
    }
    return this.isInvalid ? null : this.value <= value;
  }

  isEQ(value) {
    if (!is.n(value)) {
      return null;
    }
    return this.isInvalid ? null : this.value === value;
  }

  isMultOf(divisor) {
    if (!is.n(divisor)) {
      return null;
    }
    return this.isInvalid ? null : !(this.value % divisor);
  }

  _f(fn, name = '') {
    if (!is.f(fn)) {
      throw new Error(`numb.${name}: ${this.value} called with non function ${fn}`);
    }
  }

  // ------------------ FORK FUNCTIONS --------------------

  if(test, ifTrue, ifFalse, ifInvalid) {
    // value is ifInvalid (and presumed untestable
    if (test === 'isInvalid') {
      if (this.isInvalid) {
        return this.doV(ifTrue);
      }
      if (is.f(ifFalse)) {
        return this.do(ifFalse);
      }
      return;
    }
    if ((test === 'isValid')) {
      if (this.isValid) {
        return this.do(ifTrue);
      }
      if (is.f(ifFalse)) {
        return this.doV(ifFalse, test);
      }
      return;
    }
    if (this.isInvalid) {
      if (is.f(ifInvalid)) {
        return this.doV(ifInvalid);
      }
      return;
    }
    if (is.f(test)) {
      if (this.do(test)) {
        return this.do(ifTrue, true);
      }
      if (is.f(ifFalse)) {
        return this.doV(ifFalse);
      }
    } else if (is.a(test)) {
      const [name, value] = test;
      if (COMPARITAVE_TESTS.includes(name)) {
        return this.if(() => this[name](value), ifTrue, ifFalse, ifInvalid);
      }
      throw new Error(`cannot find test ${name}`);
    } else if (is.s(test)) {
      if (UNARY_TESTS.includes(test)) {
        if (this[test]) {
          return this.do(ifTrue, test);
        }
        if (is.f(ifFalse)) {
          this.do(ifFalse, test);
        }
        return;
      }
      throw new Error(`bad test ${test}`);
    } else if (test === true) {
      this.do(ifTrue, test);
    } else if (test === false) {
      this.do(ifFalse, test);
    } else {
      this.if(test === this.value, ifTrue, ifFalse, ifInvalid);
    }
  }

  ifValid(fn, orFn) {
    this.if('isValid', fn, orFn);
    return proxy(this, 'isValid');
  }

  ifInvalid(fn, orFn) {
    this.if('isInvalid', fn, orFn);
    return proxy(this, 'isInvalid');
  }

  ifPositive(fn, orFn, invFn) {
    this.if('isPositive', fn, orFn, invFn);
    return proxy(this, 'isPositive');
  }

  ifNegative(fn, orFn, invFn) {
    this.if('isNegative', fn, orFn, invFn);
    return proxy(this, 'isNegative');
  }

  ifZeroero(fn, orFn, invFn) {
    this.if('isZero', fn, orFn, invFn);
    return proxy(this, 'isZero');
  }

  ifWhole(fn, orFn, invFn) {
    this.if('isWhole', fn, orFn, invFn);
    return proxy(this, 'isWhole');
  }

  float(fn, orFn, invFn) {
    this.if('isFloat', fn, orFn, invFn);
    return proxy(this, 'isValid');
  }

  ifInfinite(fn, orFn, invFn) {
    this.if('isInfinite', fn, orFn, invFn);
    return proxy(this, 'isInfinite');
  }

  ifInfiniteNeg(fn, orFn, invFn) {
    this.if('isInfiniteNeg', fn, orFn, invFn);
    return proxy(this, 'isInfiniteNeg');
  }

  ifEven(fn, orFn, invFn) {
    this.if('isEven', fn, orFn, invFn);
    return proxy(this, 'isEven');
  }

  ifOodd(fn, orFn, invFn) {
    this.if('isOdd', fn, orFn, invFn);
    return proxy(this, 'isOdd');
  }

  ifGT(limit, fn, orFn, invFn) {
    this.if(['isGT', limit], fn, orFn, invFn);
    return proxy(this, 'isGT', limit);
  }

  ifMultOf(divisor, fn, orFn, invFn) {
    this.if((value) => !(value % divisor), fn, orFn, invFn);
    return proxy(this, 'isMultOf', divisor);
  }

  ifGTE(limit, fn, orFn, invFn) {
    this.if((value) => value >= limit, fn, orFn, invFn);
    return proxy(this, 'isGTE', limit);
  }

  ifLT(limit, fn, orFn, invFn) {
    this.if((value) => value < limit, fn, orFn, invFn);
    return proxy(this, 'isLT', limit);
  }

  ifLTE(limit, fn, orFn, invFn) {
    this.if((value) => value <= limit, fn, orFn, invFn);
    return proxy(this, 'isLTE', limit);
  }

  ifEQ(limit, fn, orFn, invFn) {
    this.if((value) => value === limit, fn, orFn, invFn);
    return proxy(this, 'isEQ', limit);
  }

  firstGood(...args) {
    return flatten(args).reduce((n = ABSENT, value) => {
      if (n.isValid) {
        return n;
      }
      return new Numb(value);
    }, _N(NaN));
  }
}

Numb.doc = (from, ...args) => {
  const n = new Numb(NaN);
  n.error = args;
  return n;
};


export default _N;
