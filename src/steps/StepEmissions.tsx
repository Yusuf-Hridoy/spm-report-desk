import { CalculationStepsTable } from '../components/CalculationStepsTable';
import { CardHeading } from '../components/CardHeading';
import { NumberInputField } from '../components/NumberInputField';
import { RadioCardGroupField } from '../components/RadioCardGroupField';
import { SelectField } from '../components/SelectField';
import { StepHeading } from '../components/StepHeading';
import { UnverifiedValueBadge } from '../components/UnverifiedValueBadge';
import { uiText } from '../copy/uiText';
import {
  DEFAULT_RELEASE_FACTOR_PRESETS,
  findReleaseFactorPreset,
} from '../data/defaultReleaseFactors';
import { OPTION_A_CONCENTRATION_RANGES } from '../data/optionAConcentrationRanges';
import { tryCalculateEmission } from '../logic/emissionCalculator';
import { formatNumber } from '../logic/numberFormatting';
import { useReport } from '../state/ReportContext';
import { setEmissionField } from '../state/reportReducer';
import type {
  EmissionInput,
  MaterialForm,
  OptionARangeId,
  ReleaseFactors,
  ReleaseMethod,
  ReportingOption,
  UseRow,
} from '../types/reportTypes';

const text = uiText.stepEmissions;

const FORM_OPTIONS = [
  { value: 'solid', label: text.formSolid },
  { value: 'dispersion', label: text.formDispersion },
] as const;
const REPORTING_OPTIONS = [
  { value: 'B', label: text.optionB, helpText: text.optionBHelp },
  { value: 'A', label: text.optionA, helpText: text.optionAHelp },
] as const;
const METHOD_OPTIONS = [
  { value: 'preset', label: text.methodPreset, helpText: text.methodPresetHelp },
  { value: 'custom', label: text.methodCustom, helpText: text.methodCustomHelp },
  { value: 'measured', label: text.methodMeasured, helpText: text.methodMeasuredHelp },
] as const;
const RANGE_OPTIONS = OPTION_A_CONCENTRATION_RANGES.map((range) => ({
  value: range.id,
  label: range.label,
}));
const PRESET_OPTIONS = DEFAULT_RELEASE_FACTOR_PRESETS.map((preset) => ({
  value: preset.id,
  label: preset.label,
}));

