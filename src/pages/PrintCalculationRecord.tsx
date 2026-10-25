import type { ReactNode } from 'react';
import { CalculationStepsTable } from '../components/CalculationStepsTable';
import { UnverifiedValueBadge } from '../components/UnverifiedValueBadge';
import { uiText } from '../copy/uiText';
import { findReleaseFactorPreset } from '../data/defaultReleaseFactors';
import { findOptionARange } from '../data/optionAConcentrationRanges';
import { findReportingUse } from '../data/reportingUses';
import { tryCalculateEmission } from '../logic/emissionCalculator';
import { formatNumber } from '../logic/numberFormatting';
import { useReport } from '../state/ReportContext';
import type { EmissionInput, UseRow } from '../types/reportTypes';

const text = uiText.printRecord;
const labels = text.inputLabels;

function inputRows(use: UseRow): [string, ReactNode][] {
  const input: EmissionInput = use.emission;
  const amount = (value: number | null, unit: string) =>
    value === null ? '—' : `${formatNumber(value)} ${unit}`;
  const rows: [string, ReactNode][] = [
    [labels.use, use.useId ? findReportingUse(use.useId).label : '—'],
    [labels.material, amount(input.materialTonnesPerYear, 't')],
    [labels.form, text.formValues[input.form]],
  ];
  if (input.form === 'dispersion') rows.push([labels.solids, amount(input.solidsPercent, '%')]);
  rows.push([labels.reportingOption, text.optionValues[input.reportingOption]]);
  if (input.reportingOption === 'B')
    rows.push([labels.knownSpm, amount(input.knownSpmPercent, '%')]);
  else
    rows.push([
      labels.range,
      input.optionARangeId ? findOptionARange(input.optionARangeId).label : '—',
    ]);
  rows.push([labels.method, text.methodValues[input.releaseMethod]]);
  if (input.releaseMethod === 'measured') {
    rows.push([labels.measured, amount(input.measuredEmissionKg, 'kg')]);
  } else if (input.releaseMethod === 'preset') {
    const preset = input.presetFactorId ? findReleaseFactorPreset(input.presetFactorId) : undefined;
    rows.push([
      labels.preset,
      preset ? (
        <>
          {preset.label} (
          {uiText.stepEmissions.presetFactors(
            formatNumber(preset.airPercent),
            formatNumber(preset.waterPercent),
            formatNumber(preset.soilPercent),
          )}
          ) {!preset.verified && <UnverifiedValueBadge />}
        </>
      ) : (
        '—'
      ),
    ]);
  } else if (input.customFactors) {
    rows.push([
      labels.customFactors,
      uiText.stepEmissions.presetFactors(
        formatNumber(input.customFactors.airPercent),
        formatNumber(input.customFactors.waterPercent),
        formatNumber(input.customFactors.soilPercent),
      ),
    ]);
  }
  if (input.releaseMethod !== 'measured') {
    rows.push([labels.mitigation, amount(input.waterMitigationPercent, '%')]);
  }
  rows.push(
    [labels.transport, amount(input.transportLossKg, 'kg')],
    [labels.spills, amount(input.unrecoveredSpillsKg, 'kg')],
  );
  return rows;
}

export function PrintCalculationRecord() {
  const { state } = useReport();
  const created = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date());

  return (
    <article className="text-gray-900">
      <h1 className="text-2xl font-bold">{text.title}</h1>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
        <dt className="font-semibold">{text.company}</dt>
        <dd>{state.companyName || '—'}</dd>
        <dt className="font-semibold">{text.country}</dt>
        <dd>{state.companyCountry || '—'}</dd>
        <dt className="font-semibold">{text.year}</dt>
        <dd>{state.reportingYear}</dd>
        <dt className="font-semibold">{text.created}</dt>
        <dd>{created}</dd>
      </dl>

      {state.uses.map((use, index) => {
        const { result } = tryCalculateEmission(use.emission);
        return (
          <section key={use.id} className="mt-8 border-t border-gray-400 pt-4">
            <h2 className="text-xl font-bold">
              {uiText.common.useCardTitle(index)}: {use.useName || uiText.common.unnamedUse}
            </h2>

            <h3 className="mt-4 font-semibold">{text.inputsHeading}</h3>
            <dl className="mt-2 grid grid-cols-[minmax(10rem,auto)_1fr] gap-x-6 gap-y-1 text-sm">
              {inputRows(use).map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-gray-700">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {result ? (
              <>
                <h3 className="mt-4 font-semibold">{text.stepsHeading}</h3>
                <div className="mt-2">
                  <CalculationStepsTable steps={result.steps} />
                </div>
                <p className="print-keep-together mt-4 text-lg">
                  <span className="font-semibold">{text.totalHeading}: </span>
                  {formatNumber(result.displayValue, result.displayUnit === 't' ? 4 : 2)}{' '}
                  {result.displayUnit}
                </p>
                {result.warnings.length > 0 && (
                  <div className="print-keep-together mt-2">
                    <h3 className="font-semibold">{text.warningsHeading}</h3>
                    <ul className="list-disc pl-5 text-sm">
                      {result.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-4">{text.noResult}</p>
            )}
          </section>
        );
      })}

      <footer className="mt-10 border-t border-gray-400 pt-3 text-sm">{text.footer}</footer>
    </article>
  );
}
