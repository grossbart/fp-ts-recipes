# How to determine the order of data

If you need to decide on the order of two values, you can make use of the `compare` method provided by `Ord` instances. Ordering builds on [equality](equality.md).

Note that `compare` returns an [Ordering](https://gcanti.github.io/fp-ts/modules/Ordering.ts), which is one of these values `-1 | 0 | 1`. We say that

- `x < y` if and only if `compare(x, y)` is equal to `-1`
- `x` is equal to `y` if and only if `compare(x, y)` is equal to `0`
- `x > y` if and only if `compare(x, y)` is equal to `1`

We show the most common usages here, but if you need more ways to order your data, be sure to read the [Ord](https://gcanti.github.io/fp-ts/modules/Ord.ts) documentation page.

## Primitive comparisons

```ts
import { ord } from "fp-ts";

ord.ordNumber.compare(4, 5); // -1
ord.ordNumber.compare(5, 5); // 0
ord.ordNumber.compare(6, 5); // 1

ord.ordBoolean.compare(true, false); // 1
ord.ordDate.compare(new Date("1984-01-27"), new Date("1978-09-23")); // 1
ord.ordString.compare("Cyndi", "Debbie"); // -1
```

Note that all `Ord` instances also define the `equals` method, because it is a prerequisite to be able to compare data.

```ts
import { ord } from "fp-ts";

ord.ordBoolean.equals(false, false); // true
```

## Custom comparisons

You can create custom comparisons using `fromCompare` like so:

```ts
import { ord } from "fp-ts";

const strlenOrd = ord.fromCompare((a: string, b: string) =>
  a.length < b.length ? -1 : a.length > b.length ? 1 : 0
);
strlenOrd.compare("Hi", "there"); // -1
strlenOrd.compare("Goodbye", "friend"); // 1
```

But most of the time, you can achieve the same result in a simpler way with `contramap`:

```ts
import { ord } from "fp-ts";

const strlenOrd = ord.contramap((s: string) => s.length)(ord.ordNumber);
strlenOrd.compare("Hi", "there"); // -1
strlenOrd.compare("Goodbye", "friend"); // 1
```

## Min, max, clamp

Take the smaller (`min`) or larger (`max`) element of two, or take the one closest to the given boundaries (`clamp`).

```ts
import { ord } from "fp-ts";

ord.min(ord.ordNumber)(5, 2); // 2
ord.max(ord.ordNumber)(5, 2); // 5

ord.clamp(ord.ordNumber)(3, 7)(2); // 3
ord.clamp(ord.ordString)("Bar", "Boat")("Ball"); // Bar
```

## Less than, greater than, or in between?

```ts
import { ord } from "fp-ts";

ord.lt(ord.ordNumber)(4, 7); // true
ord.geq(ord.ordNumber)(6, 6); // true

ord.between(ord.ordNumber)(6, 9)(7); // true
ord.between(ord.ordNumber)(6, 9)(6); // true
ord.between(ord.ordNumber)(6, 9)(9); // true
ord.between(ord.ordNumber)(6, 9)(12); // false
```

## Sort an array

```ts
import { array, ord } from "fp-ts";

const sortByNumber = array.sort(ord.ordNumber);
sortByNumber([3, 1, 2]); // [1, 2, 3]
```

Sort an array of objects:

```ts
import { array, ord } from "fp-ts";

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
];

const diameterOrd = ord.contramap((x: Planet) => x.diameter)(ord.ordNumber);
const distanceOrd = ord.contramap((x: Planet) => x.distance)(ord.ordNumber);

console.log(array.sort(distanceOrd)(planets)); // Mercury, Venus, Earth, Mars, ...
console.log(array.sort(diameterOrd)(planets)); // Mercury, Mars, Venus, Earth, ...
```

## More Ord instances

Many data types provide `Ord` instances. Here's [Option](https://gcanti.github.io/fp-ts/modules/Option.ts):

```ts
import { option, ord } from "fp-ts";

const O = option.getOrd(ord.ordNumber);
O.compare(option.none, option.none); // 0
O.compare(option.none, option.some(1)); // -1
O.compare(option.some(1), option.none); // 1
O.compare(option.some(1), option.some(2)); // -1
O.compare(option.some(1), option.some(1)); // 0
```

It works similarly for [Tuple](https://gcanti.github.io/fp-ts/modules/Tuple.ts)s and other types where it is possible to determine order:

```ts
import { ord } from "fp-ts";

const O = ord.getTupleOrd(ord.ordString, ord.ordNumber);
O.compare(["A", 10], ["A", 12]); // -1
O.compare(["A", 10], ["A", 4]); // 1
O.compare(["A", 10], ["B", 4]); // -1
```
