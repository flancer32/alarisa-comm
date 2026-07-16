# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260716`

## Code Structure

`src/Contract/PrincipalContribution.mjs` defines the versioned route, limits, identifier grammar, and supported client channels. `src/Back/Handler/PrincipalContribution.mjs` validates `POST /api/v1/ingress/human` and delegates durable acceptance to `Alarisa_Back_Ingress_Human$`.

`src/Contract/Authentication.mjs` defines the shared auth routes, cookie scope, limits, and browser surfaces. `src/Back/Handler/Authentication.mjs` adapts JSON HTTP requests and responses to `Alarisa_Back_Auth_Service$`, sets or expires the opaque cookie, and returns no raw session token. `web/auth.js` is the public shared native-WebAuthn client mounted by the host at `/_assets/comm/auth.js`.

## Engineering Constraints

- use ESM and `.mjs` for TeqFW modules;
- keep shared contracts transport-independent where possible;
- isolate runtime adapters without duplicating shared semantics;
- synchronize namespace-based type aliases with published components;
- keep `202` limited to durable acceptance, return `409` for conflicting identifier reuse, and never treat the transport acknowledgement as an Alarisa response;
- reject package-area dependency cycles.
- keep WebAuthn verification and persistent authentication state out of `comm`;
- keep browser binary/JSON conversion and routes shared rather than duplicated by `desk` and `mob`.
