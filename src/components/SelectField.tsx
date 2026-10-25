import { useId } from 'react';
import { uiText } from '../copy/uiText';
import { FieldHelpText } from './FieldHelpText';

interface SelectFieldProps {
  label: string;
  helpText?: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
}

export function SelectField({
  label,
  helpText,
  value,
  options,
  onChange,
  required,
}: SelectFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {helpText && <FieldHelpText id={helpId}>{helpText}</FieldHelpText>}
      <select
        id={id}
        className="field-input"
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={helpText ? helpId : undefined}
      >
        <option value="">{uiText.common.selectPlaceholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
