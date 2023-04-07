# How to determine the order of data

If you need to decide on the order of two values, you can make use of the `compare` method provided by `Ord` instances. Ordering builds on [equality](equality.md).

Note that `compare` returns an [Ordering](https://gcanti.github.io/fp-ts/modules/Ordering.ts), which is one of these values `-1 | 0 | 1`. We say that

- `x < y` if and only if `compare(x, y)` is equal to `-1`
- `x` is equal to `y` if and only if `compare(x, y)` is equal to `0`
- `x > y` if and only if `compare(x, y)` is equal to `1`

We show the most common usages here, but if you need more ways to order your data, be sure to read the [Ord](https://gcanti.github.io/fp-ts/modules/Ord.ts) documentation page.

## Primitive comparisons

```ts
import * as number from "fp-ts/number";
import * as string from "fp-ts/string";
import * as boolean from "fp-ts/boolean";
import * as date from "fp-ts/Date";

number.Ord.compare(4, 5); // -1
number.Ord.compare(5, 5); // 0
number.Ord.compare(6, 5); // 1

boolean.Ord.compare(true, false);
date.Ord.compare(new Date("1984-01-27"), new Date("1978-09-23")); // 1
string.Ord.compare("Cyndi", "Debbie"); // -1
```

Note that all `Ord` instances also define the `equals` method, because it is a prerequisite to be able to compare data.

```ts
import * as Ord from "fp-ts/Ord";
import * as boolean from "fp-ts/boolean";

Ord.equals(boolean.Ord)(false)(false); // true
```

## Custom comparisons

You can create custom comparisons using `fromCompare` like so:

```ts
import * as Ord from "fp-ts/Ord";

const strlenOrd = Ord.fromCompare((a: string, b: string) =>
  a.length < b.length ? -1 : a.length > b.length ? 1 : 0
);
strlenOrd.compare("Hi", "there"); // -1
strlenOrd.compare("Goodbye", "friend"); // 1
```

But most of the time, you can achieve the same result in a simpler way with `contramap`:

```ts
import * as Ord from "fp-ts/Ord";
import * as number from "fp-ts/number";

const strlenOrd = Ord.contramap((s: string) => s.length)(number.Ord);
strlenOrd.compare("Hi", "there"); // -1
strlenOrd.compare("Goodbye", "friend"); // 1
```

## Min, max, clamp

Take the smaller (`min`) or larger (`max`) element of two, or take the one closest to the given boundaries (`clamp`).

```ts
import * as Ord from "fp-ts/Ord";
import * as number from "fp-ts/number";
import * as string from "fp-ts/string";

Ord.min(number.Ord)(5, 2); // 2
Ord.max(number.Ord)(5, 2); // 5

Ord.clamp(number.Ord)(3, 7)(2); // 3
Ord.clamp(string.Ord)("Bar", "Boat")("Ball"); // Bar
```

## Less than, greater than, or in between?

```ts
import * as Ord from "fp-ts/Ord";
import * as number from "fp-ts/number";

Ord.lt(number.Ord)(4, 7); // true
Ord.geq(number.Ord)(6, 6); // true

Ord.between(number.Ord)(6, 9)(7); // true
Ord.between(number.Ord)(6, 9)(6); // true
Ord.between(number.Ord)(6, 9)(9); // true
Ord.between(number.Ord)(6, 9)(12); // false
```

## Sort an array

```ts
import * as A from "fp-ts/Array";
import * as number from "fp-ts/number";

const sortByNumber = A.sort(number.Ord);
sortByNumber([3, 1, 2]); // [1, 2, 3]
```

Sort an array of objects:

```ts
import * as A from "fp-ts/Array";
import * as Ord from "fp-ts/Ord";
import * as number from "fp-ts/number";

type Planet = {
  name: string;
  diameter: number; // km
  distance: number; // AU from Sun
};

const planets: Array<Planet> = [
  { name: "Earth", diameter: 12756, distance: 1 },
  { name: "Jupiter", diameter: 142800, distance: 5.203 },
  { name: "Mars", diameter: 6779, distance: 1.524 },
  { name: "Mercury", diameter: 4879.4, distance: 0.39 },
  { name: "Neptune", diameter: 49528, distance: 30.06 },
  { name: "Saturn", diameter: 120660, distance: 9.539 },
  { name: "Uranus", diameter: 51118, distance: 19.18 },
  { name: "Venus", diameter: 12104, distance: 0.723 },
  { name: "Nibiru", diameter: 142400, distance: 409 },
  { name: "Nibira", diameter: 142400, distance: 409 },
];

const diameterOrd = Ord.contramap((x: Planet) => x.diameter)(number.Ord);
const distanceOrd = Ord.contramap((x: Planet) => x.distance)(number.Ord);

console.log("distance", A.sort(distanceOrd)(planets)); // Mercury, Venus, Earth, Mars, ...
console.log("diameter", A.sort(diameterOrd)(planets)); // Mercury, Mars, Venus, Earth, ...
```

Sort array with two `Ord` instances using `Semigroup`. To combine more than two `Ord` instances use `Monoid`.

```ts
import { concatAll } from "fp-ts/Monoid";
import * as A from "fp-ts/Array";
import * as Ord from "fp-ts/Ord";
import * as number from "fp-ts/number";
import * as string from "fp-ts/string";

type Planet = {
  name: string;
  diameter: number; // km
  distance: number; // AU from Sun
};

const planets: Array<Planet> = [
  { name: "Earth", diameter: 12756, distance: 1 },
  { name: "Jupiter", diameter: 142800, distance: 5.203 },
  { name: "Mars", diameter: 6779, distance: 1.524 },
  { name: "Mercury", diameter: 4879.4, distance: 0.39 },
  { name: "Neptune", diameter: 49528, distance: 30.06 },
  { name: "Saturn", diameter: 120660, distance: 9.539 },
  { name: "Uranus", diameter: 51118, distance: 19.18 },
  { name: "Venus", diameter: 12104, distance: 0.723 },
  { name: "Nibiru", diameter: 142400, distance: 409 },
  { name: "Nibira", diameter: 142400, distance: 409 },
];

const diameterOrd = Ord.contramap((x: Planet) => x.diameter)(number.Ord);
const distanceOrd = Ord.contramap((x: Planet) => x.distance)(number.Ord);
const nameOrd = Ord.contramap((x: Planet) => x.name)(string.Ord);

const S = Ord.getSemigroup<Planet>();
const M = Ord.getMonoid<Planet>();

const diameterDistanceOrd = S.concat(diameterOrd, distanceOrd); // combine 2 Ord
const diameterDistanceNameOrd = concatAll(M)([diameterOrd, distanceOrd, nameOrd]); // combine 3 Ord

console.log("diameter-distance order", A.sort(diameterDistanceOrd)(planets)); // Mercury, Mars, Venus, Earth, ... , Nibiru, Jupiter
console.log("diameter-distance-name order", A.sort(diameterDistanceNameOrd)(planets)); // Mercury, Mars, Venus, Nibiru, ... , Nibira, Nibiru, Jupiret
```

## More Ord instances

Many data types provide `Ord` instances. Here's [Option](https://gcanti.github.io/fp-ts/modules/Option.ts):

```ts
import { option } from "fp-ts";
import * as Ord from "fp-ts/Ord";
import * as number from "fp-ts/number";

const O = option.getOrd(number.Ord);
O.compare(option.none, option.none); // 0
O.compare(option.none, option.some(1)); // -1
O.compare(option.some(1), option.none); // 1
O.compare(option.some(1), option.some(2)); // -1
O.compare(option.some(1), option.some(1)); // 0
```

It works similarly for [Tuple](https://gcanti.github.io/fp-ts/modules/Tuple.ts)s and other types where it is possible to determine order:

```ts
import * as Ord from "fp-ts/Ord";
import * as number from "fp-ts/number";
import * as string from "fp-ts/string";

const tuple = Ord.tuple(string.Ord, number.Ord);
tuple.compare(["A", 10], ["A", 12]); // -1
tuple.compare(["A", 10], ["A", 4]); // 1
tuple.compare(["A", 10], ["B", 4]); // -1
```
