/* eslint-disable camelcase */
const tap = require('tap');
const _ = require('lodash');
const p = require('./../package.json');

const _N = require('./../lib/index');

const fComp = (t, a, b, comment) => t.same(a.toFixed(4), b.toFixed(4), comment);
const extendF = (suite) => {
  suite.sameF = (...args) => fComp(suite, ...args);
  return suite;
};

tap.test(p.name, (suite) => {
  suite.test('_N', (testNumb) => {
    testNumb.test('constructor', (c) => {
      function divide(a, b) {
        if (b === 0) {
          throw new Error('divide by zero');
        }
        if (!_N(a).isValid || !_N(b).isValid) {
          throw new Error('bad arguments');
        }
        return a / b;
      }

      c.same(_N(() => divide(0, 0), 0).value,
        0, 'second parameter catches error');

      c.same(_N(() => divide(10, 'string'),
        ({ message }) => {
          if (message === 'bad arguments') {
            return -1;
          }
          if (message === 'divide by zero') {
            return 0;
          }
          return null;
        }).value,
      -1, 'second parameter catches error');

      c.end();
    });

    testNumb.test('validation', (v) => {
      v.test('number - ifValid', (vn) => {
        const numb1 = _N(1);

        vn.equal(numb1.value, 1, 'set value to 1');
        vn.ok(numb1.isValid, '1 is a ifValid number');

        const numb0 = _N(0);

        vn.equal(numb0.value, 0, 'set value to 0');
        vn.ok(numb0.isValid, '0 is a ifValid number');

        const numbPI = _N(Math.PI);

        vn.equal(numbPI.value, Math.PI, 'set value to PI');
        vn.ok(numbPI.isValid, 'PI is a ifValid number');

        const numbNegPi = _N(Math.PI * -1);

        vn.equal(numbNegPi.value, Math.PI * -1, 'set value to PI');
        vn.ok(numbNegPi.isValid, '-PI is a ifValid number');

        vn.end();
      });

      v.test('string', (vn) => {
        const numb1 = _N('1');

        vn.equal(numb1.value, 1, 'set value to 1');
        vn.ok(numb1.isValid, '1 is a ifValid number');

        const numb0 = _N('0');

        vn.equal(numb0.value, 0, 'set value to 0');
        vn.ok(numb0.isValid, '0 is a ifValid number');

        const numbPI = _N(`${Math.PI}`);

        vn.equal(numbPI.value, Math.PI, 'set value to PI');
        vn.ok(numbPI.isValid, 'PI is a ifValid number');

        const numbNegPi = _N(`${Math.PI * -1}`);
        vn.equal(numbNegPi.value, Math.PI * -1, 'set value to PI');
        vn.ok(numbNegPi.isValid, '-PI is a ifValid number');

        const invalidString = _N('not a number');

        vn.notOk(invalidString.isValid, 'a string that is not a number');

        vn.end();
      });
      v.test('string - spacy', (vn) => {
        const numb1 = _N(' 1 ');

        vn.equal(numb1.value, 1, 'set value to 1');
        vn.ok(numb1.isValid, '1 is a ifValid number');

        const numb0 = _N(' 0 ');

        vn.equal(numb0.value, 0, 'set value to 0');
        vn.ok(numb0.isValid, '0 is a ifValid number');

        const numbPI = _N(`   ${Math.PI}   `);

        vn.equal(numbPI.value, Math.PI, 'set value to PI');
        vn.ok(numbPI.isValid, 'PI is a ifValid number');

        const numbNegPi = _N(`    ${Math.PI * -1}   `);
        vn.equal(numbNegPi.value, Math.PI * -1, 'set value to PI');
        vn.ok(numbNegPi.isValid, '-PI is a ifValid number');

        vn.end();
      });

      v.test('large nums', (ln) => {
        const inf = _N(Number.POSITIVE_INFINITY);
        ln.ok(inf.isValid);
        ln.same(inf.value, Number.POSITIVE_INFINITY);

        const infNeg = _N(Number.NEGATIVE_INFINITY);
        ln.ok(infNeg.isValid);
        ln.same(infNeg.value, Number.NEGATIVE_INFINITY);

        const bigNum = _N(2n ** 53n);
        ln.ok(bigNum.isValid);
        ln.ok(bigNum.value === 2n ** 53n);
        // ln.same(bigNum.value, 2n ** 53n);

        ln.end();
      });

      v.test('gt', (gt) => {
        gt.ok(_N(10).isGT(5));
        gt.end();
      });
      v.end();
    });

    testNumb.test('qualifying', (q) => {
      q.test('isPositive', (p) => {
        p.same(_N(1).isPositive, true, 'isPositive is true');
        p.same(_N(-1).isPositive, false, 'isPositive is false');
        p.same(_N('str)').isPositive, null, 'invalid value is null');

        p.end();
      });

      q.test('isZero', (p) => {
        p.same(_N(0).isZero, true, 'isZero is true');
        p.same(_N(-1).isZero, false, 'isZero is false');
        p.same(_N('str)').isZero, null, 'invalid value is null');

        p.end();
      });

      q.test('isNegative', (p) => {
        p.same(_N(-1).isNegative, true, 'isNegative is true');
        p.same(_N(0).isNegative, false, 'isNegative is false');
        p.same(_N('str)').isNegative, null, 'invalid value is null');

        p.end();
      });

      q.test('isWhole', (p) => {
        p.same(_N(1).isWhole, true, 'isWhole is true');
        p.same(_N(1.1).isWhole, false, 'isWhole is false');
        p.same(_N('str)').isWhole, null, 'invalid value is null');

        p.end();
      });

      q.test('isFloat', (p) => {
        p.same(_N(1.1).isFloat, true, 'isFloat is true');
        p.same(_N(1).isFloat, false, 'isFloat is false');
        p.same(_N('str)').isFloat, null, 'invalid value is null');

        p.end();
      });

      q.test('isInfinite', (p) => {
        p.same(_N(Number.POSITIVE_INFINITY).isInfinite, true, 'isInfinite is true');
        p.same(_N(100).isInfinite, false, 'isInfinite is false');
        p.same(_N('str)').isInfinite, null, 'ifInvalid value is null');

        p.end();
      });

      q.end();
    });

    testNumb.test('currying', (c) => {
      c.test('valid', (cValid) => {
        let called = null;
        _N(1).ifValid((n) => {
          called = `${n} is valid`;
        }).else((n) => {
          called = `${n} is invalid`;
        });
        cValid.same(called, '1 is valid');
        cValid.end();
      });

      c.test('invalid', (cInvalid) => {
        let called = null;
        _N('not a number').ifValid((n) => {
          called = `${n} is valid`;
        }).else((n) => {
          called = `${n} is invalid`;
        });
        cInvalid.same(called, 'not a number is invalid');
        cInvalid.end();
      });

      c.test('positive', (cPositive) => {
        cPositive.test('else syntax', (cPosElse) => {
          let called = null;
          _N(2).ifPositive((n) => {
            called = `${n} is positive`;
          }).else((n) => {
            called = `${n} is non-positive`;
          });
          cPosElse.same(called, '2 is positive');
          cPosElse.end();
        });

        cPositive.test('functional - true', (cPosFn) => {
          let called = null;
          _N(2).ifPositive((n) => {
            called = `${n} is positive`;
          }, (n) => {
            called = `${n} is non-positive`;
          },
          (v) => {
            called = `${v} is invalid`;
          });
          cPosFn.same(called, '2 is positive');
          cPosFn.end();
        });

        cPositive.test('functional - false', (cPosFn) => {
          let called = null;
          _N(-2).ifPositive((n) => {
            called = `${n} is positive`;
          }, (n) => {
            called = `${n} is non-positive`;
          },
          (v) => {
            called = `${v} is invalid`;
          });
          cPosFn.same(called, '-2 is non-positive');
          cPosFn.end();
        });

        cPositive.test('functional - invalid', (cPosFn) => {
          let called = null;
          _N('blah').ifPositive((n) => {
            called = `${n} is positive`;
          }, (n) => {
            called = `${n} is non-positive`;
          },
          (v) => {
            called = `${v} is invalid`;
          });
          cPosFn.same(called, 'blah is invalid');
          cPosFn.end();
        });

        cPositive.end();
      });

      c.test('non-positive', (cNonPos) => {
        let called = null;
        _N(-2).ifPositive((n) => {
          called = `${n} is positive`;
        })
          .else((n) => {
            called = `${n} is non-positive`;
          });
        cNonPos.same(called, '-2 is non-positive');
        cNonPos.end();
      });

      c.test('ifValid plus positive', (cValPos) => {
        cValPos.test('VPP for negative number', (c4neg) => {
          let called = '';

          _N(-2)
            .ifInvalid((n) => {
              called = `${n} is invalid`;
            })
            .else((n) => called = `${n} is valid`)
            .ifPositive((n) => {
              called = _.trim(`${called} ${n} is positive`);
            })
            .else((n) => {
              called = _.trim(`${called} ${n} is non-positive`);
            });

          c4neg.same(called, '-2 is valid -2 is non-positive');
          c4neg.end();
        });

        cValPos.test('for positive number', (c4pos) => {
          let called = '';
          _N(2)
            .ifInvalid((n) => {
              called = `${n} is invalid`;
            })
            .else()
            .ifPositive((n) => {
              called = _.trim(`${called} ${n} is positive`);
            })
            .else((n) => {
              called = _.trim(`${called} ${n} is non-positive`);
            });

          c4pos.same(called, '2 is positive');
          c4pos.end();
        });

        cValPos.test('for non number', (c4nn) => {
          let called = '';
          _N('a bad string')
            .ifInvalid((n) => {
              called = `${n} is invalid`;
            })
            .else()
            .ifPositive((n) => {
              called = _.trim(`${called} ${n} is positive`);
            })
            .else((n) => {
              called = _.trim(`${called} ${n} is non-positive`);
            });

          c4nn.same(called, 'a bad string is invalid');
          c4nn.end();
        });

        cValPos.end();
      });
      c.end();
    });

    testNumb.test('fix', (cat) => {
      cat.test('if ifValid', (catVal) => {
        const n = _N(2)
          .fix(() => {
            throw new Error('should not execute');
          });

        catVal.same(n.value, 2);

        catVal.end();
      });

      cat.test('if ifInvalid', (catVal) => {
        const n = _N('two')
          .fix((val) => {
            if (val === 'one') {
              return 1;
            }
            if (val === 'two') {
              return 2;
            }
            return val;
          });

        catVal.same(n.value, 2);

        catVal.end();
      });

      cat.end();
    });

    testNumb.test('range', (r) => {
      r.test('gt', (gt) => {
        gt.test('in limit', (gtGood) => {
          let result;

          _N(20).ifGT(100, () => {
            result = 'overflow';
          }, (n) => {
            result = n;
          }, () => {
            result = 'invalid';
          });

          gtGood.same(result, 20, 'result is within limits');
          gtGood.end();
        });

        gt.test('over limit', (gtGood) => {
          let result;

          _N(200).ifGT(100, () => {
            result = 'overflow';
          }, (n) => {
            result = n;
          }, () => {
            result = 'invalid';
          });

          gtGood.same(result, 'overflow', 'result is overflow');
          gtGood.end();
        });

        gt.test('invalid', (gtGood) => {
          let result;

          _N(null).ifGT(100, () => {
            result = 'overflow';
          }, (n) => {
            result = n;
          }, () => {
            result = 'invalid';
          });

          gtGood.same(result, 'invalid', 'result is invalid');
          gtGood.end();
        });

        gt.end();
      });

      r.test('gt-else', (gt) => {
        gt.test('in limit', (gtGood) => {
          let result;

          _N(20).ifGT(100, () => {
            result = 'overflow';
          }).else((n) => {
            result = n;
          });

          gtGood.same(result, 20, 'result is within limits');
          gtGood.end();
        });

        gt.test('over limit', (gtGood) => {
          let result;

          _N(200).ifGT(100, () => {
            result = 'overflow';
          }).else((n) => {
            result = n;
          });

          gtGood.same(result, 'overflow', 'result is overflow');
          gtGood.end();
        });

        gt.test('invalid', (gtGood) => {
          let result;

          _N(null).ifGT(100, () => {
            result = 'overflow';
          }, (n) => {
            result = n;
          }, () => {
            result = 'invalid';
          });

          gtGood.same(result, 'invalid', 'result is invalid');
          gtGood.end();
        });

        gt.end();
      });

      r.test('lt', (lt) => {
        lt.test('too low', (gtGood) => {
          let result;

          _N(2).ifLT(10, () => {
            result = 'too low';
          }, (n) => {
            result = n;
          }, () => {
            result = 10;
          });

          gtGood.same(result, 'too low', 'result is too low');
          gtGood.end();
        });

        lt.test('within limit', (gtGood) => {
          let result;

          _N(200).ifLT(10, () => {
            result = 'too low';
          }, (n) => {
            result = n;
          }, () => {
            result = 10;
          });

          gtGood.same(result, 200, 'result is enough');
          gtGood.end();
        });

        lt.test('invalid', (gtGood) => {
          let result;

          _N('bad data').ifLT(10, () => {
            result = 'too low';
          }, (n) => {
            result = n;
          }, () => {
            result = 10;
          });

          gtGood.same(result, 10, 'result is set to minimum');
          gtGood.end();
        });

        lt.end();
      });

      r.test('lt-else', (gt) => {
        gt.test('in limit', (gtGood) => {
          let result;

          _N(20).ifGT(100, () => {
            result = 'overflow';
          }).else((n) => {
            result = n;
          });

          gtGood.same(result, 20, 'result is within limits');
          gtGood.end();
        });

        gt.test('over limit', (gtGood) => {
          let result;

          _N(200).ifGT(100, () => {
            result = 'overflow';
          }).else((n) => {
            result = n;
          });

          gtGood.same(result, 'overflow', 'result is overflow');
          gtGood.end();
        });

        gt.test('invalid', (gtGood) => {
          let result;

          _N(null).ifGT(100, () => {
            result = 'overflow';
          }, (n) => {
            result = n;
          }, () => {
            result = 'invalid';
          });

          gtGood.same(result, 'invalid', 'result is invalid');
          gtGood.end();
        });

        gt.end();
      });

      r.test('lt-proxy', (ltp) => {
        ltp.test('bracket one', (ltp1) => {
          let label = '';

          _N(0)
            .ifLT(20, () => {
              label = 'low';
            })
            .else()
            .ifLT(50, () => {
              label = 'medium';
            })
            .else(() => {
              label = 'large';
            });

          ltp1.same(label, 'low', 'value is low');

          ltp1.end();
        });
        ltp.test('bracket two', (ltp2) => {
          let label = '';

          _N(40)
            .ifLT(20, () => {
              label = 'low';
            })
            .else()
            .ifLT(50, () => {
              label = 'medium';
            })
            .else(() => {
              label = 'large';
            });

          ltp2.same(label, 'medium', 'value is medium');

          ltp2.end();
        });

        ltp.test('bracket three', (ltp3) => {
          let label = '';

          _N(60)
            .ifInvalid(() => label = 'invalid')
            .else()
            .ifLT(20, () => {
              label = 'low';
            })
            .else()
            .ifLT(50, () => {
              label = 'medium';
            })
            .else(() => {
              label = 'large';
            });

          ltp3.same(label, 'large', 'value is large');

          ltp3.end();
        });

        ltp.end();
      });
      r.end();
    });

    testNumb.test('multOf', (m) => {
      m.test('valid', (mv) => {
        mv.end();
      });

      m.end();
    });

    testNumb.test('modifiers', (m) => {
      m.test('ceil', (ceil) => {
        ceil.same(_N(3).ceil().value, 3, 'ceil of whole is initial value');
        ceil.same(_N(3.1).ceil().value, 4);
        ceil.same(_N(2.9).ceil().value, 3);

        ceil.end();
      });

      m.test('round', (round) => {
        round.same(_N(3).round().value, 3, 'round of whole is initial value');
        round.same(_N(3.1).round().value, 3);
        round.same(_N(2.9).round().value, 3);

        round.end();
      });

      m.test('round', (floor) => {
        floor.same(_N(3).floor().value, 3, 'floor of whole is initial value');
        floor.same(_N(3.1).floor().value, 3);
        floor.same(_N(2.9).floor().value, 2);

        floor.end();
      });

      m.test('max', (max) => {
        max.same(_N(3).max(5).value, 5, 'max of 3 and 5 is 5');
        max.same(_N(5).max(_N(7)).value, 7, 'max of 5 and _N(7) is 7');
        max.same(_N(3).max([]).value, 3, 'max of 3 and empty set is 3');
        max.same(_N(3).max(-5).value, 3, 'max of 3 and -5 is 3');
        max.same(_N('bad value').max(5).value, NaN, 'max of bad value and num is NAN');
        max.same(_N(3).max('bad value').value, NaN, 'max of num and bad value  is NAN');

        max.same(_N(3).max([4, 5, 6, 2]).value, 6, 'max of set is 6');
        max.same(_N(3).max([4, _N(5), 6, 2]).value, 6, 'max of set is 6');
        max.same(_N(3).max([4, _N(7), 6, 2]).value, 7, 'max of set is 7');
        max.same(_N('bad value').max([4, 5, 6, 2]).value, NaN, 'max of NAN and set is NAN');
        max.same(_N(3).max([4, 5, 'bad value', 2]).value, NaN, 'max of bad set is NAN');

        max.test('either', (me) => {
          me.same(_N(3).max(5, true).value, 5, 'max of 3 and 5 is 5');
          max.same(_N(3).max([], true).value, 3, 'max of 3 and empty set is 3');
          me.same(_N(3).max(-5, true).value, 3, 'max of 3 and -5 is 3');
          me.same(_N('bad value').max(5, true).value, 5, 'max of bad value and num is 5');
          me.same(_N(3).max('bad value', true).value, 3, 'max of num and bad value  is 3');

          me.same(_N(3).max([4, 5, 6, 2], true).value, 6, 'max of set is 6');
          me.same(_N('bad value').max([4, 5, 6, 2], true).value, 6, 'max of NAN and set is 6');
          me.same(_N(3).max([4, 5, 'bad value', 2], true).value, 5, 'max of bad set is 5');
          me.end();
        });
        max.end();
      });

      m.test('min', (min) => {
        min.same(_N(3).min(5).value, 3, 'min of 3 and 5 is 3');
        min.same(_N(3).min([]).value, 3, 'min of 3 and empty set is 3');
        min.same(_N(3).min(-5).value, -5, 'min of 3 and -5 is -5');
        min.same(_N('bad value').min(5).value, NaN, 'min of bad value and num is NAN');
        min.same(_N(3).min('bad value').value, NaN, 'min of num and bad value  is NAN');

        min.same(_N(3).min([4, 5, 6, 2]).value, 2, 'min of set is 2');
        min.same(_N('bad value').min([4, 5, 6, 2]).value, NaN, 'min of NAN and set is NAN');
        min.same(_N(3).min([4, 5, 'bad value', 2]).value, NaN, 'min of bad set is NAN');

        min.test('either', (me) => {
          me.same(_N(3).min(5, true).value, 3, 'min of 3 and 5 is 3');
          min.same(_N(3).min([], true).value, 3, 'min of 3 and empty set is 3');
          me.same(_N(3).min(-5, true).value, -5, 'min of 3 and -5 is -5');
          me.same(_N('bad value').min(5, true).value, 5, 'min of bad value and num is 5');
          me.same(_N(3).min('bad value', true).value, 3, 'min of num and bad value  is 3');

          me.same(_N(3).min([4, 5, 6, 2], true).value, 2, 'min of set is 2');
          me.same(_N('bad value').min([4, 5, 6, 2], true).value, 2, 'min of NAN and set is 2');
          me.same(_N(3).min([4, 5, 'bad value', 2], true).value, 2, 'min of bad set is 2');
          me.end();
        });

        min.end();
      });

      m.test('sum, mean', (sum) => {
        sum.same(_N().sum([1, 2, 3]).value, 6);
        sum.same(_N(5).sum([5, 10]).value, 20);
        sum.same(_N(5).sumS([5, 10]).value, 15);
        sum.same(_N().sum([1, 2, 'str']).value, NaN);
        sum.same(_N().sum([1, 2, 'str'], true).value, 3);

        sum.end();
      });

      m.test('plus', (plus) => {
        plus.same(_N(3).plus(1).value, 4, 'adds good numbers');
        plus.same(_N(3).plus('1').value, 4, 'adds good numbers');
        plus.same(_N(3).plus('one').value, NaN, 'bad add to NaN');
        plus.same(_N('three').plus(1).value, NaN, 'bad value add to NaN');
        plus.end();
      });

      m.test('minus', (minus) => {
        minus.same(_N(3).minus(1).value, 2, 'subs good numbers');
        minus.same(_N(3).minus('1').value, 2, 'subs good numbers');
        minus.same(_N(3).minus('one').value, NaN, 'bad subs to NaN');
        minus.same(_N('three').minus(1).value, NaN, 'bad value minus to NaN');
        minus.end();
      });

      m.test('clamp', (clamp) => {
        clamp.same(_N(3).clamp(0, 4).value, 3);
        clamp.same(_N(-3).clamp(0, 4).value, 0);
        clamp.same(_N(30).clamp(0, 4).value, 4);
        clamp.same(_N(2).clamp([0, 1]).value, 1);
        clamp.same(_N(-20).clamp([0, 1]).value, 0);
        clamp.end();
      });

      m.test('pow', (pow) => {
        pow.same(_N(4).pow(2).value, 16);
        pow.same(_N(3).sq().value, 9);
        pow.same(_N(-3).sq().value, 9);

        pow.same(_N(16).sqrt().value, 4);
        pow.same(_N(-16).sqrt().value, NaN);
        pow.same(_N(-16).sqrt(true).value, -4);
        pow.end();
      });

      m.test('trig', (trig) => {
        extendF(trig);
        const rad60 = Math.PI / 3;
        const cos60 = Math.cos(rad60);
        const sin60 = Math.sin(rad60);
        const tan60 = Math.tan(rad60);

        trig.sameF(_N(rad60).cos().value, cos60, 'cos from rad');
        trig.sameF(_N(60).cos(true).value, cos60, 'cos from degree');
        trig.sameF(_N(rad60).sin().value, sin60, 'sin from rad');
        trig.sameF(_N(60).sin(true).value, sin60, 'sin from deg');
        trig.sameF(_N(rad60).tan().value, tan60, 'tan in rad');
        trig.sameF(_N(60).tan(true).value, tan60, 'tan in deg');

        trig.sameF(_N(cos60).arcCos().value, rad60, 'arcCos in rad');
        trig.sameF(_N(cos60).arcCos(true).value, 60, 'arcCos in deg');

        trig.sameF(_N(sin60).arcSin().value, rad60, 'arcSin in rad');
        trig.sameF(_N(sin60).arcSin(true).value, 60, 'arcSin in deg');

        trig.sameF(_N(tan60).arcTan().value, rad60, 'arcTan in rad');
        trig.sameF(_N(tan60).arcTan(true).value, 60, 'arcTan in deg');

        trig.end();
      });

      m.test('div/times', (other) => {
        other.same(_N(12).div(4).value, 3, 'div good numbers');
        other.same(_N(12).div('4').value, 3, 'div good numbers');
        other.same(_N(3).div('one').value, NaN, 'bad div to NaN');
        other.same(_N('three').div(1).value, NaN, 'bad value div to NaN');

        other.same(_N(12).times(4).value, 48, 'times good numbers');
        other.same(_N(12).times('4').value, 48, 'times good numbers');
        other.same(_N(3).times('one').value, NaN, 'bad times to NaN');
        other.same(_N('three').times(1).value, NaN, 'bad value times to NaN');

        other.end();
      });

      m.test('clampDeg', (cd) => {
        cd.same(_N(NaN).clampDeg().value, NaN);
        cd.same(_N(0).clampDeg().value, 0);
        cd.same(_N(360).clampDeg().value, 0);
        cd.same(_N(1000).clampDeg().value, 280);
        cd.same(_N(1).clampDeg().value, 1);
        cd.same(_N(90).clampDeg().value, 90);
        cd.same(_N(-90).clampDeg().value, 270);
        cd.same(_N(180).clampDeg().value, 180);
        cd.same(_N(-180).clampDeg().value, 180);

        cd.end();
      });


      m.test('clampDeg180', (cd) => {
        cd.same(_N(NaN).clampDeg180().value, NaN);
        cd.same(_N(0).clampDeg180().value, 0);
        cd.same(_N(360).clampDeg180().value, 0);
        cd.same(_N(1000).clampDeg180().value, -80);
        cd.same(_N(1).clampDeg180().value, 1);
        cd.same(_N(90).clampDeg180().value, 90);
        cd.same(_N(-90).clampDeg180().value, -90);
        cd.same(_N(-95).clampDeg180().value, -95);
        cd.same(_N(180).clampDeg180().value, 180);
        cd.same(_N(-180).clampDeg180().value, -180);
        cd.same(_N(-185).clampDeg180().value, 175);

        cd.end();
      });

      m.test('chaining', (chain) => {
        chain.same(
          _N(
            _N().firstGood('a', 2, 'b'),
          ).max(20)
            .times(4)
            .plus(1)
            .sqrt()
            .value, 9, 'chaining operators',
        );


        chain.same(
          _N('100')
            .sub(200)
            .sqrt()
            .value, NaN,
          'chaining with sqrt negative',
        );
        chain.end();
      });

      m.end();
    });

    testNumb.test('first good', (first) => {
      first.same(_N().firstGood().value, NaN, 'no param is NaN');
      first.same(_N().firstGood('string').value, NaN, 'no param is NaN');
      first.same(_N().firstGood(['string']).value, NaN, 'no param is NaN');
      first.same(_N().firstGood('string', [{}, 2, 4], 3).value, 2, 'list is first good');
      first.end();
    });

    testNumb.end();
  });

  suite.end();
});