function EmissionPanel({ use, index }: { use: UseRow; index: number }) {
  const { dispatch } = useReport();
  const input = use.emission;
  const { result, issues } = tryCalculateEmission(input);
  const preset = input.presetFactorId ? findReleaseFactorPreset(input.presetFactorId) : undefined;

  function set<K extends keyof EmissionInput>(field: K, value: EmissionInput[K]) {
    dispatch(setEmissionField(use.id, field, value));
  }

  function setCustomFactor(key: keyof ReleaseFactors, value: number | null) {
    const current = input.customFactors ?? { airPercent: 0, waterPercent: 0, soilPercent: 0 };
    set('customFactors', { ...current, [key]: value ?? 0 });
  }

  return (
    <li className="card">
      <CardHeading>
        {uiText.common.useCardTitle(index)}: {use.useName || uiText.common.unnamedUse}
      </CardHeading>

      <div className="mt-4 space-y-6">
        <NumberInputField
          label={text.materialLabel}
          helpText={text.materialHelp}
          value={input.materialTonnesPerYear}
          onChange={(value) => set('materialTonnesPerYear', value)}
        />

        <RadioCardGroupField<MaterialForm>
          legend={text.formLegend}
          options={FORM_OPTIONS}
          value={input.form}
          columns={2}
          onChange={(value) => set('form', value)}
        />

        {input.form === 'dispersion' && (
          <NumberInputField
            label={text.solidsLabel}
            helpText={text.solidsHelp}
            value={input.solidsPercent}
            onChange={(value) => set('solidsPercent', value)}
          />
        )}

        <RadioCardGroupField<ReportingOption>
          legend={text.optionLegend}
          options={REPORTING_OPTIONS}
          value={input.reportingOption}
          columns={2}
          onChange={(value) => set('reportingOption', value)}
        />

        {input.reportingOption === 'B' ? (
          <NumberInputField
            label={text.knownSpmLabel}
            helpText={text.knownSpmHelp}
            value={input.knownSpmPercent}
            onChange={(value) => set('knownSpmPercent', value)}
          />
        ) : (
          <SelectField
            label={text.rangeLabel}
            helpText={text.rangeHelp}
            value={input.optionARangeId ?? ''}
            options={RANGE_OPTIONS}
            onChange={(value) => set('optionARangeId', (value || null) as OptionARangeId | null)}
          />
        )}

        <RadioCardGroupField<ReleaseMethod>
          legend={text.methodLegend}
          options={METHOD_OPTIONS}
          value={input.releaseMethod}
          columns={3}
          onChange={(value) => set('releaseMethod', value)}
        />

        {input.releaseMethod === 'measured' && (
          <NumberInputField
            label={text.measuredLabel}
            helpText={text.measuredHelp}
            value={input.measuredEmissionKg}
            onChange={(value) => set('measuredEmissionKg', value)}
          />
        )}

        {input.releaseMethod === 'preset' && (
          <div className="space-y-2">
            <SelectField
              label={text.presetLabel}
              value={input.presetFactorId ?? ''}
              options={PRESET_OPTIONS}
              onChange={(value) => set('presetFactorId', value || null)}
            />
            {preset && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                <span>
                  {text.presetFactors(
                    formatNumber(preset.airPercent),
                    formatNumber(preset.waterPercent),
                    formatNumber(preset.soilPercent),
                  )}
                </span>
                {!preset.verified && <UnverifiedValueBadge />}
                <span className="basis-full">{text.presetSource(preset.source)}</span>
              </div>
            )}
          </div>
        )}

        {input.releaseMethod === 'custom' && (
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberInputField
              label={text.customAirLabel}
              value={input.customFactors?.airPercent ?? 0}
              emptyValue={0}
              onChange={(value) => setCustomFactor('airPercent', value)}
            />
            <NumberInputField
              label={text.customWaterLabel}
              value={input.customFactors?.waterPercent ?? 0}
              emptyValue={0}
              onChange={(value) => setCustomFactor('waterPercent', value)}
            />
            <NumberInputField
              label={text.customSoilLabel}
              value={input.customFactors?.soilPercent ?? 0}
              emptyValue={0}
              onChange={(value) => setCustomFactor('soilPercent', value)}
            />
          </div>
        )}

        {input.releaseMethod !== 'measured' && (
          <NumberInputField
            label={text.mitigationLabel}
            helpText={text.mitigationHelp}
            value={input.waterMitigationPercent}
            emptyValue={0}
            onChange={(value) => set('waterMitigationPercent', value ?? 0)}
          />
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <NumberInputField
            label={text.transportLabel}
            helpText={text.transportHelp}
            value={input.transportLossKg}
            emptyValue={0}
            onChange={(value) => set('transportLossKg', value ?? 0)}
          />
          <NumberInputField
            label={text.spillsLabel}
            helpText={text.spillsHelp}
            value={input.unrecoveredSpillsKg}
            emptyValue={0}
            onChange={(value) => set('unrecoveredSpillsKg', value ?? 0)}
          />
        </div>
      </div>

      <div
        className="mt-8 rounded-lg border-2 border-accent bg-accent-light p-4 sm:p-6"
        aria-live="polite"
      >
        <h4 className="font-semibold">{text.resultHeading}</h4>
        {result ? (
          <>
            <p
              className="mt-1 text-4xl font-bold text-accent tabular-nums"
              data-testid="emission-result"
            >
              {formatNumber(result.displayValue, result.displayUnit === 't' ? 4 : 2)}{' '}
              {result.displayUnit}
            </p>
            {result.totalKg === 0 && <p className="mt-1 text-sm">{text.zeroNote}</p>}
          </>
        ) : (
          <>
            <p className="mt-1">{text.resultMissing}</p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {issues.map((issue) => (
                <li key={issue.field}>{issue.message}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {result && result.warnings.length > 0 && (
        <div className="mt-4 rounded-md border border-amber-400 bg-amber-50 p-4" role="note">
          <p className="font-semibold text-amber-950">{text.warningsHeading}</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-amber-950">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h4 className="mb-2 font-semibold">{text.stepsHeading}</h4>
          <CalculationStepsTable steps={result.steps} />
        </div>
      )}
    </li>
  );
}

export function StepEmissions() {
  const { state } = useReport();
  return (
    <section aria-labelledby="step-heading">
      <StepHeading title={text.heading} intro={text.intro} />
      <ul className="mt-6 space-y-6">
        {state.uses.map((use, index) => (
          <EmissionPanel key={use.id} use={use} index={index} />
        ))}
      </ul>
    </section>
  );
}
