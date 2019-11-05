# Numb

This is a DSL for numeric validation. Tired of writing
verbose branchy logic for numbers, and hacky code to fix wierd values?

Don't you wish there were some sort of lodash currying system
for numbers? 

Numb is that. it is a compact(<10kb) library that helps you sanitize
and transform numbers in a quick, compact manner. 

## constructor

Numb takes a value and an optional hook for fixing bad data. 
It also accepts a synchronous function that will be caught.

_N extracts nested values from other _N's. 

```javascript

console.log(_N(3).value);
// 3
console.log(_N('3').value);
// 3 (coerced to number)
console.log(_N(_N(4)).value);
// 4

function divide(a, b) {
    if (b === 0) throw new Error('divide by zero');
    if (!_N(a).isValid || !_N(b).isValid) {
      throw new Error('bad arguments');
    }
    return a / b;
}

console.log(_N(() => divide(0, 0), 0).value)
// 0

console.log(_N(() => divide(0, 'string'),
    ({ message }) => {
      if (message === 'bad arguments') return -1;
      if (message === 'divide by zero') return 0;
      return null;
    }).value)
// -1

```

## `firstGood(...)` static method 

```javascript
_N().firstGood('string', [NaN, null, {a: 'foo', b: 100}, 2, 4], 4, NaN)
```

will find the first good value (2 in this case) in a flattened
list of all arguments. firstGood is a "static like" method - it ignores
the value of the initial _N(..). 

## reflection 

the value input to _N is returned as the `.value` of the result.
note, strings that are praseable by `Number.parseFloat()` are 
automatically "numberfield". 

The original input is saved in the `.source` property. 

```javascript

console.log(_N(2).value === 2 ? 'is two' : 'is not two');
// 'is two'
console.log(_N('2').value === 2 ? 'is two' : 'is not two');
// 'is two'
console.log(typeof(_N('2').value));
// 'number'
console.log(_N('bad data').value === Number.NaN ? 'is NaN' : 'is not NaN');
// 'is NaN'
console.log(_N('bad data').source === 'bad data' ? 'is bad data' : 'is not bad data');
// 'is bad data'

```

## tests - unary

The result of basic tests return one of three results:

* **true** if the test is positive
* **false** if the test is negative
* **null** if the target value is ifInvalid

note, they are properties, not methods/functions

### isPositive
### isNegative
### isZero
### isInfinte
### isInfiniteNeg
### isWhole

validation tests never return null.

* **true** if the test is positive
* **false** if the test is negative

### isInvalid
### isValid

``` javascript

import _N from '@wonderlandlabs/numb';

console.log(_N(10).isPositive); 
// true
console.log(_N(0).isPositive); 
// false
console.log(_N('string').isPositive); 
// null

console.log(_N(-10).isNegative); 
// true
console.log(_N(0).isNegative); 
// false
console.log(_N('string').isNegative); 
// null

console.log(_N(0).isZero); 
// true
console.log(_N(10).isZero); 
// false
console.log(_N('string').isZero); 
// null

console.log(_N(100).isInfiite);
// false
console.log(_N(Number.POSITIVE_INFINITY).isInfiite);
// true
```

Not very interesting; where the utility comes in is with
the validation methods:

## tests - functional

Tests which require a comparator;

### isGTE(value)
### isGT(value)
### isLT(value)
### isLTE(value)
### isEq(value)
### isMult(divisor)

note that ifInvalid input *or* comparator returns null;
null and false are both "falsy" so take care to evaluate return value carefully.

```javascript

console.log(_N(2).isEq(4));
// false
console.log(_N(2).isEq(2));
// true;
console.log(_N('string').isEq(2));
// null;
console.log(_N(2).isEq('string'));
// null;
```

## Fixing Bad Data

If you want to patch bad data, call the `.fix(valueOrFn)` method. 
If you pass a function, its response (to the original input) will
be substituted for the source value. 

```javascript

console.log(_N(2).fix(0).value);
// 2
console.log(_N('string').fix(0).value)
// 0
console.log(_N([2]).fix((value) => Array.isArray(value) ? value[0] : 0).value);
// 2
console.log(_N(3).fix((value) => Array.isArray(value) ? value[0] : 0).value);
// 3
```

## transformers

Transformer methods return a new Numb with the result of common number transform
calculations. They all return new _N instances; so require `.value` suffixes to 
get value. The good news is they can be chained.

