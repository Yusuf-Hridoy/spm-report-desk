import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { ReportState } from '../types/reportTypes';
import { DRAFT_SAVE_DELAY_MS, loadDraft, saveDraft } from './draftStorage';
import { createInitialState, reportReducer, type ReportAction } from './reportReducer';

interface ReportContextValue {
  state: ReportState;
  dispatch: Dispatch<ReportAction>;
}

const ReportContext = createContext<ReportContextValue | null>(null);

function loadInitialState(): ReportState {
  return loadDraft() ?? createInitialState();
}

export function ReportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reportReducer, undefined, loadInitialState);

  // Save the draft 500 ms after the last change.
  useEffect(() => {
    const timer = window.setTimeout(() => saveDraft(state), DRAFT_SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  return <ReportContext.Provider value={{ state, dispatch }}>{children}</ReportContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReport(): ReportContextValue {
  const value = useContext(ReportContext);
  if (!value) throw new Error('useReport must be used inside ReportProvider');
  return value;
}
