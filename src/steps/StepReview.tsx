import { StepHeading } from '../components/StepHeading';
import { WaitlistForm } from '../components/WaitlistForm';
import { uiText } from '../copy/uiText';
import { buildCsvFileName, buildReportCsv, buildReportRow } from '../logic/csvExport';
import { useReport } from '../state/ReportContext';

const text = uiText.stepReview;

function downloadTextFile(content: string, fileName: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function StepReview() {
  const { state } = useReport();
  const rows = state.uses.map((use) => ({ id: use.id, row: buildReportRow(use, state) }));
  const cell = (value: string) => value || text.notApplicable;

  function downloadCsv() {
    downloadTextFile(
      buildReportCsv(state),
      buildCsvFileName(state.companyName, state.reportingYear),
      'text/csv;charset=utf-8',
    );
  }

  return (
    <section aria-labelledby="step-heading">
      <StepHeading title={text.heading} intro={text.intro} />

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
          <caption className="sr-only">{text.tableCaption}</caption>
          <thead className="bg-gray-50">
            <tr>
              {text.columns.map((column) => (
                <th key={column} scope="col" className="border-b border-gray-300 p-2 align-bottom">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, row }) => (
              <tr key={id} className="border-b border-gray-200 align-top last:border-0">
                <td className="p-2">{cell(row.use)}</td>
                <td className="p-2">{cell(row.derogation)}</td>
                <td className="p-2">{cell(row.useName)}</td>
                <td className="p-2">{cell(row.productCategory)}</td>
                <td className="p-2">{cell(row.sectorOfUse)}</td>
                <td className="p-2">{cell(row.technicalFunction)}</td>
                <td className="p-2">{cell(row.sites)}</td>
                <td className="p-2">{cell(row.polymers)}</td>
                <td className="p-2 font-semibold whitespace-nowrap" data-testid="review-emission">
                  {row.emissionValue
                    ? `${row.emissionValue} ${row.emissionUnit}`
                    : text.notApplicable}
                </td>
                <td className="p-2">{cell(row.concentration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={downloadCsv}>
          {text.downloadCsv}
        </button>
        <button type="button" className="btn-secondary" onClick={() => window.print()}>
          {text.printRecord}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-700">{text.csvNote}</p>

      <div className="mt-12">
        <WaitlistForm />
      </div>
    </section>
  );
}
