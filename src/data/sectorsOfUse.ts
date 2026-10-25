export interface SectorOfUse {
  id: string;
  label: string;
}

// Subset only. VERIFY against ECHA Guidance R.12 and the IUCLID picklist.
export const SECTORS_OF_USE: readonly SectorOfUse[] = [
  { id: 'SU10', label: 'Formulation of mixtures and/or re-packaging' },
  { id: 'SU12', label: 'Manufacture of plastics products' },
  { id: 'SU9', label: 'Manufacture of fine chemicals' },
  { id: 'SU8', label: 'Manufacture of bulk, large scale chemicals' },
  { id: 'SU0', label: 'Other' },
];
