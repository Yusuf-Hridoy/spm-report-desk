# Phase 1 brief — spm-report-desk (for Claude Code)

> Put this file in the repo at `docs/phase-1-brief.md`.
> Then tell Claude Code: **"Read docs/phase-1-brief.md. First show me your plan. Wait for my OK. Then build it step by step."**

---

## 1. Background (read this first)

### The law

The EU has a rule about microplastics: **REACH Annex XVII, Entry 78**. The official name for the plastic particles is **synthetic polymer microparticles (SPM)**.

Many companies that use these particles at their factory must send a **report to ECHA** (the EU chemicals agency) **every year by 31 May**. For most companies, the **first report is due 31 May 2027** and covers emissions in **2026**.

### What the report contains

One table. One row per "use". Columns:

| Column                                     | Notes                                             |
| ------------------------------------------ | ------------------------------------------------- |
| Use                                        | Pick from 6 options                               |
| Derogation                                 | The legal exception that lets them keep using SPM |
| Use name                                   | Free text, English                                |
| Product category (PC)                      | Only for some uses                                |
| Sector of use (SU)                         | Only for some uses                                |
| Technical function (TF)                    | All uses                                          |
| Site(s)                                    | Only for factory uses                             |
| Generic identity of polymers               | Pick from a list of HS codes                      |
| Estimated emission quantity                | kg or tonnes per year                             |
| Concentration range (option A) or option B | How the emission number was expressed             |

The report is made in ECHA's software **IUCLID**. IUCLID can **import the table from a CSV file**.

### The hard part

Filling the table is easy. **Estimating the emission number is hard.** It must:

- cover the full calendar year,
- add up air + water + soil,
- include transport losses, storage losses and spills,
- be calculated **after** any cleaning or treatment (mitigation),
- use **dry weight** if the material is a liquid dispersion,
- be reported even if it is **zero** (there is no lower limit).

### Our product

A website that guides a small company through the report, **calculates the emission number with every step shown**, and gives them a file ready for IUCLID.

### Phase 1 goal

A **clickable demo** to show to companies and get feedback.
It is **not** for real submissions.

---

## 2. Scope

### In Phase 1

1. A 5-step wizard: Company → Uses → Polymers → Emissions → Review.
2. A rules engine: shows only the fields that apply to each use.
3. An emission calculator with a visible step-by-step record.
4. A review table + CSV download.
5. A print-friendly calculation record.
6. A "Load example" button with a fake company.
7. A permanent "prototype" warning banner.
8. A waitlist form (sends to a Google Sheet).
9. Unit tests (Vitest) and a few end-to-end tests (Playwright).

### NOT in Phase 1

- Login, accounts, payments
- Database or saving between visits (except a simple browser draft, see 7.4)
- Reading supplier safety data sheets
- Other languages
- Real IUCLID CSV headers (we use placeholders)
- Any AI / LLM calls

---

## 3. Tech stack

Keep it simple and standard.

- **Vite + React + TypeScript** (strict mode on)
- **Tailwind CSS** for styling
- **React state with `useReducer`** + one React Context. No Redux, no Zustand.
- **Vitest** + **React Testing Library** for unit/component tests
- **Playwright** for end-to-end tests
- **ESLint + Prettier**
- Deploy on **Vercel** (static site)
- Use the latest stable versions at install time. Commit `package-lock.json`.

No backend. No external API calls, except the waitlist POST.

---

## 4. Folder and file structure

Use these exact names. Every file name must say what the file does.

