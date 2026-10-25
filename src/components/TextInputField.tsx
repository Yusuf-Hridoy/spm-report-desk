import { useId, type InputHTMLAttributes } from 'react';
import { FieldHelpText } from './FieldHelpText';

interface TextInputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'id'
> {
  label: string;
  helpText?: string;
  value: string;
  onChange: (value: string) => void;
}

export function TextInputField({ label, helpText, value, onChange, ...rest }: TextInputFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {helpText && <FieldHelpText id={helpId}>{helpText}</FieldHelpText>}
      <input
        id={id}
        type="text"
        className="field-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={helpText ? helpId : undefined}
        {...rest}
      />
    </div>
  );
}
