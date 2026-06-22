---
name: Documentation request
about: Report missing, unclear, or outdated documentation
title: "[Docs]: "
labels: ["documentation"]
assignees: ""
---

## Which Document?

Which file(s) does this concern? (e.g. `README.md`, `API_DOCUMENTATION.md`, `TECHNICAL_SUMMARY.md`, `CONTRIBUTING.md`, or "no doc exists yet")

## What's Missing or Unclear?

Describe what's wrong: missing entirely, outdated (no longer matches the code), ambiguous, or just hard to find. If applicable, quote the misleading section.

Example: *"`API_DOCUMENTATION.md` says to send `Authorization: Bearer <token>`, but `backend/middleware/auth.js` reads `req.headers.authorization` directly without stripping a `Bearer ` prefix — so following the documented format breaks authentication."*

## What Should It Cover?

Describe what the corrected/added documentation should say, including any specific routes, env vars, or setup steps that need to be reflected accurately.

## Who Benefits?

Who runs into this gap? (e.g. new contributors setting up the backend for the first time, third-party API consumers, frontend contributors who don't read backend code)

## Additional Context

Links, screenshots, or related issues/PRs.
