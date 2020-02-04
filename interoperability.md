# How to work with non-functional code using fp-ts

Sometimes you are forced to interoperate with code not written in a functional style, let's see how to deal with it.

## Sentinels

- **Use case** – an API that may fail and returns a special value of the codomain.
- **Example** – <code>Array.prototype.findIndex</code>
- **Solution** – <a href="../modules/Option.ts">Option</a>

```code
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
- **Example** – <code>Array.prototype.find</code>
- **Solution** – <a href="../modules/Option.ts">Option</a>, <a href="../modules/Option.ts#fromnullable-function">fromNullable</a>

```code
import { Option, fromNullable } from "fp-ts/lib/Option";

function find<A>(as: Array<A>, predicate: (a: A) => boolean): Option<A> {
  return fromNullable(as.find(predicate));
}
```

## Exceptions

- **Use case** – an API that may throw.
- **Example** – <code>JSON.parse</code>
- **Solution** – <a href="../modules/Either.ts">Either</a>, <a href="../modules/Either.ts#trycatch-function">tryCatch</a>

```code
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
- **Example** – <code>Math.random</code>
- **Solution** – <a href="../modules/IO.ts">IO</a>

```code
import { IO } from "fp-ts/lib/IO";

const random: IO<number> = () => Math.random();
```

## Synchronous side effects

- **Use case** – an API that reads and/or writes to a global state.
- **Example** – <code>localStorage.getItem</code>
- **Solution** – <a href="../modules/IO.ts">IO</a>

```code
import { Option, fromNullable } from "fp-ts/lib/Option";
import { IO } from "fp-ts/lib/IO";

function getItem(key: string): IO<Option<string>> {
  return () => fromNullable(localStorage.getItem(key));
}
```

- **Use case** – an API that reads and/or writes to a global state and may throw.
- **Example** – <code>readFileSync</code>
- **Solution** – <a href="../modules/IOEither.ts">IOEither</a>, <a href="../modules/IOEither.ts#trycatch-function">tryCatch</a>

```code
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
- **Solution** – <a href="../modules/Task.ts">Task</a>

```code
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
- **Solution** – <a href="../modules/TaskEither.ts">TaskEither</a>, <a href="../modules/TaskEither.ts#trycatch-function">tryCatch</a>

```code
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
