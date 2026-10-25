import { useId, useState } from 'react';
import { CardHeading } from '../components/CardHeading';
import { CheckboxGroupField } from '../components/CheckboxGroupField';
import { StepHeading } from '../components/StepHeading';
import { TextInputField } from '../components/TextInputField';
import { uiText } from '../copy/uiText';
import { OTHER_POLYMER_HS_CODE, POLYMER_HS_CODES } from '../data/polymerHsCodes';
import { useReport } from '../state/ReportContext';
import type { UseRow } from '../types/reportTypes';

const text = uiText.stepPolymers;

function polymerLabel(code: string, label: string): string {
  return `${code} ${label}`;
}

function PolymerCard({ use, index }: { use: UseRow; index: number }) {
  const { dispatch } = useReport();
  const [search, setSearch] = useState('');
  const searchId = useId();

  const query = search.trim().toLowerCase();
  // Selected codes stay in the list, so the user can always untick them.
  const visible = POLYMER_HS_CODES.filter(
    (hs) =>
      !query ||
      use.polymerHsCodes.includes(hs.code) ||
      polymerLabel(hs.code, hs.label).toLowerCase().includes(query),
  );
  const selected = POLYMER_HS_CODES.filter((hs) => use.polymerHsCodes.includes(hs.code));

  return (
    <li className="card space-y-4">
      <CardHeading>
        {uiText.common.useCardTitle(index)}: {use.useName || uiText.common.unnamedUse}
      </CardHeading>

      <div>
        <label htmlFor={searchId} className="field-label">
          {text.searchLabel}
        </label>
        <input
          id={searchId}
          type="search"
          className="field-input"
          placeholder={text.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="max-h-80 overflow-y-auto rounded-md border border-gray-300 p-3">
        {visible.length === 0 ? (
          <p className="text-gray-700">{text.noMatches}</p>
        ) : (
          <CheckboxGroupField
            legend={text.listLabel}
            options={visible.map((hs) => ({
              value: hs.code,
              label: polymerLabel(hs.code, hs.label),
            }))}
            selected={use.polymerHsCodes.filter((code) => visible.some((hs) => hs.code === code))}
            onChange={(visibleSelection) => {
              // Keep selections that are hidden by the search.
              const hidden = use.polymerHsCodes.filter(
                (code) => !visible.some((hs) => hs.code === code),
              );
              const next = new Set([...hidden, ...visibleSelection]);
              dispatch({
                type: 'UPDATE_USE',
                id: use.id,
                changes: {
                  polymerHsCodes: POLYMER_HS_CODES.map((hs) => hs.code).filter((code) =>
                    next.has(code),
                  ),
                },
              });
            }}
          />
        )}
      </div>

      <div aria-live="polite">
        <p className="text-sm font-medium">{text.selectedLabel}</p>
        {selected.length === 0 ? (
          <p className="text-sm text-gray-700">{text.noneSelected}</p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-2">
            {selected.map((hs) => (
              <li
                key={hs.code}
                className="rounded-full border border-accent bg-accent-light px-3 py-1 text-sm"
              >
                {polymerLabel(hs.code, hs.label)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {use.polymerHsCodes.includes(OTHER_POLYMER_HS_CODE) && (
        <TextInputField
          label={text.otherTextLabel}
          value={use.polymerOtherText}
          onChange={(polymerOtherText) =>
            dispatch({ type: 'UPDATE_USE', id: use.id, changes: { polymerOtherText } })
          }
        />
      )}
    </li>
  );
}

export function StepPolymers() {
  const { state } = useReport();
  return (
    <section aria-labelledby="step-heading">
      <StepHeading title={text.heading} intro={text.intro} />
      <p className="mt-3 rounded-md border border-gray-300 bg-gray-50 p-3 text-sm">{text.help}</p>
      <ul className="mt-6 space-y-6">
        {state.uses.map((use, index) => (
          <PolymerCard key={use.id} use={use} index={index} />
        ))}
      </ul>
    </section>
  );
}
