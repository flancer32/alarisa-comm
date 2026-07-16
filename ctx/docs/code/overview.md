# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260716`

## Code Structure

`src/Contract/PrincipalContribution.mjs` defines the versioned route, limits, identifier grammar, and supported client channels. `src/Back/Handler/PrincipalContribution.mjs` validates `POST /api/v1/ingress/human` and delegates durable acceptance to `Alarisa_Back_Ingress_Human$`.

## Engineering Constraints

- use ESM and `.mjs` for TeqFW modules;
- keep shared contracts transport-independent where possible;
- isolate runtime adapters without duplicating shared semantics;
- synchronize namespace-based type aliases with published components;
- keep `202` limited to durable acceptance, return `409` for conflicting identifier reuse, and never treat the transport acknowledgement as an Alarisa response;
- reject package-area dependency cycles.
