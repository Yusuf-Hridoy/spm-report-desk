// Saves the report draft in this browser only (localStorage). Never sent anywhere.

import type { ReportState } from '../types/reportTypes';
import { createDefaultEmissionInput, createInitialState } from './reportReducer';

export const DRAFT_STORAGE_KEY = 'spm-report-desk:draft:v1';
export const DRAFT_SAVE_DELAY_MS = 500;

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Light shape check: enough to reject old or broken drafts without crashing.
function looksLikeReportState(value: unknown): value is ReportState {
  if (!isObject(value)) return false;
  return (
    typeof value.reportingYear === 'number' &&
    typeof value.companyName === 'string' &&
    typeof value.companyCountry === 'string' &&
    (value.role === null || value.role === 'industrial' || value.role === 'supplier') &&
    Array.isArray(value.sites) &&
    value.sites.every(isObject) &&
    Array.isArray(value.uses) &&
    value.uses.every((use) => isObject(use) && isObject(use.emission)) &&
    [1, 2, 3, 4, 5].includes(value.currentStep as number)
  );
}

export function loadDraft(storage: Storage | null = getStorage()): ReportState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!looksLikeReportState(parsed)) throw new Error('Draft has an unknown shape');
    return {
      ...createInitialState(),
      ...parsed,
      uses: parsed.uses.map((use) => ({
        ...use,
        emission: { ...createDefaultEmissionInput(), ...use.emission },
      })),
    };
  } catch {
    // Broken draft: forget it and start fresh.
    try {
      storage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Storage is not available. Nothing else to do.
    }
    return null;
  }
}

export function saveDraft(state: ReportState, storage: Storage | null = getStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...state, notice: null }));
  } catch {
    // Storage is full or blocked. The app still works without a draft.
  }
}
