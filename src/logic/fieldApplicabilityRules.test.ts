import { describe, expect, it } from 'vitest';
import { createEmptyUse } from '../state/reportReducer';
import type { UseId } from '../types/reportTypes';
import {
  allowedDerogations,
  allowedUses,
  applyEmissionInputApplicability,
  applyFieldApplicability,
  isDerogationFixed,
  requiresSites,
  showsProductCategory,
  showsSectorOfUse,
  showsTechnicalFunction,
} from './fieldApplicabilityRules';

const ALL_USES: UseId[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6'];
const usesWhere = (rule: (useId: UseId) => boolean) => ALL_USES.filter(rule);

describe('fieldApplicabilityRules', () => {
  it('shows product category only for U2 and U6', () => {
    expect(usesWhere(showsProductCategory)).toEqual(['U2', 'U6']);
    for (const hidden of ['U1', 'U3', 'U4', 'U5'] as const) {
      expect(showsProductCategory(hidden)).toBe(false);
    }
  });

  it('shows sector of use only for U1 and U2', () => {
    expect(usesWhere(showsSectorOfUse)).toEqual(['U1', 'U2']);
  });

  it('shows technical function for every use', () => {
    expect(usesWhere(showsTechnicalFunction)).toEqual(ALL_USES);
  });

  it('requires sites only for U1 and U2', () => {
    expect(usesWhere(requiresSites)).toEqual(['U1', 'U2']);
  });

  it('fixes the derogation to 4a for U1 and U2', () => {
    expect(allowedDerogations('U1')).toEqual(['4a']);
    expect(allowedDerogations('U2')).toEqual(['4a']);
    expect(isDerogationFixed('U1')).toBe(true);
    expect(isDerogationFixed('U3')).toBe(false);
  });

  it('lists the right derogations for supplier uses', () => {
    expect(allowedDerogations('U3')).toEqual(['4b', '5a', '5b', '5c']);
    expect(allowedDerogations('U4')).toEqual(['4d', '5a', '5b', '5c']);
    expect(allowedDerogations('U5')).toEqual(['4e', '5a', '5b', '5c']);
    expect(allowedDerogations('U6')).toEqual(['5a', '5b', '5c']);
  });

  it('allows only U1 and U2 for industrial companies, U3–U6 for suppliers', () => {
    expect(allowedUses('industrial')).toEqual(['U1', 'U2']);
    expect(allowedUses('supplier')).toEqual(['U3', 'U4', 'U5', 'U6']);
  });

  it('auto-selects 4a and clears hidden fields when applying rules', () => {
    const use = applyFieldApplicability({
      ...createEmptyUse('u'),
      useId: 'U1',
      derogationIds: ['5a'],
      productCategoryIds: ['PC9a'],
      productCategoryOtherText: 'left over',
      polymerOtherText: 'left over',
    });
    expect(use.derogationIds).toEqual(['4a']);
    expect(use.productCategoryIds).toEqual([]);
    expect(use.productCategoryOtherText).toBe('');
    expect(use.polymerOtherText).toBe('');
  });

  it('clears emission inputs that the chosen options do not use', () => {
    const next = applyEmissionInputApplicability({
      ...createEmptyUse('u').emission,
      form: 'solid',
      solidsPercent: 45,
      reportingOption: 'A',
      knownSpmPercent: 100,
      releaseMethod: 'measured',
      measuredEmissionKg: 3,
      waterMitigationPercent: 50,
    });
    expect(next.solidsPercent).toBeNull();
    expect(next.knownSpmPercent).toBeNull();
    expect(next.presetFactorId).toBeNull();
    expect(next.measuredEmissionKg).toBe(3);
    expect(next.waterMitigationPercent).toBe(0);
  });
});
