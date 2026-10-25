import type { ReportState } from '../types/reportTypes';

// Fictional company for the "Load example" button. Never use real company names.
export const EXAMPLE_COMPANY: ReportState = {
  reportingYear: 2026,
  companyName: 'Nordlicht Beschichtungen GmbH',
  companyCountry: 'Germany',
  role: 'industrial',
  sites: [{ id: 'example-site-1', name: 'Main plant', city: 'Bremen', country: 'Germany' }],
  uses: [
    {
      id: 'example-use-1',
      useId: 'U2',
      derogationIds: ['4a'],
      useName: 'Formulation of water-based industrial wood coatings',
      productCategoryIds: ['PC9a'],
      productCategoryOtherText: '',
      sectorOfUseIds: ['SU10'],
      technicalFunctionIds: ['binder_film_former'],
      siteIds: ['example-site-1'],
      polymerHsCodes: ['3906'],
      polymerOtherText: '',
      emission: {
        materialTonnesPerYear: 120,
        form: 'dispersion',
        solidsPercent: 45,
        reportingOption: 'B',
        knownSpmPercent: 100,
        optionARangeId: null,
        releaseMethod: 'preset',
        measuredEmissionKg: null,
        presetFactorId: 'erc2_worst_case',
        customFactors: null,
        waterMitigationPercent: 0,
        transportLossKg: 0,
        unrecoveredSpillsKg: 0,
      },
    },
  ],
  currentStep: 1,
  notice: null,
};
