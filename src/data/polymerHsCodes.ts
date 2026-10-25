export interface PolymerHsCode {
  code: string;
  label: string;
  needsFreeText?: boolean;
}

export const OTHER_POLYMER_HS_CODE = '9999';

// Source: ECHA reporting guidelines ECHA-26-G-01-EN, Table 2. Ignore "in primary forms".
export const POLYMER_HS_CODES: readonly PolymerHsCode[] = [
  { code: '3806', label: 'Rosin and resin acids, and derivatives' },
  { code: '3901', label: 'Polymers of ethylene' },
  { code: '3902', label: 'Polymers of propylene or other olefins' },
  { code: '3903', label: 'Polymers of styrene' },
  { code: '3904', label: 'Polymers of vinyl chloride or other halogenated olefins' },
  { code: '3905', label: 'Polymers of vinyl acetate or other vinyl esters; other vinyl polymers' },
  { code: '3906', label: 'Acrylic polymers' },
  {
    code: '3907',
    label:
      'Polyacetals, other polyethers, epoxide resins, polycarbonates, alkyd resins, polyesters',
  },
  { code: '3908', label: 'Polyamides' },
  { code: '3909', label: 'Amino-resins, phenolic resins, polyurethanes' },
  { code: '3910', label: 'Silicones' },
  {
    code: '3911',
    label: 'Petroleum resins, coumarone-indene resins, polyterpenes, polysulphides, polysulphones',
  },
  { code: '3912', label: 'Cellulose and its chemical derivatives' },
  { code: '3913', label: 'Modified natural polymers' },
  { code: '4001', label: 'Natural rubber and similar natural gums' },
  { code: '4002', label: 'Synthetic rubber' },
  { code: OTHER_POLYMER_HS_CODE, label: 'Other', needsFreeText: true },
];
