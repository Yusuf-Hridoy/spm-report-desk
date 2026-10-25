# Changelog

## 0.1.0 — Phase 1 demo (unreleased)

### Added

- Project setup: Vite, React, TypeScript (strict), Tailwind CSS, ESLint, Prettier, Vitest, Playwright.
- Shared types and reference data: uses U1–U6, derogations, polymer HS codes, product
  categories, sectors of use, technical functions, option A ranges, ERC2 release factors,
  placeholder IUCLID CSV columns, EU/EEA countries and a fictional example company.
- Field applicability rules: show only the fields that apply to each use, and clear hidden values.
- Emission calculator: dry weight → SPM amount → air/water/soil release (with water cleaning)
  → transport and spills → report unit, with every step recorded and warnings.
- Form validation for every wizard step, with a list of missing fields.
- Reducer, React context and a browser-only draft (saved 500 ms after the last change).
- 5-step wizard UI with progress bar, prototype banner, help text and an unverified-value badge.
- Review table, CSV download (UTF-8 with BOM) and a print-friendly calculation record.
- Waitlist form and a Google Apps Script that writes sign-ups to a sheet.
- Unit and component tests (Vitest) and end-to-end tests (Playwright).
