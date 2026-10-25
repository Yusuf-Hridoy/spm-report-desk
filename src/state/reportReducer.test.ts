import { beforeEach, describe, expect, it } from 'vitest';
import { EXAMPLE_COMPANY } from '../data/exampleCompany';
import type { ReportState } from '../types/reportTypes';
import { DRAFT_STORAGE_KEY, loadDraft, saveDraft } from './draftStorage';
import { createEmptyUse, createInitialState, reportReducer } from './reportReducer';

const loadExample = () => reportReducer(createInitialState(), { type: 'LOAD_EXAMPLE' });

describe('reportReducer', () => {
  it('LOAD_EXAMPLE fills every field with the example company', () => {
    const state = loadExample();
    expect(state).toEqual(EXAMPLE_COMPANY);
    expect(state).not.toBe(EXAMPLE_COMPANY);
    expect(state.uses[0]).not.toBe(EXAMPLE_COMPANY.uses[0]);
  });

  it('changing the use clears fields that are now hidden', () => {
    const supplier: ReportState = {
      ...loadExample(),
      role: 'supplier',
      sites: [],
      uses: [{ ...EXAMPLE_COMPANY.uses[0], useId: 'U6', derogationIds: ['5a'], siteIds: [] }],
    };
    const state = reportReducer(supplier, {
      type: 'UPDATE_USE',
      id: 'example-use-1',
      changes: { useId: 'U3' },
    });
    const use = state.uses[0];
    expect(use.useId).toBe('U3');
    expect(use.productCategoryIds).toEqual([]);
    expect(use.sectorOfUseIds).toEqual([]);
    expect(use.siteIds).toEqual([]);
    expect(use.derogationIds).toEqual(['5a']);
    expect(use.technicalFunctionIds).toEqual(['binder_film_former']);
  });

  it('changing to an industrial use fixes the derogation to 4a', () => {
    const base = reportReducer(loadExample(), { type: 'ADD_USE', id: 'new' });
    const state = reportReducer(base, { type: 'UPDATE_USE', id: 'new', changes: { useId: 'U1' } });
    const use = state.uses.find((entry) => entry.id === 'new')!;
    expect(use.derogationIds).toEqual(['4a']);
    expect(use.siteIds).toEqual(['example-site-1']);
  });

  it('changing the role removes uses that no longer fit and says why', () => {
    const base = reportReducer(loadExample(), { type: 'ADD_USE', id: 'blank' });
    const state = reportReducer(base, { type: 'SET_ROLE', role: 'supplier' });
    expect(state.uses.map((use) => use.id)).toEqual(['blank']);
    expect(state.sites).toEqual([]);
    expect(state.notice).toContain('Formulation of water-based industrial wood coatings');
  });

  it('removing a site also removes it from every use', () => {
    const state = reportReducer(loadExample(), { type: 'REMOVE_SITE', id: 'example-site-1' });
    expect(state.sites).toEqual([]);
    expect(state.uses[0].siteIds).toEqual([]);
  });

  it('switching the release method clears the old method values', () => {
    const state = reportReducer(loadExample(), {
      type: 'SET_EMISSION_FIELD',
      useRowId: 'example-use-1',
      field: 'releaseMethod',
      value: 'measured',
    });
    expect(state.uses[0].emission.presetFactorId).toBeNull();
    expect(state.uses[0].emission.releaseMethod).toBe('measured');
  });

  it('GO_TO_STEP cannot skip past a step that is not complete', () => {
    expect(reportReducer(createInitialState(), { type: 'GO_TO_STEP', step: 4 }).currentStep).toBe(
      1,
    );
    expect(reportReducer(loadExample(), { type: 'GO_TO_STEP', step: 5 }).currentStep).toBe(5);
  });

  it('RESET clears everything', () => {
    expect(reportReducer(loadExample(), { type: 'RESET' })).toEqual(createInitialState());
  });

  it('new uses start empty with default emission inputs', () => {
    const use = createEmptyUse('x');
    expect(use.useId).toBeNull();
    expect(use.emission.waterMitigationPercent).toBe(0);
  });
});

// In-memory Storage, so the test does not depend on the browser or Node's own localStorage.
function createMemoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  };
}

describe('draftStorage', () => {
  let storage: Storage;
  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it('saves and loads a draft', () => {
    saveDraft({ ...loadExample(), notice: 'temporary' }, storage);
    expect(loadDraft(storage)).toEqual(EXAMPLE_COMPANY);
  });

  it('starts fresh when the draft is broken', () => {
    storage.setItem(DRAFT_STORAGE_KEY, '{not json');
    expect(loadDraft(storage)).toBeNull();
    expect(storage.getItem(DRAFT_STORAGE_KEY)).toBeNull();

    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ hello: 'world' }));
    expect(loadDraft(storage)).toBeNull();
  });

  it('does nothing when storage is not available', () => {
    expect(loadDraft(null)).toBeNull();
    expect(() => saveDraft(loadExample(), null)).not.toThrow();
  });
});
