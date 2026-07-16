# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260716`

## Purpose

Define the orthogonal shared communication boundary.

## Architectural Style

The package may publish isomorphic TeqFW code with shared, server-side, and client-side parts. The self-hosted server and every client may depend on it without making it an independently deployed service.

## Major Boundaries

- shared communication semantics are defined once here;
- `comm` remains orthogonal to `back`;
- platform packages must not duplicate or own shared contracts;
- runtime-specific adapters are added only when separation is justified;
- the server-side Principal-Message adapter owns `POST /api/v1/ingress/human` and delegates accepted transport input to `back`;
- authentication contracts define `/api/v1/auth/` ceremonies, session status, logout, credential inspection and revocation; the Node adapter delegates trusted work to `back` and the shared browser module adapts native WebAuthn for both surfaces;
- the package publishes its public browser module under the host-assigned `/_assets/comm/` scope and stores no Principal credential or session state;
- dependency cycles across package areas are forbidden by default.

## Product Dependency

Architecture must refine `product/` and the base Alarisa cognitive context; it must not invent protocols downstream.
