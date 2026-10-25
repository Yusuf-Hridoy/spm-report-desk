export interface ProductCategory {
  id: string;
  label: string;
  needsFreeText?: boolean;
}

export const OTHER_PRODUCT_CATEGORY_ID = 'PC0';

// Subset only. VERIFY against ECHA Guidance R.12 and the IUCLID picklist.
export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  { id: 'PC9a', label: 'Coatings and paints, thinners, paint removers' },
  { id: 'PC1', label: 'Adhesives, sealants' },
  { id: 'PC18', label: 'Ink and toners' },
  { id: 'PC35', label: 'Washing and cleaning products' },
  { id: 'PC32', label: 'Polymer preparations and compounds' },
  { id: OTHER_PRODUCT_CATEGORY_ID, label: 'Other', needsFreeText: true },
];