Unary transformers
### sq()
### sqrt(abs)
### log()
### log10()
if (abs === true) then sqrt of -4 is -2;
### abs()
### absN() 
### pi() 
always negative
### ceil()
### floor()
### negate() *= -1
### rad
degrees to radians
### deg
radians to degrees

Binary transformers:

### add(n)
### sub(n)
### plus(n) 
### minus(n)
### times(n)
### div(n)
### pow(n)

Trigonometers:

### sin(isDeg)
### cos(isDeg)
### tan(isDeg)
### arcSin(toDeg)
### arcCos(toDeg)
### arcTan(toDeg)

Parameteric transformers

### clamp(limit, limit2) | clamp([limit, limit2])
clamp will return a value between the two limits,
regardless of order
### min(...values)
### max(...values)
### sum(...value)
min max and sum include the n's current value
### minS(...values)
### maxS(...values)
### sumS(...values)
minS, maxS, sumS ignore the _N's current value;

Transformers should never throw -- worst case, they result in NaN.

```javascript

console.log(
    _N(
      _N().firstGood('a', 2, 'b'),
    ).max(20)
      .times(4)
      .plus(1)
      .sqrt()
      .value
    );
// 9
```

## Fork functions

While you can use these methods in branching logic,
its more useful to listen to multiple branches defined by a test.
The validation methods have the same signature:

* `test(ifTrue, [? if false, [? if ifInvalid]])`

### ifValid(ifTrue, ifFalse)
### ifPositive(ifTrue, ifFalse, ifInvalid)
### ifNegative(ifTrue, ifFalse, ifInvalid)
### ifZero(ifTrue, ifFalse, ifInvalid)
### ifInfinite(ifTrue, ifFalse, ifInvalid)
### ifInfiniteNeg(ifTrue, ifFalse, ifInvalid)

* the **ifTrue** and **ifFalse** handler is passed the processed (ifValid value).
* the **ifInvalid** method is passed as a parameter the original unprocessed (ifInvalid) value. 

```javascript

const user = {
   hasArticles : false,
   username: 'fred'
}

const articles = await articleAPI.get(user.userName);

_N(_.get(articles, 'length'))
.ifValid((l) =>{
	user.hasArticles = true; 
	u.articles = articles;
	});

// or for a binary treatment:
_N(_.get(articles, 'length'))
.ifValid((l) =>{
	user.hasArticles = true; 
	u.articles = articles;
	}, 
	() => {
      user.hasArticles = false;
	  user.articles = [];
	});

```

#### `else()` chaining

Alternately you can call an `else(fn)` hook to trigger when the test fails. 
Note, the else clause will also trigger on ifInvalid data. 


```javascript

const user = {
   hasArticles : false,
   username: 'fred'
}

const articles = await articleAPI.get(user.userName);

_N(_.get(articles, 'length', 'no length'))
.ifValid((l) =>{
	user.hasArticles = true; 
	u.articles = articles;
	})
.else(
	() => {
	  user.hasArticles = false;
	  user.articles = [];
	});

```

`.else(fn?)` will "short circuit" if the initial test is true.
if the first test is *false*, any function in the else parameter
is called with the value, *and* additional tests will execute


```javascript

let called = '';

 _N(-2)
    .ifInvalid((n) => {
      called = `${n} is ifInvalid`;
    })
    .else((n) => called = `${n} is ifValid`)
    .ifPositive((n) => {
      called = _.trim(`${called} ${n} is positive`);
    })
    .else((n) => {
      called = _.trim(`${called} ${n} is non-positive`);
    });
console.log('called: ', called);
// -2 is ifValid -2 is non-positive;

 _N('bad value')
    .ifInvalid((n) => {
      called = `${n} is ifInvalid`;
    })
    .else((n) => called = `${n} is ifValid`)
    .ifPositive((n) => {
      called = _.trim(`${called} ${n} is positive`);
    })
    .else((n) => {
      called = _.trim(`${called} ${n} is non-positive`);
    });
console.log('called: ', called);
// 'bad value is ifInvalid'

```
note how neither the function in the else clause NOR
the positive or subsequent else clause is triggered.

chaining is fairly complex - while extensive tests have been run,
if the behavior fails to meet your expectations, find a way
to write your tests without the `.else()` chain.
