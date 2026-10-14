# Company HR Profiles Scraper — Design

Date: 2026-09-24
Status: Approved in chat, pending spec review

## Goal

Replace the actor's job-scraping pipeline. Given a list of companies, the actor
visits each company's LinkedIn page, one at a time. On each page it finds the
HR-related employees and pulls their full profile details. All results are
written to one final spreadsheet in the project root.

## Decisions (from the user)

| Topic | Decision |
|---|---|
| Access | A logged-in session via the user-supplied `li_at` cookie |
| Depth | Full profile: each HR person's profile page is visited |
| Input | A company list; each entry can be a LinkedIn company URL or a plain name |
| Output | `hr-profiles.xlsx` in the project root, also pushed to the Apify dataset |

The old job-scraping code is removed, not kept alongside.

## Input

```json
{
  "companies": ["https://www.linkedin.com/company/infosys", "Zoho"],
  "liAtCookie": "<li_at>",
  "hrKeywords": ["HR", "Human Resources", "Talent Acquisition", "Recruiter", "People", "HRBP"],
  "maxProfilesPerCompany": 25,
  "outputFile": "hr-profiles.xlsx"
}
```

- `companies` (required): a non-empty array of strings.
- `liAtCookie`: required unless the `LINKEDIN_LI_AT` environment variable is set.
- `hrKeywords`, `maxProfilesPerCompany` and `outputFile`: optional. The defaults are shown above.

## Pipeline

The steps run sequentially, one company at a time.

1. **Resolve the company.**
   - A string matching `linkedin.com/company/<slug>` gives the slug directly.
   - Any other string is searched at `/search/results/companies/?keywords=<name>`, and the first `/company/<slug>` result is used.
   - If nothing is found, the actor logs a warning and moves to the next company.
2. **Collect from the People tab.**
   - The actor opens `/company/<slug>/people/?keywords=<term>` for a small set of HR search terms.
   - It scrolls or clicks "Show more" until it has `maxProfilesPerCompany` candidates or no new cards appear.
   - From each card it takes the name, headline and profile URL.
   - Profile URLs are normalized to `https://www.linkedin.com/in/<id>/` and deduplicated.
   - Cards shown as "LinkedIn Member" (hidden profiles, which have no URL) are dropped.
3. **Filter for HR.** A card is kept only if its headline matches the HR keyword regex. This is a pure function with unit tests.
4. **Visit each profile.** For each kept candidate, the actor opens the profile and extracts:
   - name, headline and location
   - About
   - connections or followers text
   - experience entries (title, company, date range)
   - education entries (school, degree, dates)

   The current title and company are taken from the first experience entry.
5. **Write the output.**
   - Each profile is pushed to the Apify dataset as soon as it is scraped.
   - The xlsx file is written after every company and again at the end, so a crash keeps partial results.

## Output row (xlsx columns)

- Company Input
- Company Name
- Company URL
- Name
- Headline
- Current Title
- Current Company
- Location
- Profile URL
- Connections
- About
- Experience
- Education
- Scraped At

Experience and Education are lists, flattened into multi-line cells (one entry
per line, e.g. `Title — Company (dates)`).

## Account safety

- A single browser context runs with concurrency 1 and no proxy, so the session is used from the user's own IP.
- There is a random 4–10 s delay between page loads.
- A login wall, checkpoint or authwall URL (`/login`, `/checkpoint`, `/authwall`) is **fatal**. The actor stops the run, writes the xlsx with whatever it has, and exits with an error message.
- A single profile failing to load gets one retry and is then skipped with a warning.

## Modules

- `src/main.js`: reads input and orchestrates the loop.
- `src/browser.js`: launches Playwright, injects the cookie, and provides the throttled `visit()` and the auth-wall check.
- `src/companies.js`: resolves input strings into company slugs and URLs.
- `src/people.js`: collects cards from the People tab.
- `src/profile.js`: extracts profile details.
- `src/hr.js`: builds the HR keyword matcher (pure function).
- `src/sheet.js`: flattens profiles into rows and writes the xlsx with `exceljs`.

## Testing

- **Unit tests** (`node --test`) cover:
  - HR matching
  - company-input parsing
  - profile URL normalization
  - row flattening
- **Live smoke run:** 1–2 companies with the user's cookie, to confirm the selectors match LinkedIn's current markup.

## Out of scope

- Emails and phone numbers
- Google Sheets upload
- Proxy rotation
- Parallel companies
