# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260715`

## Product Identity

`@flancer32/alarisa-comm` is the shared communication package connecting the self-hosted Alarisa runtime and every client application.

## Product Scope

The accepted area includes shared contracts, message and event schemas, request/response/stream/notification semantics, connection establishment and restoration, channel authentication, correlation, acknowledgement, synchronization, and justified transport adapters.

## Product Boundaries

The package does not own server authority, application presentation, product roles, or runtime-specific behavior unrelated to communication.

## Current Boundary

The initial repository establishes package identity and ownership only. Concrete protocols and transports remain undeclared.
