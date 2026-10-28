import { describe, expect, it } from 'vitest';
import { uiText } from '../copy/uiText';
import { EXAMPLE_COMPANY } from '../data/exampleCompany';
import { createDefaultEmissionInput } from '../state/reportReducer';
import type { EmissionInput } from '../types/reportTypes';
import {
  EmissionInputError,
  calculateEmission,
  concentrationColumnValue,
  tryCalculateEmission,
} from './emissionCalculator';

const text = uiText.calculation;

function input(changes: Partial<EmissionInput>): EmissionInput {
  return { ...createDefaultEmissionInput(), ...changes };
}

function stepValue(result: ReturnType<typeof calculateEmission>, label: string): number {
  const step = result.steps.find((entry) => entry.label === label);
  if (!step) throw new Error(`No step called "${label}"`);
  return step.value;
}

// 120 t dispersion, 45% solids, option B 100%, preset ERC2 — the example company.
const exampleEmission = EXAMPLE_COMPANY.uses[0].emission;

// Solid material where the SPM amount is exactly the material amount.
const fiftyFourTonnesSpm = input({
  materialTonnesPerYear: 54,
  form: 'solid',
  reportingOption: 'B',
  knownSpmPercent: 100,
});

const measured = (kg: number, extra: Partial<EmissionInput> = {}) =>
  input({
    materialTonnesPerYear: 10,
    knownSpmPercent: 100,
    releaseMethod: 'measured',
    measuredEmissionKg: kg,
    ...extra,
  });

describe('emissionCalculator', () => {
  it('1. 120 t dispersion at 45% solids gives 54 t dry weight', () => {
    const result = calculateEmission(exampleEmission);
    expect(stepValue(result, text.dryWeightLabel)).toBeCloseTo(54, 10);
    expect(result.steps[0].formula).toBe('120 t × 45%');
  });

  it('2. solid form 10 t gives 10 t dry weight', () => {
    const result = calculateEmission(input({ materialTonnesPerYear: 10, knownSpmPercent: 100 }));
    expect(stepValue(result, text.dryWeightLabel)).toBe(10);
  });

  it('3. option B with 54 t dry weight and 100% SPM gives 54 t SPM', () => {
    const result = calculateEmission(exampleEmission);
    expect(stepValue(result, text.spmAmountLabel)).toBeCloseTo(54, 10);
  });

  it('4. option A "unknown" uses 100% and adds the "highest value" warning', () => {
    const result = calculateEmission(
      input({ materialTonnesPerYear: 10, reportingOption: 'A', optionARangeId: 'unknown' }),
    );
    expect(stepValue(result, text.spmAmountLabel)).toBe(10);
    expect(result.warnings).toContain(text.warningUnknownRange);
    expect(
      concentrationColumnValue(input({ reportingOption: 'A', optionARangeId: 'unknown' })),
    ).toBe('90–100%');
  });

  it('5. option A 10–30% on 10 t gives 3 t SPM', () => {
    const result = calculateEmission(
      input({ materialTonnesPerYear: 10, reportingOption: 'A', optionARangeId: 'r10_30' }),
    );
    expect(stepValue(result, text.spmAmountLabel)).toBeCloseTo(3, 10);
    expect(result.warnings).not.toContain(text.warningUnknownRange);
  });

  it('6. preset ERC2 on 54 t SPM gives 2.4354 t and the worst-case warning', () => {
    const result = calculateEmission(exampleEmission);
    expect(stepValue(result, text.airLabel)).toBeCloseTo(1350, 6);
    expect(stepValue(result, text.waterAfterLabel)).toBeCloseTo(1080, 6);
    expect(stepValue(result, text.soilLabel)).toBeCloseTo(5.4, 6);
    expect(result.totalKg).toBeCloseTo(2435.4, 6);
    expect(result.displayValue).toBe(2.4354);
    expect(result.displayUnit).toBe('t');
    expect(result.warnings).toContain(text.warningPresetWorstCase);
  });

  it('7. 50% water mitigation halves the water release', () => {
    const result = calculateEmission({ ...exampleEmission, waterMitigationPercent: 50 });
    expect(stepValue(result, text.waterBeforeLabel)).toBeCloseTo(1080, 6);
    expect(stepValue(result, text.waterAfterLabel)).toBeCloseTo(540, 6);
    expect(result.totalKg).toBeCloseTo(1895.4, 6);
    expect(result.displayValue).toBe(1.8954);
  });

  it('8. measured 50 kg is shown as 50 kg', () => {
    const result = calculateEmission(measured(50));
    expect(result.totalKg).toBe(50);
    expect(result.displayValue).toBe(50);
    expect(result.displayUnit).toBe('kg');
    expect(result.steps.some((step) => step.label === text.airLabel)).toBe(false);
  });

  it('9. transport 10 kg and spills 5 kg are added to measured 50 kg', () => {
    const result = calculateEmission(measured(50, { transportLossKg: 10, unrecoveredSpillsKg: 5 }));
    expect(result.totalKg).toBe(65);
    expect(result.displayValue).toBe(65);
    expect(result.displayUnit).toBe('kg');
  });

  it('10. a total of 0 is allowed and shown as 0 kg', () => {
    const result = calculateEmission(measured(0));
    expect(result.totalKg).toBe(0);
    expect(result.displayValue).toBe(0);
    expect(result.displayUnit).toBe('kg');
  });

  it('11. exactly 1,000 kg is shown as 1 t', () => {
    const result = calculateEmission(measured(1000));
    expect(result.displayValue).toBe(1);
    expect(result.displayUnit).toBe('t');
  });

  it('12. a negative number is a validation error', () => {
    const bad = measured(-5);
    expect(() => calculateEmission(bad)).toThrow(EmissionInputError);
    expect(tryCalculateEmission(bad).issues.map((issue) => issue.field)).toContain(
      'measuredEmissionKg',
    );
  });

  it('13. a percentage above 100 is a validation error', () => {
    const bad = { ...exampleEmission, solidsPercent: 120 };
    expect(() => calculateEmission(bad)).toThrow(EmissionInputError);
    expect(tryCalculateEmission(bad).issues.map((issue) => issue.field)).toEqual(['solidsPercent']);
  });

  it('14. a dispersion without solids % is a validation error', () => {
    const bad = { ...exampleEmission, solidsPercent: null };
    expect(() => calculateEmission(bad)).toThrow(EmissionInputError);
    expect(tryCalculateEmission(bad).issues.map((issue) => issue.field)).toEqual(['solidsPercent']);
  });

  it('works with custom factors and no worst-case warning', () => {
    const result = calculateEmission({
      ...fiftyFourTonnesSpm,
      releaseMethod: 'custom',
      presetFactorId: null,
      customFactors: { airPercent: 1, waterPercent: 0, soilPercent: 0 },
    });
    expect(result.totalKg).toBeCloseTo(540, 6);
    expect(result.warnings).toEqual([]);
  });

  it('reports "Option B" in the concentration column for option B', () => {
    expect(concentrationColumnValue(exampleEmission)).toBe('Option B');
  });
});
