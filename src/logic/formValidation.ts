// Checks what the user typed. Returns plain-English messages; never throws.

import { uiText } from '../copy/uiText';
import { findReleaseFactorPreset } from '../data/defaultReleaseFactors';
import { OPTION_A_CONCENTRATION_RANGES } from '../data/optionAConcentrationRanges';
import { OTHER_POLYMER_HS_CODE } from '../data/polymerHsCodes';
import { OTHER_PRODUCT_CATEGORY_ID } from '../data/productCategories';
import type { EmissionInput, ReportState, ValidationIssue, WizardStep } from '../types/reportTypes';
import {
  requiresSites,
  showsProductCategory,
  showsSectorOfUse,
  showsTechnicalFunction,
} from './fieldApplicabilityRules';

const text = uiText.validation;
const fieldNames = text.emissionFields;

interface NumberRule {
  required: boolean;
  percent: boolean;
}

function checkNumber(
  value: number | null | undefined,
  field: string,
  label: string,
  rule: NumberRule,
): ValidationIssue | null {
  if (value === null || value === undefined) {
    return rule.required ? { field, message: text.required(label) } : null;
  }
  if (!Number.isFinite(value)) return { field, message: text.notNumber(label) };
  if (value < 0) return { field, message: text.negative(label) };
  if (rule.percent && value > 100) return { field, message: text.percentRange(label) };
  return null;
}

const REQUIRED_AMOUNT: NumberRule = { required: true, percent: false };
const REQUIRED_PERCENT: NumberRule = { required: true, percent: true };

export function validateEmissionInput(input: EmissionInput): ValidationIssue[] {
  const issues: (ValidationIssue | null)[] = [];

  issues.push(
    checkNumber(
      input.materialTonnesPerYear,
      'materialTonnesPerYear',
      fieldNames.materialTonnesPerYear,
      REQUIRED_AMOUNT,
    ),
  );

  if (input.form === 'dispersion') {
    issues.push(
      checkNumber(input.solidsPercent, 'solidsPercent', fieldNames.solidsPercent, REQUIRED_PERCENT),
    );
  }

  if (input.reportingOption === 'B') {
    issues.push(
      checkNumber(
        input.knownSpmPercent,
        'knownSpmPercent',
        fieldNames.knownSpmPercent,
        REQUIRED_PERCENT,
      ),
    );
  } else if (
    !input.optionARangeId ||
    !OPTION_A_CONCENTRATION_RANGES.some((range) => range.id === input.optionARangeId)
  ) {
    issues.push({ field: 'optionARangeId', message: text.required(fieldNames.optionARangeId) });
  }

  if (input.releaseMethod === 'measured') {
    issues.push(
      checkNumber(
        input.measuredEmissionKg,
        'measuredEmissionKg',
        fieldNames.measuredEmissionKg,
        REQUIRED_AMOUNT,
      ),
    );
  } else if (input.releaseMethod === 'preset') {
    if (!input.presetFactorId || !findReleaseFactorPreset(input.presetFactorId)) {
      issues.push({ field: 'presetFactorId', message: text.unknownPreset });
    }
  } else if (!input.customFactors) {
    issues.push({ field: 'customFactors', message: text.required(fieldNames.customFactors) });
  } else {
    for (const key of ['airPercent', 'waterPercent', 'soilPercent'] as const) {
      issues.push(
        checkNumber(
          input.customFactors[key],
          `customFactors.${key}`,
          fieldNames[key],
          REQUIRED_PERCENT,
        ),
      );
    }
  }

  issues.push(
    checkNumber(
      input.waterMitigationPercent,
      'waterMitigationPercent',
      fieldNames.waterMitigationPercent,
      REQUIRED_PERCENT,
    ),
    checkNumber(
      input.transportLossKg,
      'transportLossKg',
      fieldNames.transportLossKg,
      REQUIRED_AMOUNT,
    ),
    checkNumber(
      input.unrecoveredSpillsKg,
      'unrecoveredSpillsKg',
      fieldNames.unrecoveredSpillsKg,
      REQUIRED_AMOUNT,
    ),
  );

  return issues.filter((issue): issue is ValidationIssue => issue !== null);
}

// Each step returns a list of plain-English "what is missing" messages.

export function validateCompanyStep(state: ReportState): string[] {
  const missing: string[] = [];
  if (!state.companyName.trim()) missing.push(text.companyName);
  if (!state.companyCountry) missing.push(text.country);
  if (!state.role) missing.push(text.role);
  if (state.role === 'industrial') {
    if (state.sites.length === 0) missing.push(text.atLeastOneSite);
    state.sites.forEach((site, index) => {
      if (!site.name.trim()) missing.push(text.siteField(index, text.siteName));
      if (!site.city.trim()) missing.push(text.siteField(index, text.siteCity));
      if (!site.country) missing.push(text.siteField(index, text.siteCountry));
    });
  }
  return missing;
}

export function validateUsesStep(state: ReportState): string[] {
  if (state.uses.length === 0) return [text.atLeastOneUse];
  const missing: string[] = [];
  state.uses.forEach((use, index) => {
    const add = (field: string) => missing.push(text.useField(index, field));
    if (!use.useId) {
      add(text.use);
      return;
    }
    if (use.derogationIds.length === 0) add(text.derogation);
    if (!use.useName.trim()) add(text.useName);
    if (showsProductCategory(use.useId)) {
      if (use.productCategoryIds.length === 0) add(text.productCategory);
      else if (
        use.productCategoryIds.includes(OTHER_PRODUCT_CATEGORY_ID) &&
        !use.productCategoryOtherText.trim()
      ) {
        add(text.productCategoryOther);
      }
    }
    if (showsSectorOfUse(use.useId) && use.sectorOfUseIds.length === 0) add(text.sectorOfUse);
    if (showsTechnicalFunction(use.useId) && use.technicalFunctionIds.length === 0) {
      add(text.technicalFunction);
    }
    if (requiresSites(use.useId) && use.siteIds.length === 0) add(text.sites);
  });
  return missing;
}

export function validatePolymersStep(state: ReportState): string[] {
  const missing: string[] = [];
  state.uses.forEach((use, index) => {
    if (use.polymerHsCodes.length === 0) missing.push(text.useField(index, text.polymer));
    else if (use.polymerHsCodes.includes(OTHER_POLYMER_HS_CODE) && !use.polymerOtherText.trim()) {
      missing.push(text.useField(index, text.polymerOther));
    }
  });
  return missing;
}

export function validateEmissionsStep(state: ReportState): string[] {
  return state.uses.flatMap((use, index) =>
    validateEmissionInput(use.emission).map((issue) => text.useField(index, issue.message)),
  );
}

export function validateStep(state: ReportState, step: WizardStep): string[] {
  switch (step) {
    case 1:
      return validateCompanyStep(state);
    case 2:
      return validateUsesStep(state);
    case 3:
      return validatePolymersStep(state);
    case 4:
      return validateEmissionsStep(state);
    case 5:
      return [];
  }
}

// The furthest step the user may open: every step before it must be valid.
export function furthestReachableStep(state: ReportState): WizardStep {
  for (const step of [1, 2, 3, 4] as const) {
    if (validateStep(state, step).length > 0) return step;
  }
  return 5;
}
