const ABSENT = Symbol('absent');

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
};

const CURRIES = 'valid,invalid,positive,negative,whole,zero,lt,lte,gt,gte'.split(',');
const UNARY_TESTS = 'isValid,isInvalid,isPositive,isNegative,isWhole,isZero,isInfinite,isInfiniteNeg,isEven,isOdd'.split(',');
const COMPARITAVE_TESTS = 'isGT,isLT,isGTE,isLTE,isEq,isMultOf,isNotMultOf'.split(',');
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
    if (!this.isValid) {
      if (is.f(fn)) {
        this._value = this.doV(fn);
      } else {
        this._value = fn;
      }
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
    this.do(() => fn(this.source));
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
    return !is.n(this.value);
  }

  get isInfinite() {
    return !this.isValid ? null : this.value === Number.POSITIVE_INFINITY;
  }

  get isInfiniteNeg() {
    return !this.isValid ? null : this.value === Number.NEGATIVE_INFINITY;
  }

  get isWhole() {
    return !this.isValid ? null : this.value === Math.round(this.value);
  }

  get isFloat() {
    return !this.isValid ? null : this.value !== Math.round(this.value);
  }

  get isPositive() {
    return !this.isValid ? null : this.value > 0;
  }

  get isNegative() {
    return !this.isValid ? null : this.value < 0;
  }

  get isZero() {
    return !this.isValid ? null : this.value === 0;
  }

  isGT(value) {
    if (!is.n(value)) {
      return null;
    }
    return !this.isValid ? null : this.value > value;
  }

  isLT(value) {
    if (!is.n(value)) {
      return null;
    }
    return !this.isValid ? null : this.value < value;
  }

  isGTE(value) {
    if (!is.n(value)) {
      return null;
    }
    return !this.isValid ? null : this.value >= value;
  }

  isLTE(value) {
    if (!is.n(value)) {
      return null;
    }
    return !this.isValid ? null : this.value <= value;
  }

  isEq(value) {
    if (!is.n(value)) {
      return null;
    }
    return !this.isValid ? null : this.value === value;
  }

  isMultOf(divisor) {
    if (!is.n(divisor)) {
      return null;
    }
    return !this.isValid ? null : !(this.value % divisor);
  }

  _f(fn, name = '') {
    if (!is.f(fn)) {
      throw new Error(`numb.${name}: ` + `${this.value}` + ' called with non function ' + `${fn}`);
    }
  }

  if(test, ifTrue, ifFalse, ifInvalid) {
    // value is invalid (and presumed untestable
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
    if (!this.isValid) {
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
      return this.do(ifTrue, test);
    } else if (test === false) {
      return this.do(ifFalse, test);
    } else {
      return this.if(test === this.value, ifTrue, ifFalse, ifInvalid);
    }
  }

  valid(fn, orFn) {
    this.if('isValid', fn, orFn);
    return proxy(this, 'isValid');
  }

  invalid(fn, orFn) {
    this.if('isInvalid', fn, orFn);
    return proxy(this, 'isInvalid');
  }

  positive(fn, orFn, invFn) {
    this.if('isPositive', fn, orFn, invFn);
    return proxy(this, 'isPositive');
  }

  negative(fn, orFn, invFn) {
    this.if('isNegative', fn, orFn, invFn);
    return proxy(this, 'isNegative');
  }

  zero(fn, orFn, invFn) {
    this.if('isZero', fn, orFn, invFn);
    return proxy(this, 'isZero');
  }

  whole(fn, orFn, invFn) {
    this.if('isWhole', fn, orFn, invFn);
    return proxy(this, 'isWhole');
  }

  float(fn, orFn, invFn) {
    this.if('isValid', fn, orFn, invFn);
    return proxy(this, 'isValid');
  }

  infinite(fn, orFn, invFn) {
    this.if('isInfinite', fn, orFn, invFn);
    return proxy(this, 'isInfinite');
  }

  infiniteNeg(fn, orFn, invFn) {
    this.if('isInfiniteNeg', fn, orFn, invFn);
    return proxy(this, 'isInfiniteNeg');
  }

  even(fn, orFn, invFn) {
    this.if('isEven', fn, orFn, invFn);
    return proxy(this, 'isEven');
  }

  odd(fn, orFn, invFn) {
    this.if('isOdd', fn, orFn, invFn);
    return proxy(this, 'isOdd');
  }

  gt(limit, fn, orFn, invFn) {
    this.if((value) => value > limit, fn, orFn, invFn);
    return proxy(this, 'isGT', limit);
  }

  multOf(divisor, fn, orFn, invFn) {
    this.if((value) => !(value % divisor), fn, orFn, invFn);
    return proxy(this, 'isMultOf', divisor);
  }

  gte(limit, fn, orFn, invFn) {
    this.if((value) => value >= limit, fn, orFn, invFn);
    return proxy(this, 'isGTE', limit);
  }

  lt(limit, fn, orFn, invFn) {
    this.if((value) => value < limit, fn, orFn, invFn);
    return proxy(this, 'isLT', limit);
  }

  lte(limit, fn, orFn, invFn) {
    this.if((value) => value <= limit, fn, orFn, invFn);
    return proxy(this, 'isLTE', limit);
  }

  eq(limit, fn, orFn, invFn) {
    this.if((value) => value === limit, fn, orFn, invFn);
    return proxy(this, 'isEq', limit);
  }
}

export default (...args) => new Numb(...args);