```
spm-report-desk/
├─ docs/
│  └─ phase-1-brief.md
├─ CLAUDE.md                          # short rules for Claude Code (see section 13)
├─ README.md
├─ CHANGELOG.md
├─ apps-script/
│  └─ waitlistToGoogleSheet.gs
├─ e2e/
│  ├─ wizardHappyPath.spec.ts
│  └─ wizardValidation.spec.ts
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ types/
│  │  └─ reportTypes.ts               # all shared TypeScript types
│  ├─ data/
│  │  ├─ reportingUses.ts
│  │  ├─ derogations.ts
│  │  ├─ polymerHsCodes.ts
│  │  ├─ productCategories.ts
│  │  ├─ sectorsOfUse.ts
│  │  ├─ technicalFunctions.ts
│  │  ├─ optionAConcentrationRanges.ts
│  │  ├─ defaultReleaseFactors.ts
│  │  ├─ iuclidCsvColumns.ts
│  │  └─ exampleCompany.ts
│  ├─ logic/
│  │  ├─ emissionCalculator.ts
│  │  ├─ emissionCalculator.test.ts
│  │  ├─ fieldApplicabilityRules.ts
│  │  ├─ fieldApplicabilityRules.test.ts
│  │  ├─ formValidation.ts
│  │  ├─ formValidation.test.ts
│  │  ├─ csvExport.ts
│  │  ├─ csvExport.test.ts
│  │  └─ numberFormatting.ts
│  ├─ state/
│  │  ├─ reportReducer.ts
│  │  ├─ reportReducer.test.ts
│  │  ├─ ReportContext.tsx
│  │  └─ draftStorage.ts              # save/load draft in localStorage
│  ├─ components/
│  │  ├─ PrototypeBanner.tsx
│  │  ├─ WizardProgressBar.tsx
│  │  ├─ WizardNavigationButtons.tsx
│  │  ├─ FieldHelpText.tsx
│  │  ├─ UnverifiedValueBadge.tsx
│  │  ├─ CalculationStepsTable.tsx
│  │  └─ WaitlistForm.tsx
│  ├─ steps/
│  │  ├─ StepCompany.tsx
│  │  ├─ StepUses.tsx
│  │  ├─ StepPolymers.tsx
│  │  ├─ StepEmissions.tsx
│  │  └─ StepReview.tsx
│  ├─ pages/
│  │  └─ PrintCalculationRecord.tsx
│  └─ copy/
│     └─ uiText.ts                    # ALL user-facing text lives here
└─ ...config files
```

**Rule:** no user-facing text inside components. All text comes from `src/copy/uiText.ts`. This makes translation easy later.

---

## 5. Types (`src/types/reportTypes.ts`)

```ts
export type CompanyRole = 'industrial' | 'supplier';

export type UseId = 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6';

export type DerogationId = '4a' | '4b' | '4d' | '4e' | '5a' | '5b' | '5c';

export type MaterialForm = 'solid' | 'dispersion';

export type ReportingOption = 'A' | 'B';

export type OptionARangeId =
  'r0_1_10' | 'r10_30' | 'r30_50' | 'r50_70' | 'r70_90' | 'r90_100' | 'unknown';

export type ReleaseMethod = 'measured' | 'preset' | 'custom';

export interface Site {
  id: string;
  name: string;
  city: string;
  country: string;
}

export interface EmissionInput {
  materialTonnesPerYear: number | null;
  form: MaterialForm;
  solidsPercent: number | null; // required if form = 'dispersion'
  reportingOption: ReportingOption;
  knownSpmPercent: number | null; // used when option B
  optionARangeId: OptionARangeId | null; // used when option A
  releaseMethod: ReleaseMethod;
  measuredEmissionKg: number | null; // used when method = 'measured'
  presetFactorId: string | null; // used when method = 'preset'
  customFactors: { airPercent: number; waterPercent: number; soilPercent: number } | null;
  waterMitigationPercent: number; // default 0
  transportLossKg: number; // default 0
  unrecoveredSpillsKg: number; // default 0
}

export interface UseRow {
  id: string;
  useId: UseId | null;
  derogationIds: DerogationId[];
  useName: string;
  productCategoryIds: string[];
  productCategoryOtherText: string;
  sectorOfUseIds: string[];
  technicalFunctionIds: string[];
  siteIds: string[];
  polymerHsCodes: string[];
  polymerOtherText: string;
  emission: EmissionInput;
}

export interface ReportState {
  reportingYear: number; // default 2026
  companyName: string;
  companyCountry: string;
  role: CompanyRole | null;
  sites: Site[];
  uses: UseRow[];
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export interface CalculationStep {
  label: string; // plain English, e.g. "Dry weight of material"
  formula: string; // e.g. "120 t × 45%"
  value: number;
  unit: 'kg' | 't' | '%';
}

export interface EmissionResult {
  steps: CalculationStep[];
  totalKg: number;
  displayValue: number;
  displayUnit: 'kg' | 't';
  warnings: string[]; // e.g. "Release factors not yet verified"
}
```

---

## 6. Data files (exact content)

### `reportingUses.ts`

