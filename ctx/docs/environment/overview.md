# Environment Overview

- Path: `ctx/docs/environment/overview.md`
- Changed: `20260715`

## Runtime Model

The package targets Node.js 20 or newer for development and may expose shared, server-side, and browser-side ESM parts. No transport, connection runtime, or deployment topology is selected by the scaffold.

## Environment Constraints

Runtime-specific code must preserve shared contract ownership and must not turn the package into an implied independently deployed service.
