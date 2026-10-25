import { uiText } from '../copy/uiText';

export function UnverifiedValueBadge() {
  return (
    <span
      title={uiText.unverifiedBadge.title}
      className="inline-flex items-center rounded-full border border-amber-500 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900"
    >
      {uiText.unverifiedBadge.label}
    </span>
  );
}