| id  | Official label (use exactly)                                                                    | Plain help text                                                                         |
| --- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| U1  | Manufacture or use of pellets, flakes and powders for plastic manufacturing at industrial sites | You make or use plastic pellets, flakes or powders to produce plastic.                  |
| U2  | Other manufacture or use at industrial sites                                                    | You make or use plastic particles at your factory for other things, like paint or glue. |
| U3  | Consumer and/or professional use in medicinal and veterinary medicinal products                 | You sell medicines with plastic particles to people or professionals.                   |
| U4  | Consumer and/or professional use in food additives                                              | You sell food additives with plastic particles.                                         |
| U5  | Consumer and/or professional use in in vitro diagnostic devices                                 | You sell lab test kits with plastic particles.                                          |
| U6  | Other consumer and/or professional use                                                          | You sell other products with plastic particles to shops, workers or the public.         |

Each entry also has `role: 'industrial'` (U1, U2) or `role: 'supplier'` (U3–U6).

### `derogations.ts`

| id  | Label                                        | Plain help text                                                           | role       |
| --- | -------------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| 4a  | 4(a) Use at industrial sites                 | The particles are used at a factory.                                      | industrial |
| 4b  | 4(b) Medicinal products                      | The product is a medicine.                                                | supplier   |
| 4d  | 4(d) Food additives                          | The product is a food additive.                                           | supplier   |
| 4e  | 4(e) In vitro diagnostic devices             | The product is a lab test kit.                                            | supplier   |
| 5a  | 5(a) Contained by technical means            | The particles are kept inside the product and can't escape.               | supplier   |
| 5b  | 5(b) Physical properties permanently changed | The particles change for good when used, so they are no longer particles. | supplier   |
| 5c  | 5(c) Permanently built into a solid          | The particles are locked into a solid material.                           | supplier   |

### `polymerHsCodes.ts`

3806 Rosin and resin acids, and derivatives · 3901 Polymers of ethylene · 3902 Polymers of propylene or other olefins · 3903 Polymers of styrene · 3904 Polymers of vinyl chloride or other halogenated olefins · 3905 Polymers of vinyl acetate or other vinyl esters; other vinyl polymers · 3906 Acrylic polymers · 3907 Polyacetals, other polyethers, epoxide resins, polycarbonates, alkyd resins, polyesters · 3908 Polyamides · 3909 Amino-resins, phenolic resins, polyurethanes · 3910 Silicones · 3911 Petroleum resins, coumarone-indene resins, polyterpenes, polysulphides, polysulphones · 3912 Cellulose and its chemical derivatives · 3913 Modified natural polymers · 4001 Natural rubber and similar natural gums · 4002 Synthetic rubber · 9999 Other (needs free text)

Add a comment: `// Source: ECHA reporting guidelines ECHA-26-G-01-EN, Table 2. Ignore "in primary forms".`

### `productCategories.ts`

PC9a Coatings and paints, thinners, paint removers · PC1 Adhesives, sealants · PC18 Ink and toners · PC35 Washing and cleaning products · PC32 Polymer preparations and compounds · PC0 Other (needs free text)
Comment: `// Subset only. VERIFY against ECHA Guidance R.12 and the IUCLID picklist.`

### `sectorsOfUse.ts`

SU10 Formulation of mixtures and/or re-packaging · SU12 Manufacture of plastics products · SU9 Manufacture of fine chemicals · SU8 Manufacture of bulk, large scale chemicals · SU0 Other
Comment: `// Subset only. VERIFY against ECHA Guidance R.12 and the IUCLID picklist.`

### `technicalFunctions.ts`

Binder / film former · Filler · Viscosity modifier · Pigment / colorant · Processing aid · No specific technical function
Comment: `// VERIFY exact wording against the IUCLID picklist.`

### `optionAConcentrationRanges.ts`

| id      | label        | upperBoundPercent                   |
| ------- | ------------ | ----------------------------------- |
| r0_1_10 | 0.1–10%      | 10                                  |
| r10_30  | 10–30%       | 30                                  |
| r30_50  | 30–50%       | 50                                  |
| r50_70  | 50–70%       | 70                                  |
| r70_90  | 70–90%       | 90                                  |
| r90_100 | 90–100%      | 100                                 |
| unknown | I don't know | 100 (maps to 90–100% in the report) |

### `defaultReleaseFactors.ts`

