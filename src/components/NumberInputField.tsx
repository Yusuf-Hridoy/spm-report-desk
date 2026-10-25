import { useId, useState } from 'react';
import { parseNumberInput } from '../logic/numberFormatting';
import { FieldHelpText } from './FieldHelpText';

interface NumberInputFieldProps {
  label: string;
  helpText?: string;
  value: number | null;
  // What an empty box means: null (missing) or 0 (fields that default to 0).
  emptyValue?: null | 0;
  onChange: (value: number | null) => void;
  errorMessage?: string;
}

// A text box for numbers. Keeps what the user typed (like "45," or "") while
// sending the parsed number up. Shows the stored value when it changes from outside.
export function NumberInputField({
  label,
  helpText,
  value,
  emptyValue = null,
  onChange,
  errorMessage,
}: NumberInputFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const [typedText, setTypedText] = useState(value === null ? '' : String(value));

  const typedValue = parseNumberInput(typedText) ?? emptyValue;
  const shownText = Object.is(typedValue, value) ? typedText : value === null ? '' : String(value);

  const describedBy = [helpText ? helpId : null, errorMessage ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {helpText && <FieldHelpText id={helpId}>{helpText}</FieldHelpText>}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className="field-input max-w-xs"
        value={shownText}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(event) => {
          setTypedText(event.target.value);
          onChange(parseNumberInput(event.target.value) ?? emptyValue);
        }}
      />
      {errorMessage && (
        <p id={errorId} className="mt-1 text-sm font-medium text-red-800">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
