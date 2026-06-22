---
name: Bug report
about: Report something in NovaSync that isn't working as expected
title: "[Bug]: "
labels: ["bug", "needs-triage"]
assignees: ""
---

## Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...' (e.g. Settlement Plan tab for group 'Goa Trip')
2. Perform action '...' (e.g. add an expense of ₹100 split EQUAL across 3 members)
3. Observe '...'

Please include any relevant request payloads (e.g. the body sent to `POST /api/expenses/add`) if this is API-related.

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened. Include exact error messages, console output, or HTTP status codes/response bodies if applicable.

## Screenshots

If applicable, add screenshots or a screen recording to help explain the problem.

## Environment

- **OS:** [e.g. Windows 11, macOS 14, Ubuntu 22.04]
- **Browser:** [e.g. Chrome 124, Firefox 126] (frontend is plain HTML/CSS/JS, served via `frontend/index.html`)
- **Node version:** [e.g. v18.17.0] (`node -v`)
- **NovaSync component:** [backend / frontend / both]
- **MongoDB:** [local instance / Atlas, and version if known]

## Additional Context

Add any other context about the problem here — e.g. group size, number of expenses, split type used (EQUAL/EXACT/PERCENT), whether the expense was recurring.
