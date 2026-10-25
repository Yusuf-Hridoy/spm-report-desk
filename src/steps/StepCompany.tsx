import { useId } from 'react';
import { CardHeading } from '../components/CardHeading';
import { FieldHelpText } from '../components/FieldHelpText';
import { RadioCardGroupField } from '../components/RadioCardGroupField';
import { SelectField } from '../components/SelectField';
import { StepHeading } from '../components/StepHeading';
import { TextInputField } from '../components/TextInputField';
import { uiText } from '../copy/uiText';
import { EU_EEA_COUNTRIES } from '../data/euEeaCountries';
import { useReport } from '../state/ReportContext';
import type { CompanyRole, ReportState } from '../types/reportTypes';

const text = uiText.stepCompany;
const COUNTRY_OPTIONS = EU_EEA_COUNTRIES.map((country) => ({ value: country, label: country }));
const ROLE_OPTIONS = [
  { value: 'industrial', label: text.roleIndustrialTitle, helpText: text.roleIndustrialHelp },
  { value: 'supplier', label: text.roleSupplierTitle, helpText: text.roleSupplierHelp },
] as const;

function hasAnyAnswers(state: ReportState): boolean {
  return Boolean(
    state.companyName ||
    state.companyCountry ||
    state.role ||
    state.sites.length ||
    state.uses.length,
  );
}

export function StepCompany() {
  const { state, dispatch } = useReport();
  const yearId = useId();

  function loadExample() {
    if (hasAnyAnswers(state) && !window.confirm(text.loadExampleConfirm)) return;
    dispatch({ type: 'LOAD_EXAMPLE' });
  }

  function startOver() {
    if (!window.confirm(text.startOverConfirm)) return;
    dispatch({ type: 'RESET' });
  }

  return (
    <section aria-labelledby="step-heading">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <StepHeading title={text.heading} intro={text.intro} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={loadExample}>
            {text.loadExample}
          </button>
          <button type="button" className="btn-quiet" onClick={startOver}>
            {text.startOver}
          </button>
        </div>
      </div>

      {state.notice && (
        <div role="status" className="mb-6 rounded-md border border-accent bg-accent-light p-4">
          <p>{state.notice}</p>
          <button
            type="button"
            className="btn-quiet mt-2 px-0"
            onClick={() => dispatch({ type: 'DISMISS_NOTICE' })}
          >
            {uiText.notice.dismiss}
          </button>
        </div>
      )}

      <div className="card space-y-6">
        <TextInputField
          label={text.companyNameLabel}
          helpText={text.companyNameHelp}
          value={state.companyName}
          autoComplete="organization"
          required
          onChange={(value) => dispatch({ type: 'SET_COMPANY_FIELD', field: 'companyName', value })}
        />
        <SelectField
          label={text.countryLabel}
          helpText={text.countryHelp}
          value={state.companyCountry}
          options={COUNTRY_OPTIONS}
          required
          onChange={(value) =>
            dispatch({ type: 'SET_COMPANY_FIELD', field: 'companyCountry', value })
          }
        />
        <div>
          <label htmlFor={yearId} className="field-label">
            {text.reportingYearLabel}
          </label>
          <FieldHelpText id={`${yearId}-help`}>
            {text.reportingYearNote(state.reportingYear)}
          </FieldHelpText>
          <input
            id={yearId}
            className="field-input max-w-32 bg-gray-100"
            value={state.reportingYear}
            readOnly
            aria-describedby={`${yearId}-help`}
          />
        </div>
        <RadioCardGroupField<CompanyRole>
          legend={text.roleLegend}
          options={ROLE_OPTIONS}
          value={state.role}
          columns={2}
          onChange={(role) => dispatch({ type: 'SET_ROLE', role })}
        />
      </div>

      {state.role === 'industrial' && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">{text.sitesHeading}</h3>
          <p className="mt-1 text-gray-700">{text.sitesIntro}</p>
          <ul className="mt-4 space-y-4">
            {state.sites.map((site, index) => (
              <li key={site.id} className="card">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <CardHeading>{text.siteCardTitle(index)}</CardHeading>
                  <button
                    type="button"
                    className="btn-quiet"
                    onClick={() => dispatch({ type: 'REMOVE_SITE', id: site.id })}
                  >
                    {text.removeSite}
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextInputField
                    label={text.siteNameLabel}
                    helpText={text.siteNameHelp}
                    value={site.name}
                    onChange={(name) =>
                      dispatch({ type: 'UPDATE_SITE', id: site.id, changes: { name } })
                    }
                  />
                  <TextInputField
                    label={text.siteCityLabel}
                    value={site.city}
                    onChange={(city) =>
                      dispatch({ type: 'UPDATE_SITE', id: site.id, changes: { city } })
                    }
                  />
                  <SelectField
                    label={text.siteCountryLabel}
                    value={site.country}
                    options={COUNTRY_OPTIONS}
                    onChange={(country) =>
                      dispatch({ type: 'UPDATE_SITE', id: site.id, changes: { country } })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() => dispatch({ type: 'ADD_SITE', id: crypto.randomUUID() })}
          >
            {text.addSite}
          </button>
        </div>
      )}
    </section>
  );
}
