# Company HR Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the job scraper with an actor that takes a list of companies and collects the HR employees' full LinkedIn profiles into `hr-profiles.xlsx`.

**Architecture:** Plain Playwright with a single persistent context, logged in with the `li_at` cookie. The companies are processed sequentially, with a throttled `visit()` helper. Pure helpers (HR matching, input parsing, URL normalization, row flattening) are unit-tested with `node --test`. DOM extraction is verified by a live smoke run.

**Tech Stack:** Node 20+ (ESM), `apify`, `playwright`, `exceljs`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-24-company-hr-profiles-design.md`

## Global Constraints

- Concurrency is 1, with a random delay of 4000–10000 ms between page loads. No proxy is used.
- Auth wall URLs (`/login`, `/checkpoint`, `/authwall`, `/uas/login`) are fatal: write the xlsx first, then fail.
- The output file defaults to `hr-profiles.xlsx` in the project root (`process.cwd()`).
- The cookie comes from `input.liAtCookie` or the `LINKEDIN_LI_AT` environment variable.

## Review Focus

- **A company name that matches nothing:** warn, skip it, and still write the sheet.
- **A company with 0 HR people:** it produces no rows, and the run continues.
- **"LinkedIn Member" cards with no URL:** drop them.
- **The same person found under several search terms:** deduplicate by normalized profile URL.
- **The cookie expires mid-run:** save the partial sheet, then exit with an error.

---

### Task 1: Pure helpers (`src/hr.js`, `src/companies.js` parse, `src/urls.js`, `src/sheet.js` rows)

- [ ] Tests in `test/*.test.js`: `buildHrMatcher`, `parseCompanyInput`, `normalizeProfileUrl`, `profileToRow`.
- [ ] Implement until `npm test` passes.

### Task 2: Browser layer (`src/browser.js`)

- [ ] `openBrowser(liAt)` returns `{ context, page, close }`.
- [ ] `visit(page, url)` applies the throttle, runs `goto`, and runs the auth wall check, throwing `AuthWallError` if it hits one.

### Task 3: Scrapers (`src/companies.js` resolve, `src/people.js`, `src/profile.js`)

- [ ] `resolveCompany(page, input)` returns `{ slug, url, name } | null`.
- [ ] `collectPeople(page, company, { terms, max, isHr })` returns `[{ name, headline, profileUrl }]`.
- [ ] `scrapeProfile(page, url)` returns the profile object.

### Task 4: Orchestration, xlsx writer, and docs

- [ ] Rewrite `src/main.js`.
- [ ] `writeSheet(rows, file)` using `exceljs`.
- [ ] Update `package.json`, `.gitignore` and `README.md`, and add `.actor/input_schema.json`.

### Task 5: Live smoke run

- [ ] Run 1–2 companies with the user's cookie and fix any selectors that don't match.
