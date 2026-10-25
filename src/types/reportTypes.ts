// All shared TypeScript types for the report wizard.

export type CompanyRole = 'industrial' | 'supplier';

export type UseId = 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6';

export type DerogationId = '4a' | '4b' | '4d' | '4e' | '5a' | '5b' | '5c';

export type MaterialForm = 'solid' | 'dispersion';

export type ReportingOption = 'A' | 'B';

export type OptionARangeId =
  'r0_1_10' | 'r10_30' | 'r30_50' | 'r50_70' | 'r70_90' | 'r90_100' | 'unknown';

export type ReleaseMethod = 'measured' | 'preset' | 'custom';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface Site {
  id: string;
  name: string;
  city: string;
  country: string;
}

export interface ReleaseFactors {
  airPercent: number;
  waterPercent: number;
  soilPercent: number;
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
  customFactors: ReleaseFactors | null;
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
  currentStep: WizardStep;
  notice: string | null; // one-off message for the user, e.g. why uses were removed
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

export interface ValidationIssue {
  field: string;
  message: string;
}
