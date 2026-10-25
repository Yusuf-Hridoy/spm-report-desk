import { uiText } from '../copy/uiText';

export function PrototypeBanner() {
  return (
    <div
      role="note"
      className="sticky top-0 z-20 border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950"
    >
      {uiText.prototypeBanner}
    </div>
  );
}
