// Works out the yearly SPM emission for one use, recording every step.
// Pure functions, no React. Rules: docs/phase-1-brief.md section 7.2.

import { uiText } from '../copy/uiText';
import {
  DEFAULT_RELEASE_FACTOR_PRESETS,
  type ReleaseFactorPreset,
} from '../data/defaultReleaseFactors';
import { findOptionARange } from '../data/optionAConcentrationRanges';
import type {
  CalculationStep,
  EmissionInput,
  EmissionResult,
  ReleaseFactors,
  ValidationIssue,
} from '../types/reportTypes';
import { validateEmissionInput } from './formValidation';
import { formatNumber, roundTo } from './numberFormatting';

const text = uiText.calculation;

export class EmissionInputError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(issues.map((issue) => issue.message).join(' '));
    this.name = 'EmissionInputError';
    this.issues = issues;
  }
}

// Step E: under 1,000 kg we report kg (2 decimals), otherwise tonnes (4 decimals).
export function toDisplayValue(
  totalKg: number,
): Pick<EmissionResult, 'displayValue' | 'displayUnit'> {
  if (totalKg < 1000) return { displayValue: roundTo(totalKg, 2), displayUnit: 'kg' };
  return { displayValue: roundTo(totalKg / 1000, 4), displayUnit: 't' };
}

// Throws EmissionInputError if the input is not complete or not valid.
export function calculateEmission(
  input: EmissionInput,
  presets: readonly ReleaseFactorPreset[] = DEFAULT_RELEASE_FACTOR_PRESETS,
): EmissionResult {
  const issues = validateEmissionInput(input);
  if (issues.length > 0) throw new EmissionInputError(issues);

  const steps: CalculationStep[] = [];
  const warnings: string[] = [];
  const kg = (value: number) => `${formatNumber(value)} kg`;

  // Step A — dry weight
  const materialT = input.materialTonnesPerYear as number;
  let dryWeightT = materialT;
  if (input.form === 'dispersion') {
    const solids = input.solidsPercent as number;
    dryWeightT = (materialT * solids) / 100;
    steps.push({
      label: text.dryWeightLabel,
      formula: `${formatNumber(materialT)} t × ${formatNumber(solids)}%`,
      value: dryWeightT,
      unit: 't',
    });
  } else {
    steps.push({
      label: text.dryWeightLabel,
      formula: text.solidFormula(formatNumber(materialT)),
      value: dryWeightT,
      unit: 't',
    });
  }

  // Step B — amount of SPM
  let spmT: number;
  if (input.reportingOption === 'B') {
    const known = input.knownSpmPercent as number;
    spmT = (dryWeightT * known) / 100;
    steps.push({
      label: text.spmAmountLabel,
      formula: `${formatNumber(dryWeightT)} t × ${formatNumber(known)}%`,
      value: spmT,
      unit: 't',
    });
  } else {
    const range = findOptionARange(input.optionARangeId!);
    spmT = (dryWeightT * range.upperBoundPercent) / 100;
    steps.push({
      label: text.spmAmountLabel,
      formula: `${formatNumber(dryWeightT)} t × ${range.upperBoundPercent}% (${text.upperBoundNote(range.reportLabel)})`,
      value: spmT,
      unit: 't',
    });
    if (range.id === 'unknown') warnings.push(text.warningUnknownRange);
  }

  // Step C — release to air, water and soil
  let releaseKg: number;
  if (input.releaseMethod === 'measured') {
    releaseKg = input.measuredEmissionKg as number;
    steps.push({
      label: text.measuredReleaseLabel,
      formula: text.measuredFormula,
      value: releaseKg,
      unit: 'kg',
    });
  } else {
    let factors: ReleaseFactors;
    if (input.releaseMethod === 'preset') {
      const preset = presets.find((entry) => entry.id === input.presetFactorId);
      if (!preset) {
        throw new EmissionInputError([
          { field: 'presetFactorId', message: uiText.validation.unknownPreset },
        ]);
      }
      factors = preset;
      warnings.push(text.warningPresetWorstCase);
    } else {
      factors = input.customFactors as ReleaseFactors;
    }

    const spmKg = spmT * 1000;
    const spmFormula = `${formatNumber(spmT)} t × 1,000`;
    const airKg = (spmKg * factors.airPercent) / 100;
    const waterKgBefore = (spmKg * factors.waterPercent) / 100;
    const waterKg = waterKgBefore * (1 - input.waterMitigationPercent / 100);
    const soilKg = (spmKg * factors.soilPercent) / 100;
    releaseKg = airKg + waterKg + soilKg;

    steps.push(
      {
        label: text.airLabel,
        formula: `${spmFormula} × ${formatNumber(factors.airPercent)}%`,
        value: airKg,
        unit: 'kg',
      },
      {
        label: text.waterBeforeLabel,
        formula: `${spmFormula} × ${formatNumber(factors.waterPercent)}%`,
        value: waterKgBefore,
        unit: 'kg',
      },
      {
        label: text.waterAfterLabel,
        formula: `${kg(waterKgBefore)} × (100% − ${formatNumber(input.waterMitigationPercent)}%)`,
        value: waterKg,
        unit: 'kg',
      },
      {
        label: text.soilLabel,
        formula: `${spmFormula} × ${formatNumber(factors.soilPercent)}%`,
        value: soilKg,
        unit: 'kg',
      },
      {
        label: text.releaseTotalLabel,
        formula: `${kg(airKg)} + ${kg(waterKg)} + ${kg(soilKg)}`,
        value: releaseKg,
        unit: 'kg',
      },
    );
  }

  // Step D — add transport, storage and spill losses
  const totalKg = releaseKg + input.transportLossKg + input.unrecoveredSpillsKg;
  steps.push({
    label: text.totalLabel,
    formula: text.totalFormula(
      kg(releaseKg),
      kg(input.transportLossKg),
      kg(input.unrecoveredSpillsKg),
    ),
    value: totalKg,
    unit: 'kg',
  });

  // Step E — unit for the report
  const display = toDisplayValue(totalKg);
  steps.push({
    label: text.reportValueLabel,
    formula:
      display.displayUnit === 'kg'
        ? text.roundedKg(formatNumber(totalKg))
        : text.convertedToTonnes(formatNumber(totalKg)),
    value: display.displayValue,
    unit: display.displayUnit,
  });

  return { steps, totalKg, ...display, warnings };
}

// Same as calculateEmission, but returns the problems instead of throwing.
export function tryCalculateEmission(input: EmissionInput): {
  result: EmissionResult | null;
  issues: ValidationIssue[];
} {
  try {
    return { result: calculateEmission(input), issues: [] };
  } catch (error) {
    if (error instanceof EmissionInputError) return { result: null, issues: error.issues };
    throw error;
  }
}

// Report column "Concentration range (option A) or option B".
export function concentrationColumnValue(input: EmissionInput): string {
  if (input.reportingOption === 'B') return text.optionBReportValue;
  if (!input.optionARangeId) return '';
  return findOptionARange(input.optionARangeId).reportLabel;
}
