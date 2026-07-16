# Architecture Integration

- Path: `ctx/docs/architecture/integration.md`
- Template Version: `20260605`
- Changed: `20260716`

## Purpose

Describe external integrations and major internal contracts between architectural blocks.

## External Integrations

List the external systems, platforms, or durable dependencies that matter architecturally.

Do not expand this section into protocol or endpoint detail unless a larger project uses optional deeper documents.

## Internal Contracts

- `desk|mob -> shared browser auth client -> /api/v1/auth/` — converts WebAuthn binary values to and from the shared JSON representation without reading the `HttpOnly` session cookie;
- `authentication HTTP adapter -> back auth service` — delegates trusted generation, verification, session, and credential operations;
- `Principal Message handler -> back ingress` — validates the shared message contract after the host session guard succeeds.

This is not DTO documentation and not an OpenAPI replacement.

## Boundary Rules

- New integrations must be explicit here before they appear in implementation.
- Integration descriptions must stay at architectural boundary level, not code or schema level.
- Contradictions with product scope must be surfaced instead of normalized silently.
- `comm` must not persist credentials, challenges, capabilities, or sessions and must not decide trusted verification policy.
