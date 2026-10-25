import type { ReleaseFactors } from '../types/reportTypes';

export interface ReleaseFactorPreset extends ReleaseFactors {
  id: string;
  label: string;
  source: string;
  verified: boolean; // false → show UnverifiedValueBadge in the UI
}

export const DEFAULT_RELEASE_FACTOR_PRESETS: readonly ReleaseFactorPreset[] = [
  {
    id: 'erc2_worst_case',
    label: 'ERC2 – Formulation into a mixture (worst-case default)',
    airPercent: 2.5,
    waterPercent: 2.0,
    soilPercent: 0.01,
    source: 'ECHA Guidance R.16 (environmental release categories)',
    verified: false,
  },
];

export function findReleaseFactorPreset(id: string): ReleaseFactorPreset | undefined {
  return DEFAULT_RELEASE_FACTOR_PRESETS.find((entry) => entry.id === id);
}
