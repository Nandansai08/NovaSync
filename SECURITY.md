# Security Policy

NovaSync stores group membership, expense amounts, and settlement history for real users — please help us keep that data safe by disclosing vulnerabilities responsibly.

## Supported Versions

Only the latest code on the `main` branch is actively maintained and receives security fixes.

| Version | Supported |
| ------- | --------- |
| `main`  | ✅ Yes    |
| Older tags/releases | ❌ No |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, email **security@novasync.dev** with:

1. A description of the issue and its potential impact.
2. Step-by-step reproduction instructions (a minimal request/payload is ideal).
3. The affected endpoint(s) or file(s) (e.g. `backend/controllers/authController.js`, `backend/middleware/auth.js`, `backend/services/settlementService.js`).
4. Your name/handle if you'd like to be credited once the fix ships.

We will acknowledge receipt within **48 hours** and aim to provide an initial assessment within **5 business days**. Please give us a reasonable window to fix the issue before disclosing it publicly.

## What Qualifies as a Security Issue

Examples of in-scope reports for NovaSync:

* **Authentication/authorization bypass** — forging or replaying JWTs, accessing `backend/middleware/auth.js`-protected routes without a valid token, or escalating privileges within a group you're not a member of.
* **Cross-tenant data exposure** — viewing, editing, or deleting another user's groups, expenses, balances, or settlement plans (e.g. via an unguarded `groupId`/`expenseId` parameter in `groupController.js` or `expenseController.js`).
* **NoSQL injection** — unsanitized input reaching Mongoose queries that could be manipulated to bypass filters or extract unintended documents.
* **Password/secret handling flaws** — bcrypt misconfiguration, JWT secret leakage, plaintext password logging, or insecure password-reset flows.
* **Settlement/balance manipulation** — tampering with `backend/services/settlementService.js` inputs to misrepresent balances or trick another user into an incorrect payment.
* **Stored XSS** — unescaped user-supplied expense descriptions, comments, or group names rendered unsafely by `frontend/assets/js/app.js`.

Out of scope: missing rate limiting on non-sensitive endpoints, lack of CSRF protection on read-only GET routes, and issues requiring physical access to a user's device.

## Responsible Disclosure Guidelines

If you follow these guidelines we will not pursue legal action and will credit you (if desired) once the fix is released:

* Give us a reasonable amount of time to resolve the issue before making it public.
* Do not access, modify, or delete data belonging to other users beyond what's needed to demonstrate the vulnerability.
* Avoid privacy violations, service disruption (no DDoS/load testing against shared infrastructure), spam, or social engineering of maintainers/users.

## Security Best Practices for Contributors

* Never commit `.env` files, MongoDB URIs, or `JWT_SECRET` values — use `backend/.env.example` as the template and keep real secrets local.
* Any new Mongoose query built from user input must validate/sanitize that input (avoid passing raw `req.body`/`req.query` objects directly into `find`/`update` filters).
* Routes that read or modify a group's expenses, members, or settlements must verify the requesting user is actually a member of that group, not just that they hold a valid JWT.
* Run `npm audit` in `backend/` periodically and address high/critical findings.
