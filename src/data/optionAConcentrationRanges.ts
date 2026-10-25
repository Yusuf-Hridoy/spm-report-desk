import type { OptionARangeId } from '../types/reportTypes';

export interface OptionAConcentrationRange {
  id: OptionARangeId;
  label: string;
  upperBoundPercent: number;
  reportLabel: string; // what goes into the report column
}

// Source: ECHA reporting guidelines ECHA-26-G-01-EN, option A ranges.
// "I don't know" must be reported as the highest range (90–100%).
export const OPTION_A_CONCENTRATION_RANGES: readonly OptionAConcentrationRange[] = [
  { id: 'r0_1_10', label: '0.1–10%', upperBoundPercent: 10, reportLabel: '0.1–10%' },
  { id: 'r10_30', label: '10–30%', upperBoundPercent: 30, reportLabel: '10–30%' },
  { id: 'r30_50', label: '30–50%', upperBoundPercent: 50, reportLabel: '30–50%' },
  { id: 'r50_70', label: '50–70%', upperBoundPercent: 70, reportLabel: '50–70%' },
  { id: 'r70_90', label: '70–90%', upperBoundPercent: 90, reportLabel: '70–90%' },
  { id: 'r90_100', label: '90–100%', upperBoundPercent: 100, reportLabel: '90–100%' },
  { id: 'unknown', label: "I don't know", upperBoundPercent: 100, reportLabel: '90–100%' },
];

export function findOptionARange(id: OptionARangeId): OptionAConcentrationRange {
  const range = OPTION_A_CONCENTRATION_RANGES.find((entry) => entry.id === id);
  if (!range) throw new Error(`Unknown option A range id: ${id}`);
  return range;
}
