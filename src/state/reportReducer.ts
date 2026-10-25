// All changes to the report go through this reducer. Pure: ids are passed in with the action.

import { uiText } from '../copy/uiText';
import { DEFAULT_RELEASE_FACTOR_PRESETS } from '../data/defaultReleaseFactors';
import { EXAMPLE_COMPANY } from '../data/exampleCompany';
import { findReportingUse } from '../data/reportingUses';
import {
  allowedUses,
  applyEmissionInputApplicability,
  applyFieldApplicability,
  requiresSites,
} from '../logic/fieldApplicabilityRules';
import { furthestReachableStep } from '../logic/formValidation';
import type {
  CompanyRole,
  EmissionInput,
  ReportState,
  Site,
  UseRow,
  WizardStep,
} from '../types/reportTypes';

export const DEFAULT_REPORTING_YEAR = 2026;

type CompanyField = 'companyName' | 'companyCountry';
type EmissionField = keyof EmissionInput;
export type UseRowChanges = Partial<Omit<UseRow, 'id' | 'emission'>>;

export type ReportAction =
  | { type: 'SET_COMPANY_FIELD'; field: CompanyField; value: string }
  | { type: 'SET_ROLE'; role: CompanyRole }
  | { type: 'ADD_SITE'; id: string }
  | { type: 'UPDATE_SITE'; id: string; changes: Partial<Omit<Site, 'id'>> }
  | { type: 'REMOVE_SITE'; id: string }
  | { type: 'ADD_USE'; id: string }
  | { type: 'UPDATE_USE'; id: string; changes: UseRowChanges }
  | { type: 'REMOVE_USE'; id: string }
  | {
      [K in EmissionField]: {
        type: 'SET_EMISSION_FIELD';
        useRowId: string;
        field: K;
        value: EmissionInput[K];
      };
    }[EmissionField]
  | { type: 'GO_TO_STEP'; step: WizardStep }
  | { type: 'LOAD_EXAMPLE' }
  | { type: 'RESET' }
  | { type: 'DISMISS_NOTICE' };

// Typed helper: TypeScript cannot narrow a generic field to one member of the union above.
export function setEmissionField<K extends EmissionField>(
  useRowId: string,
  field: K,
  value: EmissionInput[K],
): ReportAction {
  return { type: 'SET_EMISSION_FIELD', useRowId, field, value } as ReportAction;
}

export function createInitialState(): ReportState {
  return {
    reportingYear: DEFAULT_REPORTING_YEAR,
    companyName: '',
    companyCountry: '',
    role: null,
    sites: [],
    uses: [],
    currentStep: 1,
    notice: null,
  };
}

export function createDefaultEmissionInput(): EmissionInput {
  return {
    materialTonnesPerYear: null,
    form: 'solid',
    solidsPercent: null,
    reportingOption: 'B',
    knownSpmPercent: null,
    optionARangeId: null,
    releaseMethod: 'preset',
    measuredEmissionKg: null,
    presetFactorId: DEFAULT_RELEASE_FACTOR_PRESETS[0]?.id ?? null,
    customFactors: null,
    waterMitigationPercent: 0,
    transportLossKg: 0,
    unrecoveredSpillsKg: 0,
  };
}

export function createEmptyUse(id: string): UseRow {
  return {
    id,
    useId: null,
    derogationIds: [],
    useName: '',
    productCategoryIds: [],
    productCategoryOtherText: '',
    sectorOfUseIds: [],
    technicalFunctionIds: [],
    siteIds: [],
    polymerHsCodes: [],
    polymerOtherText: '',
    emission: createDefaultEmissionInput(),
  };
}

function cloneExample(): ReportState {
  return JSON.parse(JSON.stringify(EXAMPLE_COMPANY)) as ReportState;
}

function useDisplayName(use: UseRow): string {
  if (use.useName.trim()) return `"${use.useName.trim()}"`;
  return use.useId ? findReportingUse(use.useId).label : uiText.common.unnamedUse;
}

function setRole(state: ReportState, role: CompanyRole): ReportState {
  if (state.role === role) return state;

  const allowed = allowedUses(role);
  const removed = state.uses.filter((use) => use.useId !== null && !allowed.includes(use.useId));
  const keptUses = state.uses.filter((use) => !removed.includes(use));
  const removesSites = role === 'supplier' && state.sites.length > 0;

  const messages: string[] = [];
  if (removed.length > 0) {
    messages.push(
      uiText.notice.usesRemovedForRole(removed.length, removed.map(useDisplayName).join(', ')),
    );
  }
  if (removesSites) messages.push(uiText.notice.sitesRemovedForRole);

  return {
    ...state,
    role,
    sites: role === 'supplier' ? [] : state.sites,
    uses: keptUses.map((use) =>
      applyFieldApplicability(role === 'supplier' ? { ...use, siteIds: [] } : use),
    ),
    notice: messages.length > 0 ? messages.join(' ') : state.notice,
  };
}

function updateUse(state: ReportState, id: string, changes: UseRowChanges): ReportState {
  return {
    ...state,
    uses: state.uses.map((use) => {
      if (use.id !== id) return use;
      const next = applyFieldApplicability({ ...use, ...changes });
      // Convenience: with only one site, a factory use is always at that site.
      const useChanged = changes.useId !== undefined && changes.useId !== use.useId;
      if (
        useChanged &&
        next.useId &&
        requiresSites(next.useId) &&
        next.siteIds.length === 0 &&
        state.sites.length === 1
      ) {
        next.siteIds = [state.sites[0].id];
      }
      return next;
    }),
  };
}

export function reportReducer(state: ReportState, action: ReportAction): ReportState {
  switch (action.type) {
    case 'SET_COMPANY_FIELD':
      return { ...state, [action.field]: action.value };

    case 'SET_ROLE':
      return setRole(state, action.role);

    case 'ADD_SITE':
      return {
        ...state,
        sites: [
          ...state.sites,
          { id: action.id, name: '', city: '', country: state.companyCountry },
        ],
      };

    case 'UPDATE_SITE':
      return {
        ...state,
        sites: state.sites.map((site) =>
          site.id === action.id ? { ...site, ...action.changes } : site,
        ),
      };

    case 'REMOVE_SITE':
      return {
        ...state,
        sites: state.sites.filter((site) => site.id !== action.id),
        uses: state.uses.map((use) => ({
          ...use,
          siteIds: use.siteIds.filter((siteId) => siteId !== action.id),
        })),
      };

    case 'ADD_USE':
      return { ...state, uses: [...state.uses, createEmptyUse(action.id)] };

    case 'UPDATE_USE':
      return updateUse(state, action.id, action.changes);

    case 'REMOVE_USE':
      return { ...state, uses: state.uses.filter((use) => use.id !== action.id) };

    case 'SET_EMISSION_FIELD':
      return {
        ...state,
        uses: state.uses.map((use) =>
          use.id === action.useRowId
            ? {
                ...use,
                emission: applyEmissionInputApplicability({
                  ...use.emission,
                  [action.field]: action.value,
                }),
              }
            : use,
        ),
      };

    case 'GO_TO_STEP': {
      const furthest = furthestReachableStep(state);
      return { ...state, currentStep: action.step <= furthest ? action.step : furthest };
    }

    case 'LOAD_EXAMPLE':
      return cloneExample();

    case 'RESET':
      return createInitialState();

    case 'DISMISS_NOTICE':
      return { ...state, notice: null };
  }
}
