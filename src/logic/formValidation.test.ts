import { describe, expect, it } from 'vitest';
import { uiText } from '../copy/uiText';
import { EXAMPLE_COMPANY } from '../data/exampleCompany';
import { createEmptyUse, createInitialState } from '../state/reportReducer';
import {
  furthestReachableStep,
  validateCompanyStep,
  validateEmissionInput,
  validatePolymersStep,
  validateUsesStep,
} from './formValidation';

const text = uiText.validation;

describe('formValidation', () => {
  it('lists every missing company field on an empty step 1', () => {
    expect(validateCompanyStep(createInitialState())).toEqual([
      text.companyName,
      text.country,
      text.role,
    ]);
  });

  it('asks industrial companies for at least one complete site', () => {
    const state = { ...createInitialState(), companyName: 'X', companyCountry: 'Austria' };
    expect(validateCompanyStep({ ...state, role: 'industrial' })).toEqual([text.atLeastOneSite]);
    expect(validateCompanyStep({ ...state, role: 'supplier' })).toEqual([]);
  });

  it('accepts the example company on every step', () => {
    expect(furthestReachableStep(EXAMPLE_COMPANY)).toBe(5);
  });

  it('needs at least one use, and a use type on each card', () => {
    const state = { ...EXAMPLE_COMPANY, uses: [] };
    expect(validateUsesStep(state)).toEqual([text.atLeastOneUse]);
    expect(validateUsesStep({ ...state, uses: [createEmptyUse('a')] })).toEqual([
      text.useField(0, text.use),
    ]);
  });

  it('needs a description when "Other" polymer is picked', () => {
    const use = { ...EXAMPLE_COMPANY.uses[0], polymerHsCodes: ['9999'], polymerOtherText: ' ' };
    expect(validatePolymersStep({ ...EXAMPLE_COMPANY, uses: [use] })).toEqual([
      text.useField(0, text.polymerOther),
    ]);
  });

  it('treats 0 as valid and empty as missing', () => {
    const base = EXAMPLE_COMPANY.uses[0].emission;
    expect(validateEmissionInput({ ...base, materialTonnesPerYear: 0 })).toEqual([]);
    expect(validateEmissionInput({ ...base, materialTonnesPerYear: null })).toEqual([
      {
        field: 'materialTonnesPerYear',
        message: text.required(text.emissionFields.materialTonnesPerYear),
      },
    ]);
  });

  it('rejects text that is not a number', () => {
    const base = EXAMPLE_COMPANY.uses[0].emission;
    expect(validateEmissionInput({ ...base, transportLossKg: Number.NaN })[0].field).toBe(
      'transportLossKg',
    );
  });

  it('needs a range for option A and a measured value for the measured method', () => {
    const base = EXAMPLE_COMPANY.uses[0].emission;
    const fields = validateEmissionInput({
      ...base,
      reportingOption: 'A',
      knownSpmPercent: null,
      optionARangeId: null,
      releaseMethod: 'measured',
      measuredEmissionKg: null,
    }).map((issue) => issue.field);
    expect(fields).toEqual(['optionARangeId', 'measuredEmissionKg']);
  });
});
