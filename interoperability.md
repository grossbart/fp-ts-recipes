# How to work with non-functional code using fp-ts

Sometimes you are forced to interoperate with code not written in a functional style, let's see how to deal with it.

## Sentinels

- **Use case** – an API that may fail and returns a special value of the codomain.
- **Example** – `Array.prototype.findIndex`
- **Solution** – [Option](https://gcanti.github.io/fp-ts/modules/Option.ts)

```ts
import { Option, none, some } from "fp-ts/lib/Option";

function findIndex<A>(
  as: Array<A>,
  predicate: (a: A) => boolean
): Option<number> {
  const index = as.findIndex(predicate);
  return index === -1 ? none : some(index);
}
```

## undefined and null

- **Use case** – an API that may fail and returns undefined (or null).
- **Example** – `Array.prototype.find`
- **Solution** – [Option](https://gcanti.github.io/fp-ts/modules/Option.ts), [fromNullable](https://gcanti.github.io/fp-ts/modules/Option.ts#fromnullable-function)

```ts
import { Option, fromNullable } from "fp-ts/lib/Option";

function find<A>(as: Array<A>, predicate: (a: A) => boolean): Option<A> {
  return fromNullable(as.find(predicate));
}
```

## Exceptions

- **Use case** – an API that may throw.
- **Example** – `JSON.parse`
- **Solution** – [Either](https://gcanti.github.io/fp-ts/modules/Either.ts), [tryCatch](https://gcanti.github.io/fp-ts/modules/Either.ts#trycatch-function)

```ts
import { Either, tryCatch } from "fp-ts/lib/Either";

function parse(s: string): Either<Error, unknown> {
  return tryCatch(
    () => JSON.parse(s),
    reason => new Error(String(reason))
  );
}
```

## Random values

- **Use case** – an API that returns a non deterministic value.
- **Example** – `Math.random`
- **Solution** – [IO](https://gcanti.github.io/fp-ts/modules/IO.ts)

```ts
import { IO } from "fp-ts/lib/IO";

const random: IO<number> = () => Math.random();
```

## Synchronous side effects

- **Use case** – an API that reads and/or writes to a global state.
- **Example** – `localStorage.getItem`
- **Solution** – [IO](https://gcanti.github.io/fp-ts/modules/IO.ts)

```ts
import { Option, fromNullable } from "fp-ts/lib/Option";
import { IO } from "fp-ts/lib/IO";

function getItem(key: string): IO<Option<string>> {
  return () => fromNullable(localStorage.getItem(key));
}
```

- **Use case** – an API that reads and/or writes to a global state and may throw.
- **Example** – `readFileSync`
- **Solution** – [IOEither](https://gcanti.github.io/fp-ts/modules/IOEither.ts), [tryCatch](https://gcanti.github.io/fp-ts/modules/IOEither.ts#trycatch-function)

```ts
import * as fs from "fs";
import { IOEither, tryCatch } from "fp-ts/lib/IOEither";

function readFileSync(path: string): IOEither<Error, string> {
  return tryCatch(
    () => fs.readFileSync(path, "utf8"),
    reason => new Error(String(reason))
  );
}
```

## Asynchronous side effects

- **Use case** – an API that performs an asynchronous computation.
- **Example** – reading from standard input
- **Solution** – [Task](https://gcanti.github.io/fp-ts/modules/Task.ts)

```ts
const read: Task<string> = () =>
  new Promise<string>(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("", answer => {
      rl.close();
      resolve(answer);
    });
  });
```

- **Use case** – an API that performs an asynchronous computation and may reject.
- **Example** – fetch
- **Solution** – [TaskEither](https://gcanti.github.io/fp-ts/modules/TaskEither.ts), [tryCatch](https://gcanti.github.io/fp-ts/modules/TaskEither.ts#trycatch-function)

```ts
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";

function get(url: string): TaskEither<Error, string> {
  return tryCatch(
    () => fetch(url).then(res => res.text()),
    reason => new Error(String(reason))
  );
}
```

---

_This content was originally published as a [blog post](https://dev.to/gcanti/interoperability-with-non-functional-code-using-fp-ts-432e) on February 12, 2019._
