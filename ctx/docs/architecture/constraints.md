# Architecture Constraints

- Path: `ctx/docs/architecture/constraints.md`
- Template Version: `20260702`
- Changed: `20260715`

## Purpose

Record non-negotiable architecture restrictions and trust boundaries.

## Core Constraints

- authentication contracts serve exactly one fixed Principal and contain no account-selection identifier;
- browser and Node adapters share route and response semantics without receiving private keys, biometric data, or server-stored session tokens;
- the opaque cookie remains `Secure`, `HttpOnly`, `SameSite=Strict`, and scoped to `/api/v1/`;
- static browser communication code remains public and carries no Principal data.

## Boundary Constraints

- trusted WebAuthn verification, credential persistence, challenge state, enrollment policy, and session state remain in `back`;
- platform packages must use the shared browser client rather than duplicate authentication routes or serialization;
- `/hooks/` must never inherit the Principal browser-session contract.

This section should make product and architecture boundaries explicit.

## Change Constraints

Describe which kinds of architecture changes always require human approval.

At minimum, cover:

- new architectural owners;
- new persistent state;
- new external integrations;
- new major system boundaries.

## Human Review Use

List the supervision questions a human should answer quickly with this document.
