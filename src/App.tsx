import { useEffect, useRef } from 'react';
import { PrototypeBanner } from './components/PrototypeBanner';
import { WizardNavigationButtons } from './components/WizardNavigationButtons';
import { WizardProgressBar } from './components/WizardProgressBar';
import { uiText } from './copy/uiText';
import { furthestReachableStep, validateStep } from './logic/formValidation';
import { PrintCalculationRecord } from './pages/PrintCalculationRecord';
import { useReport } from './state/ReportContext';
import { StepCompany } from './steps/StepCompany';
import { StepEmissions } from './steps/StepEmissions';
import { StepPolymers } from './steps/StepPolymers';
import { StepReview } from './steps/StepReview';
import { StepUses } from './steps/StepUses';
import type { WizardStep } from './types/reportTypes';

const STEP_COMPONENTS = {
  1: StepCompany,
  2: StepUses,
  3: StepPolymers,
  4: StepEmissions,
  5: StepReview,
} as const;

export default function App() {
  const { state, dispatch } = useReport();
  const { currentStep } = state;
  const missingFields = validateStep(state, currentStep);
  const furthestStep = furthestReachableStep(state);
  const CurrentStep = STEP_COMPONENTS[currentStep];

  const goToStep = (step: WizardStep) => dispatch({ type: 'GO_TO_STEP', step });

  // Move focus to the new step's heading, so keyboard and screen reader users start at the top.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById('step-heading')?.focus();
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-white">
      <PrototypeBanner />

      <div className="print:hidden">
        <header className="border-b border-gray-300">
          <div className="mx-auto max-w-[960px] px-4 py-5">
            <h1 className="text-2xl font-bold text-accent">{uiText.app.title}</h1>
            <p className="mt-1 text-gray-700">{uiText.app.subtitle}</p>
            <p className="mt-1 text-sm text-gray-600">{uiText.app.draftSavedNote}</p>
          </div>
        </header>

        <main className="mx-auto max-w-[960px] px-4 py-6">
          <WizardProgressBar
            currentStep={currentStep}
            furthestStep={furthestStep}
            onGoToStep={goToStep}
          />
          <CurrentStep />
          <WizardNavigationButtons
            missingFields={missingFields}
            onBack={currentStep > 1 ? () => goToStep((currentStep - 1) as WizardStep) : undefined}
            onNext={currentStep < 5 ? () => goToStep((currentStep + 1) as WizardStep) : undefined}
          />
        </main>
      </div>

      <div className="mx-auto hidden max-w-[960px] px-4 py-6 print:block print:max-w-none print:p-0">
        <PrintCalculationRecord />
      </div>
    </div>
  );
}
