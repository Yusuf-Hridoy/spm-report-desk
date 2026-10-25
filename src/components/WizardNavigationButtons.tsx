import { useId } from 'react';
import { uiText } from '../copy/uiText';

interface WizardNavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  missingFields: string[];
}

export function WizardNavigationButtons({
  onBack,
  onNext,
  missingFields,
}: WizardNavigationButtonsProps) {
  const missingId = useId();
  const showMissing = onNext !== undefined && missingFields.length > 0;
  return (
    <div className="mt-8 border-t border-gray-300 pt-6">
      {showMissing && (
        <div
          id={missingId}
          className="mb-4 rounded-md border border-gray-300 bg-gray-50 p-4"
          aria-live="polite"
        >
          <p className="font-semibold">{uiText.navigation.missingTitle}</p>
          <ul className="mt-2 list-disc pl-5 text-sm" data-testid="missing-fields">
            {missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-3">
        {onBack ? (
          <button type="button" className="btn-secondary" onClick={onBack}>
            {uiText.navigation.back}
          </button>
        ) : (
          <span />
        )}
        {onNext && (
          <button
            type="button"
            className="btn-primary"
            onClick={onNext}
            disabled={missingFields.length > 0}
            aria-describedby={showMissing ? missingId : undefined}
          >
            {uiText.navigation.next}
          </button>
        )}
      </div>
    </div>
  );
}
