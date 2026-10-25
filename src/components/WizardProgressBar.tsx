import { uiText } from '../copy/uiText';
import type { WizardStep } from '../types/reportTypes';

const STEPS: WizardStep[] = [1, 2, 3, 4, 5];

interface WizardProgressBarProps {
  currentStep: WizardStep;
  furthestStep: WizardStep;
  onGoToStep: (step: WizardStep) => void;
}

export function WizardProgressBar({
  currentStep,
  furthestStep,
  onGoToStep,
}: WizardProgressBarProps) {
  const names = uiText.progress.stepNames;
  return (
    <nav aria-label={uiText.progress.navLabel} className="mb-6">
      <p className="mb-2 text-sm font-medium text-gray-700 sm:hidden">
        {uiText.progress.stepOf(currentStep, STEPS.length)}: {names[currentStep - 1]}
      </p>
      <ol className="flex gap-1 sm:gap-2">
        {STEPS.map((step) => {
          const isCurrent = step === currentStep;
          const isDone = step < currentStep;
          const reachable = step <= furthestStep;
          return (
            <li key={step} className="flex-1">
              <button
                type="button"
                onClick={() => onGoToStep(step)}
                disabled={!reachable || isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex w-full flex-col items-start gap-1 border-t-4 pt-2 text-left text-sm disabled:cursor-default ${
                  isCurrent || isDone ? 'border-accent' : 'border-gray-300'
                } ${reachable && !isCurrent ? 'hover:text-accent' : ''}`}
              >
                <span className={`font-semibold ${isCurrent ? 'text-accent' : 'text-gray-700'}`}>
                  {step}
                </span>
                <span
                  className={`hidden sm:block ${isCurrent ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                >
                  {names[step - 1]}
                </span>
                <span className="sr-only sm:hidden">{names[step - 1]}</span>
                {isCurrent && <span className="sr-only">{uiText.progress.currentStepSuffix}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
