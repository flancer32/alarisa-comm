# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260715`

## Code Structure

`src/` is reserved for TeqFW ECMAScript modules addressed through the `Alarisa_Comm_` namespace. No contracts or functional modules are created by the initial scaffold.

## Engineering Constraints

- use ESM and `.mjs` for TeqFW modules;
- keep shared contracts transport-independent where possible;
- isolate runtime adapters without duplicating shared semantics;
- synchronize namespace-based type aliases with published components;
- reject package-area dependency cycles.
