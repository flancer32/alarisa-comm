# AI Introduction

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260715`

## Purpose

Orient agents to `@flancer32/alarisa-comm`, the shared communication package for all Alarisa applications.

## Project Type

This is an ESM-only, potentially isomorphic TeqFW npm package in the orthogonal `comm` area.

## Boundaries

The package owns shared communication contracts and transport-independent semantics. It is not a subsection of `back`, must not own product authority, and must not absorb platform-specific presentation.

## Technology Base

Node.js 20 or newer, ECMAScript modules, npm, and the `Alarisa_Comm_` TeqFW namespace.
