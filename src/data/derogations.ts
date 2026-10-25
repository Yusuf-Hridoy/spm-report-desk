import type { CompanyRole, DerogationId } from '../types/reportTypes';

export interface Derogation {
  id: DerogationId;
  label: string;
  helpText: string;
  role: CompanyRole;
}

// Source: REACH Annex XVII, Entry 78, paragraphs 4 and 5.
export const DEROGATIONS: readonly Derogation[] = [
  {
    id: '4a',
    label: '4(a) Use at industrial sites',
    helpText: 'The particles are used at a factory.',
    role: 'industrial',
  },
  {
    id: '4b',
    label: '4(b) Medicinal products',
    helpText: 'The product is a medicine.',
    role: 'supplier',
  },
  {
    id: '4d',
    label: '4(d) Food additives',
    helpText: 'The product is a food additive.',
    role: 'supplier',
  },
  {
    id: '4e',
    label: '4(e) In vitro diagnostic devices',
    helpText: 'The product is a lab test kit.',
    role: 'supplier',
  },
  {
    id: '5a',
    label: '5(a) Contained by technical means',
    helpText: "The particles are kept inside the product and can't escape.",
    role: 'supplier',
  },
  {
    id: '5b',
    label: '5(b) Physical properties permanently changed',
    helpText: 'The particles change for good when used, so they are no longer particles.',
    role: 'supplier',
  },
  {
    id: '5c',
    label: '5(c) Permanently built into a solid',
    helpText: 'The particles are locked into a solid material.',
    role: 'supplier',
  },
];

export function findDerogation(id: DerogationId): Derogation {
  const derogation = DEROGATIONS.find((entry) => entry.id === id);
  if (!derogation) throw new Error(`Unknown derogation id: ${id}`);
  return derogation;
}
