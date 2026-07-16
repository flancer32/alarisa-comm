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
- the server-side Principal-contribution adapter owns `POST /api/v1/ingress/human` and delegates accepted transport input to `back`;
- dependency cycles across package areas are forbidden by default.

## Product Dependency

Architecture must refine `product/` and the base Alarisa cognitive context; it must not invent protocols downstream.
