---
name: alarisa-comm-world-picture
description: Use when integrating or consuming @flancer32/alarisa-comm's protected current World Picture HTTP reads; not for State mutation, graph modeling, or browser presentation.
---

# Alarisa Comm World Picture Reads

Use this package boundary to request the current read-only World Picture from an authenticated Alarisa host.

## Routes

- `GET /api/v1/world-picture/tree` returns the primary-parent hierarchy.
- `GET /api/v1/world-picture/node/:id` returns one active Object and its incident active Relations.
- `tree` accepts one optional `focus` query parameter containing a positive decimal State Object identity.

## Authentication

These are protected non-auth `/api/v1/` routes. Establish the existing Principal session first; clients do not send, parse, or manage the opaque cookie. The host's `PrincipalApiAuth` guard runs before the handler.

## DTOs

`@flancer32/alarisa-back-state` is the DTO source of truth. Successful responses are its JSON-compatible version-1 envelope unchanged. Tree placement uses only active `case-parent` Relations; other Relations are cross-links.

Do not rebuild the State graph, query State storage, or infer missing hierarchy semantics in this package or a client.

## Responses

- `200` — State DTO; every JSON response has `Cache-Control: no-store`.
- `400` — malformed node or focus State identity.
- `404` — an unknown node or selection.
- `405` — method other than `GET`; the response has `Allow: GET`.
- `503` — State reads are temporarily unavailable; it intentionally exposes no storage detail.

## Host Composition

The package resolves `Alarisa_Back_State_Service_Read$` through normal TeqFW DI. The Alarisa host registers `Alarisa_Comm_Back_Handler_WorldPicture$` after `PrincipalApiAuth` and before static delivery. The handler does not implement authentication.

## Limits

This API has no mutation, generic filtering, YAML, graph layout, history or revision reads, Assistant selection, or browser UI behavior.

## Check Before Integration

Confirm the installed package versions, host DI namespace registration, and the State package's current read contract before relying on a route. Keep host product context authoritative for composition decisions.
