import { useState, type FormEvent } from 'react';
import { uiText } from '../copy/uiText';
import { EU_EEA_COUNTRIES } from '../data/euEeaCountries';
import { SelectField } from './SelectField';
import { TextInputField } from './TextInputField';

const text = uiText.waitlist;
const COUNTRY_OPTIONS = EU_EEA_COUNTRIES.map((country) => ({ value: country, label: country }));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

interface WaitlistEntry {
  name: string;
  email: string;
  company: string;
  country: string;
  wantsToTestPrototype: boolean;
  message: string;
}

const EMPTY_ENTRY: WaitlistEntry = {
  name: '',
  email: '',
  company: '',
  country: '',
  wantsToTestPrototype: false,
  message: '',
};

function findProblems(entry: WaitlistEntry): string[] {
  const problems: string[] = [];
  if (!entry.name.trim()) problems.push(text.requiredField(text.nameLabel));
  if (!entry.email.trim()) problems.push(text.requiredField(text.emailLabel));
  else if (!EMAIL_PATTERN.test(entry.email.trim())) problems.push(text.invalidEmail);
  if (!entry.company.trim()) problems.push(text.requiredField(text.companyLabel));
  if (!entry.country) problems.push(text.requiredField(text.countryLabel));
  return problems;
}

interface WaitlistFormProps {
  endpointUrl?: string;
}

export function WaitlistForm({
  endpointUrl = import.meta.env.VITE_WAITLIST_URL,
}: WaitlistFormProps) {
  const [entry, setEntry] = useState<WaitlistEntry>(EMPTY_ENTRY);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [problems, setProblems] = useState<string[]>([]);
  const isSetUp = Boolean(endpointUrl);

  const update = (changes: Partial<WaitlistEntry>) =>
    setEntry((current) => ({ ...current, ...changes }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpointUrl) return;
    const found = findProblems(entry);
    setProblems(found);
    if (found.length > 0) return;

    setStatus('sending');
    try {
      // text/plain keeps this a "simple" request, so Google Apps Script does not
      // need to answer a CORS preflight. The body is still JSON.
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...entry, submittedFrom: window.location.origin }),
      });
      if (!response.ok) throw new Error(`Waitlist answered ${response.status}`);
      setStatus('success');
      setEntry(EMPTY_ENTRY);
    } catch {
      setStatus('error');
    }
  }

  return (
    <section aria-labelledby="waitlist-heading" className="card">
      <h2 id="waitlist-heading" className="text-xl font-bold">
        {text.heading}
      </h2>
      <p className="mt-2 text-gray-700">{text.intro}</p>

      {!isSetUp && (
        <p role="status" className="mt-4 rounded-md border border-gray-300 bg-gray-50 p-3">
          {text.notSetUp}
        </p>
      )}

      {status === 'success' ? (
        <p
          role="status"
          className="mt-4 rounded-md border border-accent bg-accent-light p-3 font-medium"
        >
          {text.success}
        </p>
      ) : (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInputField
              label={text.nameLabel}
              value={entry.name}
              autoComplete="name"
              required
              onChange={(name) => update({ name })}
            />
            <TextInputField
              label={text.emailLabel}
              type="email"
              value={entry.email}
              autoComplete="email"
              required
              onChange={(email) => update({ email })}
            />
            <TextInputField
              label={text.companyLabel}
              value={entry.company}
              autoComplete="organization"
              required
              onChange={(company) => update({ company })}
            />
            <SelectField
              label={text.countryLabel}
              value={entry.country}
              options={COUNTRY_OPTIONS}
              required
              onChange={(country) => update({ country })}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={entry.wantsToTestPrototype}
              onChange={(event) => update({ wantsToTestPrototype: event.target.checked })}
            />
            {text.wantsToTestLabel}
          </label>
          <div>
            <label htmlFor="waitlist-message" className="field-label">
              {text.messageLabel}{' '}
              <span className="font-normal text-gray-700">{uiText.common.optional}</span>
            </label>
            <textarea
              id="waitlist-message"
              rows={3}
              className="field-input"
              value={entry.message}
              onChange={(event) => update({ message: event.target.value })}
            />
          </div>

          {problems.length > 0 && (
            <ul
              role="alert"
              className="list-disc rounded-md border border-red-300 bg-red-50 p-3 pl-8 text-sm text-red-900"
            >
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          )}
          {status === 'error' && (
            <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-red-900">
              {text.error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={!isSetUp || status === 'sending'}>
            {status === 'sending' ? text.sending : text.submit}
          </button>
        </form>
      )}
    </section>
  );
}
