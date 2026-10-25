# SPM Report Desk

A clickable demo that guides a small company through its yearly microplastics
report for ECHA (REACH Annex XVII, Entry 78 — synthetic polymer microparticles, SPM).
It works out the emission number with every step shown and gives a CSV for IUCLID.

> **Prototype only.** The numbers are examples. Do not send them to ECHA. Check every value.
> The CSV column names are placeholders, and some picklists and release factors are not yet verified.

The full scope is in [`docs/phase-1-brief.md`](docs/phase-1-brief.md). Rules for working on
this repo are in [`CLAUDE.md`](CLAUDE.md).

## What is in it

- A 5-step wizard: Company → Uses → Polymers → Emissions → Review
- A rules engine that shows only the fields that apply to each use
- An emission calculator with a visible step-by-step record
- A review table, a CSV download (UTF-8 with BOM) and a print-friendly calculation record
- A "Load example" button with a fictional company
- A draft saved in this browser only (`localStorage`)
- A waitlist form that sends to a Google Sheet

No backend, no login, no tracking. The only network call is the waitlist form.

## Install

Needs Node.js 20 or newer.

```bash
npm install
```

## Run

```bash
npm run dev       # development server at http://localhost:5173
npm run build     # type-check and build to dist/
npm run preview   # serve the built site
```

## Test

```bash
npm run test       # unit and component tests (Vitest)
npm run lint       # ESLint
npm run test:e2e   # end-to-end tests (Playwright); builds and serves the site itself
```

The first time you run the end-to-end tests, install the browser:

```bash
npx playwright install chromium
```

## Project layout

| Folder               | What is in it                                                        |
| -------------------- | -------------------------------------------------------------------- |
| `src/types`          | Shared TypeScript types                                              |
| `src/data`           | Picklists, release factors, CSV columns and the example company      |
| `src/logic`          | Pure business logic: field rules, calculator, validation, CSV export |
| `src/state`          | Reducer, React context and browser draft storage                     |
| `src/components`     | Shared UI pieces                                                     |
| `src/steps`          | One component per wizard step                                        |
| `src/pages`          | The print calculation record                                         |
| `src/copy/uiText.ts` | **All** user-facing text                                             |
| `apps-script`        | Google Apps Script that writes waitlist sign-ups to a sheet          |
| `e2e`                | Playwright tests                                                     |

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo.
3. Vercel detects Vite. Build command `npm run build`, output folder `dist`
   (also set in `vercel.json`).
4. Under **Settings → Environment Variables**, add `VITE_WAITLIST_URL` (see below).
5. Deploy. Redeploy after you change an environment variable, because Vite puts it
   into the build.

## Set up the waitlist

The waitlist form posts JSON to a Google Apps Script web app, which adds a row to a sheet.

1. Create a Google Sheet.
2. Open **Extensions → Apps Script**. Replace the code with
   [`apps-script/waitlistToGoogleSheet.gs`](apps-script/waitlistToGoogleSheet.gs) and save.
3. Click **Deploy → New deployment**. Type: **Web app**. Execute as: **Me**.
   Who has access: **Anyone**. Click **Deploy** and allow access.
4. Copy the web app URL (it ends in `/exec`).
5. Locally: copy `.env.example` to `.env.local` and set `VITE_WAITLIST_URL=<the URL>`.
   On Vercel: add the same variable (see above).

The script creates a sheet tab called `waitlist` with a header row on the first sign-up.
Each row has a timestamp, name, work email, company, country, "wants to test a prototype",
message and the site it came from.

If `VITE_WAITLIST_URL` is not set, the form shows "Waitlist is not set up yet" and does not send.

The form sends the JSON body with `Content-Type: text/plain`. This avoids a CORS preflight,
which Apps Script web apps cannot answer. Apps Script still reads the body as normal.

When you change the script, use **Deploy → Manage deployments → Edit → New version**,
so the URL stays the same.

## Known placeholders (verify before real use)

- `src/data/iuclidCsvColumns.ts` — placeholder headers, not the real IUCLID template.
- `src/data/productCategories.ts`, `sectorsOfUse.ts`, `technicalFunctions.ts` — subsets,
  wording not checked against the IUCLID picklists.
- `src/data/defaultReleaseFactors.ts` — the ERC2 factors are marked `verified: false`.
- The source comments in `src/logic/fieldApplicabilityRules.ts` name the ECHA guideline,
  but the exact section numbers still need checking.
