// Which report fields apply to which use. Pure functions, no React.
// Source for all rules: ECHA reporting guidelines ECHA-26-G-01-EN (reporting table).
// VERIFY the exact section numbers against the published guideline.

import { OTHER_POLYMER_HS_CODE } from '../data/polymerHsCodes';
import { OTHER_PRODUCT_CATEGORY_ID } from '../data/productCategories';
import { DEFAULT_RELEASE_FACTOR_PRESETS } from '../data/defaultReleaseFactors';
import type { CompanyRole, DerogationId, EmissionInput, UseId, UseRow } from '../types/reportTypes';

// ECHA guidelines, reporting table: product category (PC) is reported for U2 and U6 only.
export function showsProductCategory(useId: UseId): boolean {
  return useId === 'U2' || useId === 'U6';
}

// ECHA guidelines, reporting table: sector of use (SU) is reported for industrial uses only.
export function showsSectorOfUse(useId: UseId): boolean {
  return useId === 'U1' || useId === 'U2';
}

// ECHA guidelines, reporting table: technical function (TF) is reported for every use.
export function showsTechnicalFunction(useId: UseId): boolean {
  void useId;
  return true;
}

// ECHA guidelines, reporting table: sites are reported for industrial uses only.
export function requiresSites(useId: UseId): boolean {
  return useId === 'U1' || useId === 'U2';
}

// REACH Annex XVII Entry 78, paragraphs 4 and 5, and ECHA guidelines on which
// derogation fits which use. U1/U2 are always 4(a) and the user cannot change it.
export function allowedDerogations(useId: UseId): DerogationId[] {
  switch (useId) {
    case 'U1':
    case 'U2':
      return ['4a'];
    case 'U3':
      return ['4b', '5a', '5b', '5c'];
    case 'U4':
      return ['4d', '5a', '5b', '5c'];
    case 'U5':
      return ['4e', '5a', '5b', '5c'];
    case 'U6':
      return ['5a', '5b', '5c'];
  }
}

// U1/U2 have exactly one derogation, picked for the user.
export function isDerogationFixed(useId: UseId): boolean {
  return useId === 'U1' || useId === 'U2';
}

// ECHA guidelines: industrial sites report U1–U2, suppliers report U3–U6.
export function allowedUses(role: CompanyRole): UseId[] {
  return role === 'industrial' ? ['U1', 'U2'] : ['U3', 'U4', 'U5', 'U6'];
}

// Clears every value that no longer applies to the chosen use, so hidden
// fields never leak into the report.
export function applyFieldApplicability(use: UseRow): UseRow {
  const next: UseRow = { ...use };

  if (next.useId === null) {
    next.derogationIds = [];
    next.productCategoryIds = [];
    next.sectorOfUseIds = [];
    next.siteIds = [];
  } else {
    const allowed = allowedDerogations(next.useId);
    next.derogationIds = isDerogationFixed(next.useId)
      ? allowed
      : next.derogationIds.filter((id) => allowed.includes(id));
    if (!showsProductCategory(next.useId)) next.productCategoryIds = [];
    if (!showsSectorOfUse(next.useId)) next.sectorOfUseIds = [];
    if (!showsTechnicalFunction(next.useId)) next.technicalFunctionIds = [];
    if (!requiresSites(next.useId)) next.siteIds = [];
  }

  if (!next.productCategoryIds.includes(OTHER_PRODUCT_CATEGORY_ID)) {
    next.productCategoryOtherText = '';
  }
  if (!next.polymerHsCodes.includes(OTHER_POLYMER_HS_CODE)) {
    next.polymerOtherText = '';
  }
  return next;
}

// Same idea for the emission calculator: clear inputs that the chosen
// options do not use, and fill in sensible starting values for new ones.
export function applyEmissionInputApplicability(input: EmissionInput): EmissionInput {
  const next: EmissionInput = { ...input };

  if (next.form === 'solid') next.solidsPercent = null;

  if (next.reportingOption === 'B') next.optionARangeId = null;
  else next.knownSpmPercent = null;

  if (next.releaseMethod !== 'measured') next.measuredEmissionKg = null;

  if (next.releaseMethod === 'preset') {
    next.presetFactorId ??= DEFAULT_RELEASE_FACTOR_PRESETS[0]?.id ?? null;
  } else {
    next.presetFactorId = null;
  }

  if (next.releaseMethod === 'custom') {
    next.customFactors ??= { airPercent: 0, waterPercent: 0, soilPercent: 0 };
  } else {
    next.customFactors = null;
  }

  // A measured value is already after cleaning, so water cleaning does not apply.
  if (next.releaseMethod === 'measured') next.waterMitigationPercent = 0;

  return next;
}
