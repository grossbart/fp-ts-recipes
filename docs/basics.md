# Basics

_fp-ts_ is a library for _typed functional programming_ in TypeScript. The code examples presented here help you get familiar with the library and its style of programming. You can learn more about using _fp-ts_ on the [fp-ts website](https://gcanti.github.io/fp-ts/).

## Import patterns

When browsing the _fp-ts_ docs, you will find various import patterns. To help you better understand the pros and cons of each pattern, we collected some of them below so you can find the best fit for your project.

### Top-level imports (recommended)

If you’re just getting started with _fp-ts_, we recommend that you use the top-level exports of the library. This is the pattern we use for the _fp-ts_ recipes presented on this website.

- **Pros:** Easy to use; no naming conflicts; auto-imports
- **Cons:** More verbose; not [tree-shakeable](https://en.wikipedia.org/wiki/Tree_shaking)

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { option } from "fp-ts";
const value: option.Option<number> = option.some(1);
```

When using this pattern, be aware that the value `option` in the following two imports _is not the same:_

1. `import { option } from 'fp-ts'` is not the same as
2. `import { option } from 'fp-ts/Option'`

The former refers to the Option _module_, while the latter refers to the Option [typeclass instance](https://joyofhaskell.com/posts/2017-03-15-typeclasses-in-translation.html).

?> In the import example **1.**, use `option.option` to retrieve the typeclass instance.

### Module imports

Many examples in the _fp-ts_ docs import from the individual modules directly as seen below.

- **Pros:** Precise; tree-shakeable; auto-imports
- **Cons:** Low-level; longer import statements; naming conflicts

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import { Option, some } from "fp-ts/Option";
const value: Option<number> = some(1);
```

### Namespaces

A middle ground that is also seen in many _fp-ts_ examples is importing a module into a namespace.

- **Pros:** Concise
- **Cons:** Low-level; difficult for newcomers; no auto-imports; not tree-shakeable

<!-- verifier:tsconfig:noUnusedLocals=false -->

```ts
import * as O from "fp-ts/Option";
const value: O.Option<number> = O.some(1);
```

## Pipe and Flow

_fp-ts_ is all about composing functions. For this, _fp-ts_ provides the `pipe` function and its variation `flow`.

`pipe` takes a value as its first argument and then threads it through the remaining functions, from left-to-right. We could nest these functions instead, as shown below for `one`, but that quickly becomes impractical.

```ts
import { pipe } from "fp-ts/function";
const add5 = (x: number) => x + 5;
const multiply2 = (x: number) => x * 2;

const one = multiply2(add5(3)); // Ok
const two = pipe(3, add5, multiply2); // Better

console.log(one, two); // 16, 16
```

`flow` is a variation of `pipe` and can make your code more concise. But be aware of the problems with the [pointfree style](https://wiki.haskell.org/Pointfree) that this allows: it can obfuscate your code if you’re not careful.

```ts
import { flow, pipe } from "fp-ts/function";
const add5 = (x: number) => x + 5;

const runPipe = (x: number) => pipe(x, add5);
const runFlow = flow(add5);

console.log(runPipe(3), runFlow(3)); // 8, 8
```

You can learn more about `pipe` and `flow` in the [Practical Guide to fp-ts](https://rlee.dev/practical-guide-to-fp-ts-part-1).
