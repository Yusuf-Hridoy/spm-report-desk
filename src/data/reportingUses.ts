import type { CompanyRole, UseId } from '../types/reportTypes';

export interface ReportingUse {
  id: UseId;
  label: string; // official ECHA label, use exactly
  helpText: string;
  role: CompanyRole;
}

// Source: ECHA reporting guidelines ECHA-26-G-01-EN, section 4.
export const REPORTING_USES: readonly ReportingUse[] = [
  {
    id: 'U1',
    label:
      'Manufacture or use of pellets, flakes and powders for plastic manufacturing at industrial sites',
    helpText: 'You make or use plastic pellets, flakes or powders to produce plastic.',
    role: 'industrial',
  },
  {
    id: 'U2',
    label: 'Other manufacture or use at industrial sites',
    helpText:
      'You make or use plastic particles at your factory for other things, like paint or glue.',
    role: 'industrial',
  },
  {
    id: 'U3',
    label: 'Consumer and/or professional use in medicinal and veterinary medicinal products',
    helpText: 'You sell medicines with plastic particles to people or professionals.',
    role: 'supplier',
  },
  {
    id: 'U4',
    label: 'Consumer and/or professional use in food additives',
    helpText: 'You sell food additives with plastic particles.',
    role: 'supplier',
  },
  {
    id: 'U5',
    label: 'Consumer and/or professional use in in vitro diagnostic devices',
    helpText: 'You sell lab test kits with plastic particles.',
    role: 'supplier',
  },
  {
    id: 'U6',
    label: 'Other consumer and/or professional use',
    helpText: 'You sell other products with plastic particles to shops, workers or the public.',
    role: 'supplier',
  },
];

export function findReportingUse(id: UseId): ReportingUse {
  const use = REPORTING_USES.find((entry) => entry.id === id);
  if (!use) throw new Error(`Unknown use id: ${id}`);
  return use;
}
