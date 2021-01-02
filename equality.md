# How to determine if two things are equal

With `fp-ts` you can test whether two values are equal using a `Eq`. You can also compose equality functions to test deep structures and create your own definitions of equality.

We show the most common usages here, but if you need more ways to check for equality, be sure to read the [Eq](https://gcanti.github.io/fp-ts/modules/Eq.ts) documentation page.

## Primitive equality

```ts
import { eq } from "fp-ts";

eq.eqBoolean.equals(true, true); // true
eq.eqDate.equals(new Date("1984-01-27"), new Date("1984-01-27")); // true
eq.eqNumber.equals(3, 3); // true
eq.eqString.equals("Cyndi", "Cyndi"); // true
```

## Compare structures

```ts
import { eq } from "fp-ts";

type Point = {
  x: number;
  y: number;
};

const eqPoint: eq.Eq<Point> = eq.getStructEq({
  x: eq.eqNumber,
  y: eq.eqNumber
});

eqPoint.equals({ x: 0, y: 0 }, { x: 0, y: 0 }); // true
```

This structure can be combined further:

```ts
import { eq } from "fp-ts";

type Point = {
    x: number;
    y: number;
};

const eqPoint: eq.Eq<Point> = eq.getStructEq({
    x: eq.eqNumber,
    y: eq.eqNumber
});

type Vector = {
  from: Point;
  to: Point;
};

const eqVector: eq.Eq<Vector> = eq.getStructEq({
  from: eqPoint,
  to: eqPoint
});

eqVector.equals(
  { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } },
  { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } }
); // true
```

## Compare arrays

```ts
import { array, eq } from "fp-ts";

const eqArrayOfStrings = array.getEq(eq.eqString);

eqArrayOfStrings.equals(["Time", "After", "Time"], ["Time", "After", "Time"]); // true
```

Test the equality of structures nested within arrays:

```ts
import { array, eq } from "fp-ts";

type Point = {
  x: number;
  y: number;
};

const eqPoint: eq.Eq<Point> = eq.getStructEq({
  x: eq.eqNumber,
  y: eq.eqNumber
});

const eqArrayOfPoints: eq.Eq<Array<Point>> = array.getEq(eqPoint);

eqArrayOfPoints.equals(
  [
    { x: 0, y: 0 },
    { x: 4, y: 0 }
  ],
  [
    { x: 0, y: 0 },
    { x: 4, y: 0 }
  ]
); // true
```

## Custom definitions

In this example, two users are equal if their `userId` field is equal.

```ts
import { eq } from "fp-ts";

type User = {
  userId: number;
  name: string;
};

const eqUserId = eq.contramap((user: User) => user.userId)(eq.eqNumber);

eqUserId.equals(
  { userId: 1, name: "Giulio" },
  { userId: 1, name: "Giulio Canti" }
); // true
eqUserId.equals({ userId: 1, name: "Giulio" }, { userId: 2, name: "Giulio" }); // false
```

## More `Eq` instances

Many data types provide `Eq` instances. Here's [Option](https://gcanti.github.io/fp-ts/modules/Option.ts):

```ts
import { eq, option } from "fp-ts";

const E = option.getEq(eq.eqNumber);

E.equals(option.some(3), option.some(3)); // true
E.equals(option.none, option.some(4)); // false
E.equals(option.none, option.none); // true
```

It works similarly for [Either](https://gcanti.github.io/fp-ts/modules/Either.ts) and other types where it is possible to determine equality:

```ts
import { either, eq } from "fp-ts";

const E = either.getEq(eq.eqString, eq.eqNumber);

E.equals(either.right(3), either.right(3)); // true
E.equals(either.left("3"), either.right(3)); // false
E.equals(either.left("3"), either.left("3")); // true
```
