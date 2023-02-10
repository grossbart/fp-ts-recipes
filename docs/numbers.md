# Working with numbers

_fp-ts_ is not a math library, but there are some good facilities we can use to work with numbers. Because the examples below use abstract concepts, e.g. [Monoid](https://gcanti.github.io/fp-ts/modules/Monoid.ts)s, many of the examples below would work with other types of data, not just numbers.

## Min/max

```ts
import { bounded, monoid } from "fp-ts";

const min = monoid.fold(monoid.getMeetMonoid(bounded.boundedNumber));
const max = monoid.fold(monoid.getJoinMonoid(bounded.boundedNumber));

min([5, 2, 3]); // 2
max([5, 2, 3]); // 5

// fp-ts version 2.13.1

import { Bounded } from "fp-ts/number";
import { concatAll, min, max } from "fp-ts/Monoid";

const min = concatAll(min(Bounded));
const max = concatAll(max(Bounded));

min([5, 2, 3]); // 2
max([5, 2, 3]); // 5
```

## Sums and products

```ts
import { monoid } from "fp-ts";

const sum = monoid.fold(monoid.monoidSum);
const product = monoid.fold(monoid.monoidProduct);

sum([1, 2, 3, 4]); // 10
product([1, 2, 3, 4]); // 24

// fp-ts version 2.13.1

import { MonoidSum, MonoidProduct }  from "fp-ts/number";
import { concatAll } from "fp-ts/Monoid";

const sum = concatAll(MonoidSum);
const product = concatAll(MonoidProduct);

sum([1, 2, 3, 4]); // 10
product([1, 2, 3, 4]); // 24
```

## Working with nested structures

```ts
import { monoid } from "fp-ts";

type Point = {
  x: number;
  y: number;
};

const monoidPoint: monoid.Monoid<Point> = monoid.getStructMonoid({
  x: monoid.monoidSum,
  y: monoid.monoidSum,
});

monoidPoint.concat({ x: 0, y: 3 }, { x: 2, y: 4 }); // { x: 2, y: 7 }

// fp-ts version 2.13.1

import { MonoidSum }  from "fp-ts/number";
import { concatAll, struct } from "fp-ts/Monoid";

type Point = {
  x: number;
  y: number;
};

const monoidPoint = struct({
  x: MonoidSum,
  y: MonoidSum
});

const monoidPoints = concatAll(monoidPoint);

monoidPoint.concat({ x: 0, y: 3 }, { x: 2, y: 4 }); // { x: 2, y: 7 }
monoidPoints([ { x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 } ]) // { x: 6, y: 6 }
```

To check whether the resulting `Point` is positive, create a predicate:

```ts
import { monoid } from "fp-ts";

type Point = {
  x: number;
  y: number;
};

const monoidPredicate: monoid.Monoid<(p: Point) => boolean> = monoid.getFunctionMonoid(
  monoid.monoidAll
)<Point>();

const isPositiveX = (p: Point): boolean => p.x >= 0;
const isPositiveY = (p: Point): boolean => p.y >= 0;

const isPositiveXY = monoidPredicate.concat(isPositiveX, isPositiveY);

isPositiveXY({ x: 1, y: 1 }); // true
isPositiveXY({ x: 1, y: -1 }); // false
isPositiveXY({ x: -1, y: 1 }); // false
isPositiveXY({ x: -1, y: -1 }); // false
```

## Working with optional values

```ts
import { monoid, option } from "fp-ts";

const sum = monoid.fold(option.getApplyMonoid(monoid.monoidSum));
const product = monoid.fold(option.getApplyMonoid(monoid.monoidProduct));

sum([option.some(2), option.none, option.some(4)]); // option.none
sum([option.some(2), option.some(3), option.some(4)]); // option.some(9)

product([option.some(2), option.none, option.some(4)]); // option.none
product([option.some(2), option.some(3), option.some(4)]); // option.some(24)
```

This also works for [Either](https://gcanti.github.io/fp-ts/modules/Either.ts)s, but note that folding on `Left` values does not work the same way as folding on `Right` values.

```ts
import { either, monoid } from "fp-ts";

const sum = monoid.fold(either.getApplyMonoid(monoid.monoidSum));
const product = monoid.fold(either.getApplyMonoid(monoid.monoidProduct));

sum([either.right(2), either.left(3), either.right(4)]); // either.left(3)
sum([either.right(2), either.right(3), either.right(4)]); // either.right(9)
product([either.right(2), either.left(3), either.left(4)]); // either.left(3) <- it's the first either.left value
product([either.right(2), either.right(3), either.right(4)]); // either.right(24)
```