```ts
{
  id: 'erc2_worst_case',
  label: 'ERC2 – Formulation into a mixture (worst-case default)',
  airPercent: 2.5,
  waterPercent: 2.0,
  soilPercent: 0.01,
  source: 'ECHA Guidance R.16 (environmental release categories)',
  verified: false,
}
```

Every factor with `verified: false` must show `UnverifiedValueBadge` in the UI.

### `iuclidCsvColumns.ts`

```ts
// PLACEHOLDER — replace with the real IUCLID CSV template headers later.
export const IUCLID_CSV_COLUMNS = [
  'Use',
  'Derogation',
  'Use name',
  'Product category (PC)',
  'Sector of use (SU)',
  'Technical function (TF)',
  'Site(s)',
  'Generic information on the identity of polymers',
  'Estimated emission quantity',
  'Unit',
  'Concentration range of SPM (Option A) or Option B',
] as const;
```

### `exampleCompany.ts` (fictional only)

- Company: **Nordlicht Beschichtungen GmbH**, Germany
- Role: industrial
- Site: "Main plant", Bremen, Germany
- One use:
  - U2, derogation 4a
  - Use name: "Formulation of water-based industrial wood coatings"
  - PC9a, SU10, TF "Binder / film former", HS 3906
  - Emission: 120 t/year, dispersion, 45% solids, option B, known SPM 100% of solids, method = preset ERC2, mitigation 0, transport 0, spills 0

---

## 7. Business rules

### 7.1 Field applicability (`fieldApplicabilityRules.ts`)

Export pure functions. Each one takes a `UseId`.

| Function                        | Returns true for                                                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `showsProductCategory(useId)`   | U2, U6                                                                                                                                                         |
| `showsSectorOfUse(useId)`       | U1, U2                                                                                                                                                         |
| `showsTechnicalFunction(useId)` | all                                                                                                                                                            |
| `requiresSites(useId)`          | U1, U2                                                                                                                                                         |
| `allowedDerogations(useId)`     | U1/U2 → `['4a']` (fixed, auto-selected) · U3 → `['4b','5a','5b','5c']` · U4 → `['4d','5a','5b','5c']` · U5 → `['4e','5a','5b','5c']` · U6 → `['5a','5b','5c']` |
| `allowedUses(role)`             | industrial → U1, U2 · supplier → U3–U6                                                                                                                         |

Add a comment above each rule with the source section, e.g. `// ECHA guidelines section 4.4`.

When a user changes a use, **clear values for fields that are now hidden**.

### 7.2 Emission calculator (`emissionCalculator.ts`)

Pure functions. No React. Every step is pushed to `steps[]`.

**Step A — Dry weight (tonnes)**

- If `form = 'solid'` → `dryWeightT = materialTonnesPerYear`
- If `form = 'dispersion'` → `dryWeightT = materialTonnesPerYear × solidsPercent / 100`
- Step label: "Dry weight of material"

**Step B — SPM amount (tonnes)**

- Option B → `spmT = dryWeightT × knownSpmPercent / 100`
- Option A → `spmT = dryWeightT × upperBoundPercent / 100` (from the range table; unknown = 100)
- Step label: "Amount of plastic particles (SPM)"
- If option A and range = unknown, add warning: "You did not know the amount, so we used the highest value (90–100%), as ECHA asks."

**Step C — Release**

- Method `measured` → `releaseKg = measuredEmissionKg` (skip factor steps)
- Method `preset` or `custom`:
  - `airKg = spmT × 1000 × airPercent / 100`
  - `waterKgBefore = spmT × 1000 × waterPercent / 100`
  - `waterKg = waterKgBefore × (1 − waterMitigationPercent / 100)`
  - `soilKg = spmT × 1000 × soilPercent / 100`
  - `releaseKg = airKg + waterKg + soilKg`
  - One step each for air, water (before and after mitigation), soil.
  - If the preset has `verified: false` → add warning "These release factors are not yet verified."

**Step D — Add transport and spills**

- `totalKg = releaseKg + transportLossKg + unrecoveredSpillsKg`

**Step E — Display unit**

- `totalKg < 1000` → show in **kg**, rounded to 2 decimals
- `totalKg ≥ 1000` → show in **tonnes** (`totalKg / 1000`), rounded to 4 decimals

**Validation (throw or return errors via `formValidation.ts`)**

