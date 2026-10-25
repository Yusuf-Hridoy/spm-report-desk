export interface TechnicalFunction {
  id: string;
  label: string;
}

// VERIFY exact wording against the IUCLID picklist.
export const TECHNICAL_FUNCTIONS: readonly TechnicalFunction[] = [
  { id: 'binder_film_former', label: 'Binder / film former' },
  { id: 'filler', label: 'Filler' },
  { id: 'viscosity_modifier', label: 'Viscosity modifier' },
  { id: 'pigment_colorant', label: 'Pigment / colorant' },
  { id: 'processing_aid', label: 'Processing aid' },
  { id: 'no_specific_function', label: 'No specific technical function' },
];
