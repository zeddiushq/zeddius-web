@AGENTS.md

# zeddius-web — Agent Guide

## Conventions

### Comments

Default to no comment. Well-named identifiers and control flow already say *what* the code does — a comment that restates that is noise to delete on sight.

Write a comment only for the *why*: a non-obvious invariant, a race condition being guarded against, a constraint from an external system (Next, zeddius-api, Apple, Cloud Run), a deliberate tradeoff, or a precondition the function relies on but doesn't check. Even then, be conservative — if the why is recoverable by reading the surrounding code for a few seconds (the types, the caller), skip it.

When a comment earns its place, keep it to one or two lines. State the constraint or reason directly — no preamble, no restating the code below it, no multi-sentence justification. Terse hints, not explanations:

```ts
// Next forbids setting cookies during render; call from a Server Action or Route Handler.
export async function setSession(...) { ... }

// Only infrastructure in front of the API (e.g. Cloud Run) answers outside the ErrorResponse shape.
return new ApiError(res.status, "UNKNOWN", res.statusText || "Request failed")
```

Not this — true but padded with things the code already shows:
```ts
// Authenticated request. Reads the access token from the cookie, sends it as a
// bearer token, and throws SessionExpiredError if there is no token or the API
// answers 401, otherwise parses the response.
```

This same standard applies to this file: state the rule or the reason, point at the real file for the current shape of things, and don't duplicate code that will drift out from under the copy.
