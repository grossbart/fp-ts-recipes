# Working with numbers

_fp-ts_ is not a math library, but there are some good facilities we can use to work with numbers. Because the examples below use abstract concepts, e.g. [Monoid](https://gcanti.github.io/fp-ts/modules/Monoid.ts)s, many of the examples below would work with other types of data, not just numbers.

## Min/max

```ts
import { Bounded } from "fp-ts/number";
import { concatAll, min, max } from "fp-ts/Monoid";

const minVal = concatAll(min(Bounded));
const maxVal = concatAll(max(Bounded));

minVal([5, 2, 3]); // 2
maxVal([5, 2, 3]); // 5
```

## Sums and products

```ts
import { MonoidSum, MonoidProduct } from "fp-ts/number";
import { concatAll } from "fp-ts/Monoid";

const sum = concatAll(MonoidSum);
const product = concatAll(MonoidProduct);

sum([1, 2, 3, 4]); // 10
product([1, 2, 3, 4]); // 24
```

## Working with nested structures

### Object

```ts
import { MonoidSum } from "fp-ts/number";
import { concatAll, struct } from "fp-ts/Monoid";

type Point = {
  x: number;
  y: number;
};

const monoidPoint = struct({
  x: MonoidSum,
  y: MonoidSum,
});

const monoidPoints = concatAll(monoidPoint);

monoidPoint.concat({ x: 0, y: 3 }, { x: 2, y: 4 }); // { x: 2, y: 7 }
monoidPoints([
  { x: 2, y: 2 },
  { x: 2, y: 2 },
  { x: 2, y: 2 },
]); // { x: 6, y: 6 }
```

To check whether the resulting `Point` is positive, create a predicate:

```ts
import { getMonoid } from "fp-ts/function";
import { MonoidAll } from "fp-ts/boolean";

type Point = {
  x: number;
  y: number;
};

const monoidPredicate = getMonoid(MonoidAll)<Point>();

const isPositiveX = (p: Point) => p.x >= 0;
const isPositiveY = (p: Point) => p.y >= 0;

const isPositiveXY = monoidPredicate.concat(isPositiveX, isPositiveY);

isPositiveXY({ x: 1, y: 1 }); // true
isPositiveXY({ x: 1, y: -1 }); // false
isPositiveXY({ x: -1, y: 1 }); // false
isPositiveXY({ x: -1, y: -1 }); // false
```

### Tuple

```ts
import { MonoidSum } from "fp-ts/number";
import { concatAll, tuple } from "fp-ts/Monoid";

type Point = [number, number];

const monoidPoint = tuple(MonoidSum, MonoidSum);

const monoidPoints = concatAll(monoidPoint);

monoidPoint.concat([0, 3], [2, 4]); // [2, 7]
monoidPoints([
  [2, 2],
  [2, 2],
  [2, 2],
]); // [6, 6]
```

Same for `Tuples`

```ts
import { getMonoid } from "fp-ts/function";
import { MonoidAll } from "fp-ts/boolean";

type Point = [number, number];

const monoidPredicate = getMonoid(MonoidAll)<Point>();

const isPositiveX = (p: Point) => p[0] >= 0;
const isPositiveY = (p: Point) => p[1] >= 0;

const isPositiveXY = monoidPredicate.concat(isPositiveX, isPositiveY);

isPositiveXY([1, 1]); // true
isPositiveXY([1, -1]); // false
isPositiveXY([-1, 1]); // false
isPositiveXY([-1, 1]); // false
```

## Working with optional values

```ts
import { some, none, Applicative } from "fp-ts/Option";
import { concatAll } from "fp-ts/Monoid";
import { MonoidSum, MonoidProduct } from "fp-ts/number";
import { getApplicativeMonoid } from "fp-ts/Applicative";

const sum = concatAll(getApplicativeMonoid(Applicative)(MonoidSum));
const product = concatAll(getApplicativeMonoid(Applicative)(MonoidProduct));

sum([some(2), none, some(4)]); // none
sum([some(2), some(3), some(4)]); // some(9)

product([some(2), none, some(4)]); // none
product([some(2), some(3), some(4)]); // some(24)
```

This also works for [Either](https://gcanti.github.io/fp-ts/modules/Either.ts)s, but note that folding on `Left` values does not work the same way as folding on `Right` values.

```ts
import { left, right, Applicative } from "fp-ts/Either";
import { concatAll } from "fp-ts/Monoid";
import { MonoidSum, MonoidProduct } from "fp-ts/number";
import { getApplicativeMonoid } from "fp-ts/Applicative";

const sum = concatAll(getApplicativeMonoid(Applicative)(MonoidSum));
const product = concatAll(getApplicativeMonoid(Applicative)(MonoidProduct));

sum([right(2), left(3), right(4)]); // left(3)
sum([right(2), right(3), right(4)]); // right(9)

product([right(2), left(3), left(4)]); // left(3) <- it's the first left value
product([right(2), right(3), right(4)]); // right(24)
```
