import { uiText } from '../copy/uiText';
import { formatNumber } from '../logic/numberFormatting';
import type { CalculationStep } from '../types/reportTypes';

function formatStepValue(step: CalculationStep): string {
  return `${formatNumber(step.value, step.unit === 'kg' ? 2 : 4)} ${step.unit}`;
}

export function CalculationStepsTable({ steps }: { steps: CalculationStep[] }) {
  const text = uiText.calculationTable;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{text.caption}</caption>
        <thead>
          <tr className="border-b border-gray-300">
            <th scope="col" className="py-2 pr-3 font-semibold">
              {text.stepColumn}
            </th>
            <th scope="col" className="py-2 pr-3 font-semibold">
              {text.formulaColumn}
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              {text.valueColumn}
            </th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, index) => (
            <tr key={`${step.label}-${index}`} className="border-b border-gray-200 align-top">
              <th scope="row" className="py-2 pr-3 font-medium">
                {step.label}
              </th>
              <td className="py-2 pr-3 text-gray-700">{step.formula}</td>
              <td className="py-2 text-right whitespace-nowrap tabular-nums">
                {formatStepValue(step)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