- All numbers must be ≥ 0.
- Percentages must be 0–100.
- `solidsPercent` required when form = dispersion.
- `knownSpmPercent` required for option B; `optionARangeId` required for option A.
- `measuredEmissionKg` required for method measured.
- **0 is a valid total. Empty is not.**

**Report column "Concentration range (option A) or option B"**

- Option B → `"Option B"`
- Option A → the range label (unknown → `"90–100%"`)

### 7.3 Reducer (`reportReducer.ts`)

Actions (at least): `SET_COMPANY_FIELD`, `SET_ROLE`, `ADD_SITE`, `UPDATE_SITE`, `REMOVE_SITE`, `ADD_USE`, `UPDATE_USE`, `REMOVE_USE`, `SET_EMISSION_FIELD`, `GO_TO_STEP`, `LOAD_EXAMPLE`, `RESET`.

- Changing role → remove uses that no longer fit, and tell the user why.
- `LOAD_EXAMPLE` → replaces state with `exampleCompany`.
- `RESET` → asks "Start over? This clears everything." before clearing.

### 7.4 Draft saving (`draftStorage.ts`)

- Save state to `localStorage` on every change (debounced 500 ms).
- Load on start. Wrap in try/catch. If broken, start fresh.
- Show a small line: "Your answers are saved in this browser only."

---

## 8. The 5 steps (UI)

All text must be **plain, everyday English**. Short sentences. No jargon without a short explanation.

### Step 1 — Company

- Fields: company name, country (EU/EEA list), reporting year (default 2026, read-only note: "Report due by 31 May 2027").
- Role choice (two big cards):
  - "We make or use plastic particles at our factory" → industrial
  - "We sell products with plastic particles to shops, workers or the public" → supplier
- Sites section (only if role = industrial): add/edit/remove sites.
- Buttons: "Load example", "Start over", "Next".

### Step 2 — Uses

- List of use cards. "Add a use" button.
- Each card: use (filtered by role), derogation (auto for industrial), use name, and only the fields that apply (PC, SU, TF, sites).
- Help text under each field via `FieldHelpText`.

### Step 3 — Polymers

- For each use: multi-select HS codes with search.
- If 9999 → text box "Describe the polymer in a few words."
- Help text: "Check your supplier's safety data sheet. It usually says the polymer type in section 15."

### Step 4 — Emissions

- For each use, a calculator panel:
  - Material per year (tonnes), form, solids % (if dispersion).
  - Option A or B, with a short plain explanation of each.
  - Release method (measured / standard factors / my own factors).
  - Mitigation %, transport losses, spills.
- Live result box: big number + unit.
- `CalculationStepsTable` showing every step.
- Warnings shown in a yellow box.

### Step 5 — Review

- One table, one row per use, all 10 report columns.
- Buttons: "Download CSV", "Print calculation record", "Back".
- Then the `WaitlistForm`.

### Always visible

- `PrototypeBanner`: "Prototype only. The numbers are examples. Do not send them to ECHA. Check every value."
- `WizardProgressBar` with the 5 step names.
- Next button disabled until the step is valid. Show which fields are missing.

### Look and feel

- White background, one accent colour (dark teal), grey borders.
- Max width 960 px, centred. Works at 375 px and 1440 px.
- Accessible: real `<label>`s, keyboard works everywhere, visible focus, colour contrast AA.

---

## 9. CSV export (`csvExport.ts`)

- One header row from `IUCLID_CSV_COLUMNS`, then one row per use.
- Multi-select values joined with `"; "`.
- Hidden/not-applicable fields → empty cell.
- Emission: number in its display unit + a separate Unit column.
- UTF-8 with BOM (so Excel opens umlauts correctly). Escape quotes and commas.
- File name: `spm-report-<company-name-slug>-<year>.csv`.

## 10. Print page (`PrintCalculationRecord.tsx`)

- Title: "Microplastics emission calculation record"
- Company, year, date created.
- For each use: inputs, every calculation step, total, warnings.
- Footer: "Made with a prototype tool. Not for submission."
- Print-friendly CSS (`@media print`), opened via a button that calls `window.print()`.

## 11. Waitlist

