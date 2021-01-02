# Async tasks

## Tasks that always succeed

If you're working with asynchronous tasks that are guaranteed to succeed, use [Task](https://gcanti.github.io/fp-ts/modules/Task.ts).

```ts
import { task } from "fp-ts";

const deepThought: task.Task<number> = () => Promise.resolve(42);

deepThought().then(n => {
  console.log(`The answer is ${n}.`);
});
```

## Tasks that may fail

If you're working with asynchronous tasks that may fail, use [TaskEither](https://gcanti.github.io/fp-ts/modules/TaskEither.ts). If the JSON in this example is malformed (try it!), an "I'm sorry" message is displayed.

```ts
import { either, taskEither } from "fp-ts";
import { pipe } from 'fp-ts/function';

const fetchGreeting = taskEither.tryCatch<Error, { name: string }>(
    () => new Promise(resolve => resolve(JSON.parse('{ "name": "Carol" }'))),
    reason => new Error(String(reason))
);

fetchGreeting()
    .then(e =>
        pipe(
            e,
            either.fold(
                err => `I'm sorry, I don't know who you are. (${err.message})`,
                x => `Hello, ${x.name}!`
            )
        )
    )
    .then(console.log);
```

## Work with a list of tasks in parallel

JavaScript provides `Promises.all` to wait for a list of Promises.

```ts
Promise.all([Promise.resolve(1), Promise.resolve(2)]).then(console.log); // [1, 2]
```

With `Task`s you can achieve the same using `sequence`. Both the `Promise.all` and the `sequence` approach run in parallel and wait until all results have arrived before they proceed.

```ts
import { array, task } from "fp-ts";

const tasks = [task.of(1), task.of(2)];
array.array
  .sequence(task.task)(tasks)()
  .then(console.log); // [ 1, 2 ]
```

## Run a list of tasks in sequence

If you need to run a list of `Task`s in sequence, i.e. you have to wait for one `Task` to finish before you run the second `Task`, you can use the `taskSeq` instance.

```ts
import { array, task } from "fp-ts";
import { pipe } from 'fp-ts/function';

const log = <A>(x: A) => {
    console.log(x);
    return x;
};

const tasks = [
    pipe(task.delay(200)(task.of("first")), task.map(log)),
    pipe(task.delay(100)(task.of("second")), task.map(log))
];

// Parallel: logs 'second' then 'first'
array.array.sequence(task.task)(tasks)();

// Sequential: logs 'first' then 'second'
array.array.sequence(task.taskSeq)(tasks)();
```

## Work with tasks with different type

!> What if the types are different? We can't use `sequence` anymore.

```ts
import { array, task } from "fp-ts";

const tasks = [task.of(1), task.of("hello")];
array.array.sequence(task.task)(tasks);
                             // ~~~~~ Argument of type '(Task<number> | Task<string>)[]' is not assignable to parameter of type 'Task<number>[]'.
                             //         Type 'Task<number> | Task<string>' is not assignable to type 'Task<number>'.
                             //           Type 'Task<string>' is not assignable to type 'Task<number>'.
                             //             Type 'string' is not assignable to type 'number'.
```

We can use `sequenceT` or `sequenceS` instead.

```ts
import { apply, task } from "fp-ts";

apply.sequenceT(task.task)(task.of(1), task.of("hello")); // type is task.Task<[number, string]>

apply.sequenceS(task.task)({a: task.of(1), b: task.of("hello")}); // type is task.Task<{ a: number; b: string; }>
```

## Work with a list of dependent tasks

If you need the result of on task before you can continue with the next, you can `chain` the tasks like so:

```ts
import { task } from "fp-ts";
import { pipe } from 'fp-ts/function';

pipe(
    task.of(2),
    task.chain(result => task.of(result * 3)),
    task.chain(result => task.of(result + 4))
)().then(console.log); // 10
```

## Traverse: map and sequence

If you have a list of items that you need to `map` over before running them in `sequence`, you can use `traverse`, which is a shortcut for doing both operations in one step.

```ts
import { array, task } from "fp-ts";
import { access, constants } from "fs";

const checkPathExists = (path: string) => () =>
    new Promise(resolve => {
        access(path, constants.F_OK, (err: unknown) => resolve({path, exists: !err}));
    });

const items = ["/bin", "/no/real/path"];

array.array
    .traverse(task.task)(items, checkPathExists)()
    .then(console.log); // [ { path: '/bin', exists: true }, { path: '/no/real/path', exists: false } ]
```

## Comparison with `Promise` methods

Following is a table comparing `Task`/`TaskEither` with `Promise`. It assumes the following imports:

<!-- verifier:skip -->
```ts
import {
    task as T,
    taskEither as TE,
    array,
    monoid as M
} from "fp-ts";
```

&nbsp;| Promise | Task | TaskEither
:--- | :--- | :--- | :---
**Resolve to success** | `Promise.resolve(value)` | `T.task.of(value)` | `TE.taskEither.of(value)` or `TE.right(value)`
**Resolve to failure** | `Promise.reject(value)` | N/A | `TE.left(value)`
**Transform the result of a task with the function `f`** | `promise.then(f)` | `T.task.map(task, f)` | `T.taskEither.map(taskEither, f)`
**Perform a task depending on the result of a previous one** | `promise.then(r => getPromise(r))` | `T.task.chain(task, r => getTask(r))` | `T.taskEither.chain(taskEither, r => getTaskEither(r))`
**Execute an array of tasks in parallel** | `Promise.all(promises)` | `array.sequence(T.task)(tasks)` | `array.sequence(TE.taskEither)(taskEithers)`
**Execute an array of tasks in parallel, collecting all failures and successes** | `Promise.allSettled(promises)` | N/A | `array.sequence(TE.taskEither)(taskEithers)`
**Execute an array of tasks and succeed/fail with a single value as soon as one of the tasks succeeds/fails** | `Promise.race(promises)` | `M.fold(T.getRaceMonoid())(tasks)` | `M.fold(T.getRaceMonoid())(taskEithers)`
