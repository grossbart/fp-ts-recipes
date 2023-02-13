# How to work with non-functional code using fp-ts

Sometimes you are forced to interoperate with code not written in a functional style, let's see how to deal with it.

## Sentinels

- **Use case** – an API that may fail and returns a special value of the codomain.
- **Example** – `Array.prototype.findIndex`
- **Solution** – [Option](https://gcanti.github.io/fp-ts/modules/Option.ts)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { option } from "fp-ts";

function findIndex<A>(as: Array<A>, predicate: (a: A) => boolean): option.Option<number> {
  const index = as.findIndex(predicate);
  return index === -1 ? option.none : option.some(index);
}
```

## undefined and null

- **Use case** – an API that may fail and returns undefined (or null).
- **Example** – `Array.prototype.find`
- **Solution** – [Option](https://gcanti.github.io/fp-ts/modules/Option.ts), [fromNullable](https://gcanti.github.io/fp-ts/modules/Option.ts#fromnullable-function)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { option } from "fp-ts";

function find<A>(as: Array<A>, predicate: (a: A) => boolean): option.Option<A> {
  return option.fromNullable(as.find(predicate));
}
```

## Exceptions

- **Use case** – an API that may throw.
- **Example** – `JSON.parse`
- **Solution** – [Either](https://gcanti.github.io/fp-ts/modules/Either.ts), [tryCatch](https://gcanti.github.io/fp-ts/modules/Either.ts#trycatch-function)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { either } from "fp-ts";

function parse(s: string): either.Either<Error, unknown> {
  return either.tryCatch(
    () => JSON.parse(s),
    (reason) => new Error(String(reason))
  );
}
```

## Random values

- **Use case** – an API that returns a non deterministic value.
- **Example** – `Math.random`
- **Solution** – [IO](https://gcanti.github.io/fp-ts/modules/IO.ts)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { io } from "fp-ts";

const random: io.IO<number> = () => Math.random();
```

## Synchronous side effects

- **Use case** – an API that reads and/or writes to a global state.
- **Example** – `localStorage.getItem`
- **Solution** – [IO](https://gcanti.github.io/fp-ts/modules/IO.ts)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { io, option } from "fp-ts";

function getItem(key: string): io.IO<option.Option<string>> {
  return () => option.fromNullable(localStorage.getItem(key));
}
```

- **Use case** – an API that reads and/or writes to a global state and may throw.
- **Example** – `localStorage.setItem`
- **Solution** – [IOEither](https://gcanti.github.io/fp-ts/modules/IOEither.ts), [tryCatch](https://gcanti.github.io/fp-ts/modules/IOEither.ts#trycatch-function)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { ioEither } from "fp-ts";

function setItem(key: string, value: string): ioEither.IOEither<Error, void> {
  return ioEither.tryCatch(
    () => localStorage.setItem(key, value),
    (reason) => new Error(String(reason))
  );
}
```

## Asynchronous side effects

- **Use case** – an API that performs an asynchronous computation.
- **Example** – waiting
- **Solution** – [Task](https://gcanti.github.io/fp-ts/modules/Task.ts)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { task } from "fp-ts";

const wait: task.Task<void> = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 1000);
  });
```

- **Use case** – an API that performs an asynchronous computation and may reject.
- **Example** – fetch
- **Solution** – [TaskEither](https://gcanti.github.io/fp-ts/modules/TaskEither.ts), [tryCatch](https://gcanti.github.io/fp-ts/modules/TaskEither.ts#trycatch-function)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { taskEither } from "fp-ts";

function get(url: string): taskEither.TaskEither<Error, string> {
  return taskEither.tryCatch(
    () => fetch(url).then((res) => res.text()),
    (reason) => new Error(String(reason))
  );
}
```

---

_This content was originally published as a [blog post](https://dev.to/gcanti/interoperability-with-non-functional-code-using-fp-ts-432e) on February 12, 2019._
