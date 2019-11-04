/* eslint-disable camelcase */
const tap = require('tap');
const _ = require('lodash');
const p = require('./../package.json');

const _N = require('./../lib/index');

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
      v.test('number - valid', (vn) => {
        const numb1 = _N(1);

        vn.equal(numb1.value, 1, 'set value to 1');
        vn.ok(numb1.isValid, '1 is a valid number');

        const numb0 = _N(0);

        vn.equal(numb0.value, 0, 'set value to 0');
        vn.ok(numb0.isValid, '0 is a valid number');

        const numbPI = _N(Math.PI);

        vn.equal(numbPI.value, Math.PI, 'set value to PI');
        vn.ok(numbPI.isValid, 'PI is a valid number');

        const numbNegPi = _N(Math.PI * -1);

        vn.equal(numbNegPi.value, Math.PI * -1, 'set value to PI');
        vn.ok(numbNegPi.isValid, '-PI is a valid number');

        vn.end();
      });

      v.test('string', (vn) => {
        const numb1 = _N('1');

        vn.equal(numb1.value, 1, 'set value to 1');
        vn.ok(numb1.isValid, '1 is a valid number');

        const numb0 = _N('0');

        vn.equal(numb0.value, 0, 'set value to 0');
        vn.ok(numb0.isValid, '0 is a valid number');

        const numbPI = _N(`${Math.PI}`);

        vn.equal(numbPI.value, Math.PI, 'set value to PI');
        vn.ok(numbPI.isValid, 'PI is a valid number');

        const numbNegPi = _N(`${Math.PI * -1}`);
        vn.equal(numbNegPi.value, Math.PI * -1, 'set value to PI');
        vn.ok(numbNegPi.isValid, '-PI is a valid number');

        const invalidString = _N('not a number');

        vn.notOk(invalidString.isValid, 'a string that is not a number');

        vn.end();
      });
      v.test('string - spacy', (vn) => {
        const numb1 = _N(' 1 ');

        vn.equal(numb1.value, 1, 'set value to 1');
        vn.ok(numb1.isValid, '1 is a valid number');

        const numb0 = _N(' 0 ');

        vn.equal(numb0.value, 0, 'set value to 0');
        vn.ok(numb0.isValid, '0 is a valid number');

        const numbPI = _N(`   ${Math.PI}   `);

        vn.equal(numbPI.value, Math.PI, 'set value to PI');
        vn.ok(numbPI.isValid, 'PI is a valid number');

        const numbNegPi = _N(`    ${Math.PI * -1}   `);
        vn.equal(numbNegPi.value, Math.PI * -1, 'set value to PI');
        vn.ok(numbNegPi.isValid, '-PI is a valid number');

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
        p.same(_N('str)').isInfinite, null, 'invalid value is null');

        p.end();
      });

      q.end();
    });

    testNumb.test('currying', (c) => {
      c.test('valid', (cValid) => {
        let called = null;
        _N(1).valid((n) => {
          called = `${n} is valid`;
        }).else((n) => {
          called = `${n} is invalid`;
        });
        cValid.same(called, '1 is valid');
        cValid.end();
      });

      c.test('invalid', (cInvalid) => {
        let called = null;
        _N('not a number').valid((n) => {
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
          _N(2).positive((n) => {
            called = `${n} is positive`;
          }).else((n) => {
            called = `${n} is non-positive`;
          });
          cPosElse.same(called, '2 is positive');
          cPosElse.end();
        });

        cPositive.test('functional - true', (cPosFn) => {
          let called = null;
          _N(2).positive((n) => {
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
          _N(-2).positive((n) => {
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
          _N('blah').positive((n) => {
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
        _N(-2).positive((n) => {
          called = `${n} is positive`;
        })
          .else((n) => {
            called = `${n} is non-positive`;
          });
        cNonPos.same(called, '-2 is non-positive');
        cNonPos.end();
      });

      c.test('valid plus positive', (cValPos) => {
        cValPos.test('VPP for negative number', (c4neg) => {
          let called = '';

          _N(-2)
            .invalid((n) => {
              called = `${n} is invalid`;
            })
            .else((n) => called = `${n} is valid`)
            .positive((n) => {
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
            .invalid((n) => {
              called = `${n} is invalid`;
            })
            .else()
            .positive((n) => {
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
            .invalid((n) => {
              called = `${n} is invalid`;
            })
            .else()
            .positive((n) => {
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
      cat.test('if valid', (catVal) => {
        const n = _N(2)
          .fix(() => {
            throw new Error('should not execute');
          });

        catVal.same(n.value, 2);

        catVal.end();
      });

      cat.test('if invalid', (catVal) => {
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

          _N(20).gt(100, () => {
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

          _N(200).gt(100, () => {
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

          _N(null).gt(100, () => {
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

          _N(20).gt(100, () => {
            result = 'overflow';
          }).else((n) => {
            result = n;
          });

          gtGood.same(result, 20, 'result is within limits');
          gtGood.end();
        });

        gt.test('over limit', (gtGood) => {
          let result;

          _N(200).gt(100, () => {
            result = 'overflow';
          }).else((n) => {
            result = n;
          });

          gtGood.same(result, 'overflow', 'result is overflow');
          gtGood.end();
        });

        gt.test('invalid', (gtGood) => {
          let result;

          _N(null).gt(100, () => {
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

          _N(2).lt(10, () => {
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

          _N(200).lt(10, () => {
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

          _N('bad data').lt(10, () => {
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

          _N(20).gt(100, () => {
            result = 'overflow';
          }).else((n) => {
            result = n;
          });

          gtGood.same(result, 20, 'result is within limits');
          gtGood.end();
        });

        gt.test('over limit', (gtGood) => {
          let result;

          _N(200).gt(100, () => {
            result = 'overflow';
          }).else((n) => {
            result = n;
          });

          gtGood.same(result, 'overflow', 'result is overflow');
          gtGood.end();
        });

        gt.test('invalid', (gtGood) => {
          let result;

          _N(null).gt(100, () => {
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
            .lt(20, () => {
              label = 'low';
            })
            .else()
            .lt(50, () => {
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
            .lt(20, () => {
              label = 'low';
            })
            .else()
            .lt(50, () => {
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
            .invalid(() => label = 'invalid')
            .else()
            .lt(20, () => {
              label = 'low';
            })
            .else()
            .lt(50, () => {
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

    testNumb.end();
  });

  suite.end();
});