- `WaitlistForm.tsx`: name, work email, company, country, checkbox "I would like to test a prototype", optional message.
- POST JSON to `import.meta.env.VITE_WAITLIST_URL`.
- If the env variable is missing → show "Waitlist is not set up yet" and don't crash.
- Success: "Thank you! We will contact you soon." Error: "Something went wrong. Please try again."
- `apps-script/waitlistToGoogleSheet.gs`: `doPost(e)` appends a row (timestamp + fields) to a sheet named `waitlist`. README explains deploy as web app.

---

## 12. Tests

### Unit (Vitest) — must all pass

**emissionCalculator.test.ts**

1. 120 t dispersion at 45% solids → dry weight 54 t.
2. Solid form 10 t → dry weight 10 t.
3. Option B, 54 t dry, 100% SPM → 54 t SPM.
4. Option A unknown → uses 100% and adds the "highest value" warning.
5. Option A 10–30% on 10 t → 3 t SPM.
6. Preset ERC2 on 54 t SPM → air 1,350 kg, water 1,080 kg, soil 5.4 kg, total 2,435.4 kg → displayed 2.4354 t, plus "not verified" warning.
7. Water mitigation 50% on the case above → water 540 kg, total 1,895.4 kg.
8. Measured 50 kg → displayed 50 kg.
9. Transport 10 kg + spills 5 kg added to measured 50 kg → 65 kg.
10. Total 0 is allowed and shown as 0 kg.
11. Exactly 1,000 kg → shown as 1 t.
12. Negative number → validation error.
13. Percent above 100 → validation error.
14. Dispersion without solids % → validation error.

**fieldApplicabilityRules.test.ts**

- PC hidden for U1, U3, U4, U5; shown for U2, U6.
- SU shown only for U1, U2.
- Sites required only for U1, U2.
- U1/U2 derogation fixed to 4a.
- Industrial role allows only U1, U2.

**reportReducer.test.ts**

- LOAD_EXAMPLE fills all fields.
- Changing use clears hidden fields.
- Changing role removes uses that don't fit.

**csvExport.test.ts**

- Header row matches `IUCLID_CSV_COLUMNS`.
- Example company → exact expected CSV string.
- Commas and quotes inside text are escaped.

### End-to-end (Playwright)

- **wizardHappyPath.spec.ts:** load example → go through all steps → result shows 2.4354 t → CSV downloads.
- **wizardValidation.spec.ts:** empty step 1 → Next is disabled and missing fields are listed.

---

## 13. `CLAUDE.md` (create this in the repo root)

```md
# Rules for this repo

- Read docs/phase-1-brief.md before any work.
- Plain, simple English for all user-facing text. All text lives in src/copy/uiText.ts.
- File names must say what the file does.
- Business logic only in src/logic (pure functions, fully tested).
- Never use real company names. Fictional data only.
- Run `npm run test` and `npm run lint` before every commit.
- Small commits with clear messages (feat:, fix:, test:, docs:).
- Do not add libraries that are not in the brief without asking.
- Do not add AI/LLM calls, analytics or tracking.
```

## 14. Git workflow

- Branch: `feature/phase-1-demo`
- Build in this order, one commit (or a few) per item:
  1. Project setup (Vite, TS, Tailwind, ESLint, Prettier, Vitest, Playwright)
  2. Types + data files
  3. `fieldApplicabilityRules` + tests
  4. `emissionCalculator` + tests
  5. Reducer + context + draft storage + tests
  6. Steps 1–5 UI
  7. CSV export + tests
  8. Print page
  9. Waitlist + Apps Script
  10. E2E tests
  11. README + CHANGELOG
- Do **not** merge to main. Open a pull request when done.

## 15. Definition of done

- [ ] `npm run test` — all unit tests pass
- [ ] `npm run test:e2e` — both Playwright tests pass
- [ ] `npm run lint` — no errors
- [ ] `npm run build` — builds with no TypeScript errors
- [ ] Example company goes through all 5 steps and shows 2.4354 t
- [ ] CSV downloads and opens correctly in Excel
- [ ] Print record looks clean
- [ ] Banner always visible
- [ ] Works at 375 px and 1440 px
- [ ] No real company names anywhere
- [ ] README explains: install, run, test, deploy to Vercel, set up the waitlist

## 16. When you finish, report back with

1. A short list of what was built.
2. Anything you were unsure about, or did differently from this brief, and why.
3. Test results (numbers passed/failed).
4. The pull request link.
