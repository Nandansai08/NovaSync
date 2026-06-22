# Contributing to NovaSync

Thanks for your interest in improving NovaSync! This document covers how to set up the project, the conventions we use, and what to expect from the review process.

## Table of Contents

- [Getting Started](#getting-started)
- [Branch Naming](#branch-naming)
- [Commit Message Format](#commit-message-format)
- [Running the Project Locally](#running-the-project-locally)
- [Tests & Linting](#tests--linting)
- [Pull Request Checklist](#pull-request-checklist)
- [Code Review Process](#code-review-process)
- [Reporting Bugs vs Requesting Features](#reporting-bugs-vs-requesting-features)

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/NovaSync.git
   cd NovaSync
   ```
3. **Add the upstream remote** so you can keep your fork in sync:
   ```bash
   git remote add upstream https://github.com/Nandansai08/NovaSync.git
   ```
4. **Create a branch** off `main` for your change (see naming convention below).
5. Make your changes, commit, push to your fork, and open a pull request against `Nandansai08/NovaSync:main`.

## Branch Naming

Use a prefix that describes the type of change, followed by a short, kebab-case description:

| Prefix | Use for |
| :--- | :--- |
| `feat/` | A new feature (e.g. `feat/percentage-split-rounding`) |
| `fix/` | A bug fix (e.g. `fix/settlement-rounding-error`) |
| `docs/` | Documentation-only changes (e.g. `docs/api-auth-header`) |
| `chore/` | Tooling, dependency bumps, refactors with no behavior change (e.g. `chore/extract-validation-helpers`) |

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

<optional longer body>

<optional footer, e.g. "Closes #123">
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

Examples:
```
fix(settlement): round residual pennies onto the largest creditor instead of the first
feat(expenses): add monthly recurring expense cap of 12 occurrences
docs(api): correct Authorization header format to match middleware
```

## Running the Project Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI, PORT, JWT_SECRET
npm start              # runs `node server.js`
```

### Frontend
The frontend (`frontend/`) is plain HTML/CSS/JS with no build step and no `package.json`. Open `frontend/index.html` in a browser, or serve it with VS Code's Live Server extension, pointing `API_BASE` in `frontend/assets/js/app.js` at your running backend.

## Tests & Linting

Be honest about what currently exists — don't invent scripts:

- `backend/package.json` defines:
  ```bash
  npm test    # currently a placeholder: "Error: no test specified" && exit 1
  ```
  There is **no test suite yet** and **no lint script** configured in `backend/package.json`. If your change touches `backend/services/settlementService.js` or any controller logic, please add focused tests (e.g. with `jest` or `node:test`) as part of your PR — this is one of the most valuable contributions you can make right now (see the "good first issue" and "chore" labels for test-related tasks).
- `frontend/` has no `package.json`, so there is no frontend lint/test command at all. Manual verification (open the page, exercise the flow) is currently the only way to check frontend changes — describe what you tested in your PR description.

If you add a test runner or linter, please also add the corresponding npm script and update this section in the same PR.

## Pull Request Checklist

Before opening a PR, confirm:

- [ ] Branch is named per the convention above and is up to date with `main`
- [ ] Commit messages follow Conventional Commits
- [ ] `npm install && npm start` works cleanly in `backend/` with your changes
- [ ] If you touched `backend/`, you ran `npm test` (and added tests if none existed for the code you changed)
- [ ] If you touched `frontend/`, you manually exercised the affected flow in a browser and noted how in the PR description
- [ ] Documentation (`README.md`, `API_DOCUMENTATION.md`, `TECHNICAL_SUMMARY.md`) is updated if behavior, routes, or env vars changed
- [ ] No secrets, `.env` files, or credentials are included in the diff
- [ ] Screenshots/GIFs are attached for any UI-visible change
- [ ] PR description explains *why*, not just *what*

## Code Review Process

- A maintainer will triage new PRs within **3 business days**.
- Expect at least one round of review feedback on non-trivial changes; please respond to comments or push updates within **7 days**, otherwise the PR may be marked stale and closed.
- Small, focused PRs (one logical change) are reviewed and merged much faster than large multi-purpose PRs — please split unrelated changes into separate PRs.
- All PRs require at least one maintainer approval before merge.
- CI (once configured) must pass before merge; until then, the reviewer will manually verify the change runs.

## Reporting Bugs vs Requesting Features

- **Found something broken?** Open a [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) with exact reproduction steps — ideally a specific group/expense/split scenario, since most of NovaSync's tricky bugs live in the settlement and split-rounding logic.
- **Want something new?** Open a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) describing the problem first, then your proposed solution.
- **Docs missing or unclear?** Open a [Documentation Request](.github/ISSUE_TEMPLATE/documentation_request.md).

When in doubt, search [existing issues](https://github.com/Nandansai08/NovaSync/issues) first to avoid duplicates.
