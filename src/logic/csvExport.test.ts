import { describe, expect, it } from 'vitest';
import { EXAMPLE_COMPANY } from '../data/exampleCompany';
import { IUCLID_CSV_COLUMNS } from '../data/iuclidCsvColumns';
import { CSV_BOM, buildCsvFileName, buildReportCsv, escapeCsvCell } from './csvExport';

function csvLines(csv: string): string[] {
  return csv.replace(CSV_BOM, '').split('\r\n');
}

describe('csvExport', () => {
  it('starts with a UTF-8 BOM and the IUCLID header row', () => {
    const csv = buildReportCsv(EXAMPLE_COMPANY);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csvLines(csv)[0]).toBe(IUCLID_CSV_COLUMNS.join(','));
  });

  it('builds the exact expected CSV for the example company', () => {
    const expected =
      CSV_BOM +
      'Use,Derogation,Use name,Product category (PC),Sector of use (SU),Technical function (TF),' +
      'Site(s),Generic information on the identity of polymers,Estimated emission quantity,Unit,' +
      'Concentration range of SPM (Option A) or Option B\r\n' +
      'Other manufacture or use at industrial sites,' +
      '4(a) Use at industrial sites,' +
      'Formulation of water-based industrial wood coatings,' +
      '"PC9a Coatings and paints, thinners, paint removers",' +
      'SU10 Formulation of mixtures and/or re-packaging,' +
      'Binder / film former,' +
      '"Main plant (Bremen, Germany)",' +
      '3906 Acrylic polymers,' +
      '2.4354,' +
      't,' +
      'Option B\r\n';
    expect(buildReportCsv(EXAMPLE_COMPANY)).toBe(expected);
  });

  it('escapes commas and quotes inside text', () => {
    expect(escapeCsvCell('plain')).toBe('plain');
    expect(escapeCsvCell('a, b')).toBe('"a, b"');
    expect(escapeCsvCell('the "best" paint')).toBe('"the ""best"" paint"');

    const use = { ...EXAMPLE_COMPANY.uses[0], useName: 'Paint, "extra" strong' };
    const csv = buildReportCsv({ ...EXAMPLE_COMPANY, uses: [use] });
    expect(csvLines(csv)[1]).toContain(',"Paint, ""extra"" strong",');
  });

  it("puts a ' in front of text cells that start with = + - or @", () => {
    expect(escapeCsvCell('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)");
    expect(escapeCsvCell('+49 421 000')).toBe("'+49 421 000");
    expect(escapeCsvCell('-coating')).toBe("'-coating");
    expect(escapeCsvCell('@import')).toBe("'@import");
    expect(escapeCsvCell('=HYPERLINK("x", "y")')).toBe('"\'=HYPERLINK(""x"", ""y"")"');
    expect(escapeCsvCell('Paint = binder')).toBe('Paint = binder');

    const use = { ...EXAMPLE_COMPANY.uses[0], useName: '=1+1' };
    const csv = buildReportCsv({ ...EXAMPLE_COMPANY, uses: [use] });
    expect(csvLines(csv)[1]).toContain(",'=1+1,");
  });

  it("never puts a ' in front of number cells", () => {
    expect(escapeCsvCell('-5', 'number')).toBe('-5');
    expect(escapeCsvCell('2.4354', 'number')).toBe('2.4354');

    const csv = buildReportCsv(EXAMPLE_COMPANY);
    expect(csvLines(csv)[1]).toContain(',2.4354,t,');
  });

  it('joins multiple values with "; " and leaves hidden fields empty', () => {
    const use = {
      ...EXAMPLE_COMPANY.uses[0],
      useId: 'U6' as const,
      derogationIds: ['5a' as const, '5c' as const],
      sectorOfUseIds: [],
      siteIds: [],
      technicalFunctionIds: ['filler', 'binder_film_former'],
    };
    const cells = csvLines(buildReportCsv({ ...EXAMPLE_COMPANY, uses: [use] }))[1];
    expect(cells).toContain(
      '5(a) Contained by technical means; 5(c) Permanently built into a solid',
    );
    expect(cells).toContain(',,Binder / film former; Filler,,3906');
  });

  it('names the file after the company and year', () => {
    expect(buildCsvFileName('Nordlicht Beschichtungen GmbH', 2026)).toBe(
      'spm-report-nordlicht-beschichtungen-gmbh-2026.csv',
    );
    expect(buildCsvFileName('Müller & Söhne Straße', 2026)).toBe(
      'spm-report-muller-sohne-strasse-2026.csv',
    );
    expect(buildCsvFileName('', 2026)).toBe('spm-report-company-2026.csv');
  });
});
