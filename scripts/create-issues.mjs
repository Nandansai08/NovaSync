#!/usr/bin/env node
/**
 * Bulk-creates the NovaSync starter issue set via the GitHub REST API.
 * Safe to re-run: skips any issue whose title already exists (open or closed).
 *
 * Usage:
 *   GITHUB_TOKEN=xxx REPO_OWNER=Nandansai08 REPO_NAME=NovaSync node scripts/create-issues.mjs
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const DELAY_MS = 500;

if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
  console.error('Missing required env vars. Need GITHUB_TOKEN, REPO_OWNER, REPO_NAME.');
  process.exit(1);
}

const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

const HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

const issues = [
  // ---------- Good First Issues ----------
  {
    title: 'Disable the "Add Expense" submit button while the request is in flight',
    body: `## Description
The add-expense form in \`frontend/assets/js/app.js\` does not disable its submit button while the \`POST /api/expenses\` request is pending, so a slow connection plus an impatient double-click can submit the same expense twice.

## Where to look
\`frontend/assets/js/app.js\` — the expense submit handler that calls the expenses API.

## Proposed Change
Disable the submit button (and show a small "Adding..." label) as soon as the request starts, and re-enable it in both the success and error paths.

## Acceptance Criteria
- [ ] Button is disabled immediately on submit
- [ ] Button re-enables on success and on error
- [ ] No duplicate expense is created from a rapid double-click`,
    labels: ['good-first-issue', 'enhancement'],
    assignees: [],
  },
  {
    title: 'Add a category icon next to each expense in the group expense list',
    body: `## Description
Expenses are tagged with a category (Food, Travel, Bills, Entertainment, Shopping, Other) but the expense list UI doesn't visually distinguish categories — every row looks the same.

## Where to look
\`frontend/assets/js/app.js\` (the function that renders the expense list) and \`frontend/assets/css/styles.css\`.

## Proposed Change
Render a small FontAwesome icon (already a project dependency per the README credits) next to each expense based on its \`category\` field, with a distinct color per category.

## Acceptance Criteria
- [ ] Each of the 6 categories maps to a distinct icon + color
- [ ] Falls back to a generic icon for unknown/missing category
- [ ] No layout shift on narrow viewports`,
    labels: ['good-first-issue', 'enhancement'],
    assignees: [],
  },
  {
    title: 'Validate that a removed group member has no outstanding balance before allowing removal',
    body: `## Description
\`backend/controllers/groupController.js\` exposes a remove-member action, but it does not appear to check whether the member being removed still has an outstanding balance (owes money or is owed money) in the group's current settlement plan.

## Where to look
\`backend/controllers/groupController.js\` — the remove/leave-member handler.

## Proposed Change
Before removing a member, call \`settlementService.calculateBalances\` for the group and reject the removal with a clear 400 error if that member's net balance is non-zero (outside of a small rounding tolerance, e.g. \`Math.abs(balance) >= 0.01\`).

## Acceptance Criteria
- [ ] Removing a member with a zero balance still works
- [ ] Removing a member with a non-zero balance returns a 400 with a clear error message
- [ ] Existing tests (if any) for group member management still pass`,
    labels: ['good-first-issue', 'bug'],
    assignees: [],
  },
  {
    title: 'Add a "no expenses yet" empty state to the group view',
    body: `## Description
A newly created group with zero expenses currently renders an empty list with no guidance for the user on what to do next.

## Where to look
\`frontend/assets/js/app.js\` — the group view rendering logic, and \`screenshots/group_view.png\` for the current look.

## Proposed Change
When a group has no expenses, render a friendly empty state with a short message and a call-to-action button that opens the "Add Expense" form.

## Acceptance Criteria
- [ ] Empty state only shows when the expense list is genuinely empty (not during loading)
- [ ] CTA button opens the same add-expense flow as the existing "+" button
- [ ] Matches existing dark-mode styling in \`frontend/assets/css/styles.css\``,
    labels: ['good-first-issue', 'enhancement'],
    assignees: [],
  },

  // ---------- Bug Reports ----------
  {
    title: 'Settlement rounding can leave a residual penny unaccounted for in groups of 3+ members',
    body: `## Description
\`backend/services/settlementService.js\` rounds each user's net balance to 2 decimal places with \`Math.round(balances[uid] * 100) / 100\` and rounds each settlement transaction amount the same way, but doesn't reconcile the sum of all rounded transactions back against the sum of rounded balances. With certain EQUAL splits (e.g. an odd amount split 3 ways), this can leave a residual cent that isn't reflected in any settlement transaction.

## Steps to Reproduce
1. Create a group with 3 members.
2. Add an EQUAL-split expense of $10.00 (splits to $3.33, $3.33, $3.34).
3. Add a few more expenses so net balances aren't trivially zero.
4. Call the balances/settlement endpoint and sum all returned settlement transaction amounts per user.

## Expected Behavior
The sum of settlement transactions involving a user should exactly equal that user's rounded net balance.

## Actual Behavior
In some splits, a $0.01 discrepancy appears between a user's net balance and the sum of their settlement transactions.

## Environment
- Node: any
- Component: \`backend/services/settlementService.js\`

## Additional Context
Consider assigning any leftover residual cent to the transaction with the largest creditor, similar to common "largest remainder" rounding strategies.`,
    labels: ['bug', 'needs-triage'],
    assignees: [],
  },
  {
    title: 'Recurring expense generator can create duplicate occurrences if processRecurringExpenses runs concurrently',
    body: `## Description
\`processRecurringExpenses\` in \`backend/controllers/expenseController.js\` queries for recurring expenses (\`Expense.find({ groupId, isRecurring: true })\`) and then creates new non-recurring copies, but there's no lock or idempotency check. If two requests for the same group arrive close together (e.g. two tabs open, or a retried request), the recurrence check could run twice before either insert completes, generating duplicate expenses.

## Steps to Reproduce
1. Have a recurring expense that is due to generate its next occurrence.
2. Open the group view in two browser tabs and trigger two near-simultaneous requests that call \`processRecurringExpenses\` (e.g. by loading the group's expense list in both tabs at once).
3. Check the expense list for duplicate generated entries.

## Expected Behavior
Only one new occurrence is generated per due recurring expense, regardless of concurrent requests.

## Actual Behavior
Under race conditions, duplicate occurrences can be created.

## Environment
- Backend: Node.js/Express, MongoDB/Mongoose
- Component: \`backend/controllers/expenseController.js\`

## Additional Context
A MongoDB unique index on a deterministic key (e.g. \`originalExpenseId\` + \`occurrencePeriod\`) or a findOneAndUpdate-based lock would prevent this.`,
    labels: ['bug', 'needs-triage'],
    assignees: [],
  },
  {
    title: 'EXACT and PERCENT split validation does not reject totals that don\'t match the expense amount',
    body: `## Description
\`backend/controllers/expenseController.js\` requires \`splits\` to be present for \`EXACT\` and \`PERCENT\` split types, but it's unclear from the code whether it actually verifies that the sum of exact amounts equals the expense total, or that percentages sum to 100, before saving the expense.

## Steps to Reproduce
1. Create an expense with \`splitType: "EXACT"\`, total amount $100, but provide splits that sum to $80.
2. Submit the expense.
3. Check the saved expense and resulting balances.

## Expected Behavior
The API should reject the request with a 400 error explaining the splits don't add up to the expense total (with a small rounding tolerance).

## Actual Behavior
(To confirm during triage) The expense may be saved with mismatched splits, silently corrupting balance calculations for the group.

## Environment
- Component: \`backend/controllers/expenseController.js\`, lines around the \`EXACT\`/\`PERCENT\` branch

## Additional Context
Same concern applies to \`PERCENT\` splits not summing to 100%.`,
    labels: ['bug', 'needs-triage'],
    assignees: [],
  },

  // ---------- Feature Requests ----------
  {
    title: 'Add multi-currency support for groups with members in different countries',
    body: `## Problem Statement
NovaSync's roadmap calls out multi-currency support, and groups with members traveling internationally (the core "trips" use case from the README) often incur expenses in different currencies, which currently can't be represented — all amounts are treated as a single implicit currency.

## Proposed Solution
- Add a \`currency\` field to the Expense model (default to a group-level base currency).
- Store a currency-conversion rate snapshot at the time the expense is created (using a free FX rate API or a manually-entered rate) so historical settlements remain stable even if rates change later.
- Convert all amounts to the group's base currency before running \`settlementService.calculateBalances\`.

## Alternatives Considered
- Letting users manually convert before entering amounts — error-prone and defeats the purpose of automating the math.

## Additional Context
This is a meaningful schema change; should be scoped as its own milestone with a migration plan for existing expenses (treat them as the group's base currency).

## Priority
- [x] priority:medium`,
    labels: ['enhancement', 'feature-request'],
    assignees: [],
  },
  {
    title: 'Add CSV/PDF export of settlement history for a group',
    body: `## Problem Statement
The README roadmap mentions "exportable settlement history" — currently there's no way for a group to download a record of who paid whom, which is useful for trip recaps or expense reimbursement at work/shared housing.

## Proposed Solution
Add an "Export" button on the group view that downloads a CSV (and optionally a simple PDF) listing every settlement transaction computed by \`settlementService.calculateBalances\`, plus the underlying expense list.

## Alternatives Considered
- Server-rendered PDF via a templating library — more polished but adds a new dependency; CSV-first is a good incremental step.

## Additional Context
CSV generation can be done client-side in \`frontend/assets/js/app.js\` from data already fetched for the group view, no new backend endpoint required for the CSV case.

## Priority
- [x] priority:low`,
    labels: ['enhancement', 'feature-request'],
    assignees: [],
  },
  {
    title: 'Add email or push notifications for new expenses and settlement reminders',
    body: `## Problem Statement
Group members currently only see new expenses when they open the app. For trips/flatmate groups, a notification when a large expense is added (or a periodic reminder of an outstanding balance) would significantly reduce "I didn't know I owed that" disputes — one of the core problems the README says NovaSync solves.

## Proposed Solution
Start with email notifications (e.g. via Nodemailer + a transactional email provider) triggered on: (1) new expense added to a group you're in, (2) weekly digest of your current net balance if non-zero. Push notifications can follow as a later phase once a frontend framework/PWA shell exists.

## Alternatives Considered
- In-app-only notification bell — lower effort but doesn't reach users who aren't actively in the app, which is the main gap today.

## Additional Context
Requires adding user email verification/preferences and a background job runner (none currently exists in \`backend/\`).

## Priority
- [x] priority:medium`,
    labels: ['enhancement', 'feature-request'],
    assignees: [],
  },
  {
    title: 'Add receipt photo upload and basic OCR auto-fill for expense amount/description',
    body: `## Problem Statement
The roadmap lists "Receipt scanning (OCR) for auto-extracting expense details from photos" as a desired feature — manually re-typing amounts from a receipt is exactly the kind of friction NovaSync is meant to remove.

## Proposed Solution
- Add receipt image upload to the add-expense flow (stored alongside the expense document, e.g. as a base64 field or via an object-storage URL).
- Integrate a lightweight OCR step (e.g. Tesseract.js client-side, or a cloud OCR API) to pre-fill the amount and description fields, which the user can review/edit before saving.

## Alternatives Considered
- Skipping OCR and just attaching the photo as a reference — simpler, ships faster, but doesn't reduce data-entry friction which is the actual ask.

## Additional Context
Start with photo attachment as a standalone feature; OCR auto-fill can be a fast-follow once upload storage is in place.

## Priority
- [x] priority:low`,
    labels: ['enhancement', 'feature-request'],
    assignees: [],
  },

  // ---------- Documentation Issues ----------
  {
    title: 'Document the JWT auth header format expected by protected routes',
    body: `## Which doc is missing or unclear?
\`API_DOCUMENTATION.md\` describes the auth endpoints, but it's unclear (without reading \`backend/middleware/auth.js\` directly) exactly what header format protected routes expect — e.g. \`Authorization: Bearer <token>\` vs a custom header — and what the error response looks like for a missing/expired/malformed token.

## What should it cover?
- Exact header name and format expected by \`backend/middleware/auth.js\`
- Example request with the header included
- The exact shape of 401 error responses for: missing token, expired token, malformed token

## Who would benefit?
Frontend contributors and anyone building an alternative client against the API who currently has to read the middleware source to figure this out.`,
    labels: ['documentation'],
    assignees: [],
  },
  {
    title: 'Document required and optional backend .env variables in one place',
    body: `## Which doc is missing or unclear?
The README mentions \`MONGO_URI\`, \`PORT\`, and \`JWT_SECRET\` and references a \`backend/.env.example\`, but there's no single doc enumerating every env var the backend actually reads, which ones are required vs optional, and their default values/format.

## What should it cover?
- A complete table of env vars read anywhere under \`backend/\` (grep for \`process.env\`)
- Required vs optional, with safe local defaults where applicable
- Any production-specific vars (e.g. CORS origin, cookie settings) not needed for local dev

## Who would benefit?
New contributors setting up the backend for the first time, and anyone deploying NovaSync to a new environment (Render, Railway, etc.).`,
    labels: ['documentation'],
    assignees: [],
  },

  // ---------- Refactor / Tech Debt ----------
  {
    title: 'Extract split-validation logic out of expenseController.js into a dedicated module',
    body: `## Description
\`backend/controllers/expenseController.js\` currently mixes HTTP request handling with split-validation logic (EQUAL/EXACT/PERCENT branching) and recurring-expense generation in the same file, making it hard to unit test the validation rules in isolation.

## Motivation
Several of the bug reports in this issue set (rounding, split-total validation) live in this exact logic. Extracting it makes it testable without spinning up Express/MongoDB, and reduces the chance of new split-related bugs.

## Proposed Change
- Create \`backend/services/splitValidationService.js\` (or similar) exporting pure functions like \`validateExactSplits(amount, splits)\` and \`validatePercentSplits(splits)\`.
- Update \`expenseController.js\` to call into this module instead of inlining the logic.
- Add unit tests for the extracted functions covering the rounding/total-mismatch edge cases already filed as bugs.

## Acceptance Criteria
- [ ] No behavior change for valid requests
- [ ] Extracted functions have unit tests
- [ ] \`expenseController.js\` shrinks and reads as orchestration, not business logic`,
    labels: ['chore'],
    assignees: [],
  },
  {
    title: 'Add a backend test suite (Jest or node:test) starting with settlementService',
    body: `## Description
\`backend/package.json\`'s \`test\` script is currently a placeholder (\`"Error: no test specified" && exit 1\`). There is no automated test coverage anywhere in the backend, which makes the rounding/settlement bugs filed in this issue set hard to verify as fixed without manual testing.

## Motivation
\`backend/services/settlementService.js\` contains the core value proposition of the app (the greedy debt-simplification algorithm) and has zero test coverage today.

## Proposed Change
- Add Jest (or Node's built-in \`node:test\` + \`assert\`) as a dev dependency.
- Write unit tests for \`calculateBalances\` covering: simple 2-person settle-up, 3+ person groups with rounding edge cases, all-zero-balance groups, and EQUAL/EXACT/PERCENT split inputs.
- Wire the real \`test\` script in \`backend/package.json\` to run them.

## Acceptance Criteria
- [ ] \`npm test\` in \`backend/\` runs a real test suite and exits non-zero on failure
- [ ] \`settlementService.calculateBalances\` has at least 80% line coverage
- [ ] CONTRIBUTING.md's "Tests & Linting" section is updated to reflect the new real test command`,
    labels: ['chore'],
    assignees: [],
  },
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchExistingTitles() {
  const titles = new Set();
  let page = 1;

  while (true) {
    const res = await fetch(
      `${API_BASE}/issues?state=all&per_page=100&page=${page}`,
      { headers: HEADERS }
    );

    if (!res.ok) {
      throw new Error(`Failed to list existing issues: ${res.status} ${await res.text()}`);
    }

    const batch = await res.json();
    if (batch.length === 0) break;

    for (const issue of batch) {
      titles.add(issue.title);
    }

    if (batch.length < 100) break;
    page += 1;
  }

  return titles;
}

async function createIssue(issue) {
  const res = await fetch(`${API_BASE}/issues`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
      assignees: issue.assignees,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

async function main() {
  console.log(`Fetching existing issues for ${REPO_OWNER}/${REPO_NAME}...`);
  const existingTitles = await fetchExistingTitles();
  console.log(`Found ${existingTitles.size} existing issue(s).`);

  for (const issue of issues) {
    if (existingTitles.has(issue.title)) {
      console.log(`SKIP (duplicate): "${issue.title}"`);
      continue;
    }

    try {
      const created = await createIssue(issue);
      console.log(`CREATED #${created.number}: ${created.html_url}`);
    } catch (err) {
      console.error(`FAILED: "${issue.title}" — ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
