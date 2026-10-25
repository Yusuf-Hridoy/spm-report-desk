// Builds the report table rows and the CSV file for IUCLID import.

import { findDerogation } from '../data/derogations';
import { IUCLID_CSV_COLUMNS } from '../data/iuclidCsvColumns';
import { OTHER_POLYMER_HS_CODE, POLYMER_HS_CODES } from '../data/polymerHsCodes';
import { OTHER_PRODUCT_CATEGORY_ID, PRODUCT_CATEGORIES } from '../data/productCategories';
import { findReportingUse } from '../data/reportingUses';
import { SECTORS_OF_USE } from '../data/sectorsOfUse';
import { TECHNICAL_FUNCTIONS } from '../data/technicalFunctions';
import type { ReportState, UseRow } from '../types/reportTypes';
import { concentrationColumnValue, tryCalculateEmission } from './emissionCalculator';
import { requiresSites, showsProductCategory, showsSectorOfUse } from './fieldApplicabilityRules';
import { formatPlainNumber } from './numberFormatting';

export const CSV_BOM = '﻿';
const MULTI_VALUE_SEPARATOR = '; ';
const LINE_BREAK = '\r\n';

// One row of the report table. Not-applicable fields are empty strings.
export interface ReportRow {
  use: string;
  derogation: string;
  useName: string;
  productCategory: string;
  sectorOfUse: string;
  technicalFunction: string;
  sites: string;
  polymers: string;
  emissionValue: string;
  emissionUnit: string;
  concentration: string;
}

function join(values: string[]): string {
  return values.join(MULTI_VALUE_SEPARATOR);
}

function withOtherText(code: string, label: string, otherCode: string, otherText: string): string {
  return code === otherCode ? `${code} ${label}: ${otherText.trim()}` : `${code} ${label}`;
}

export function buildReportRow(use: UseRow, state: ReportState): ReportRow {
  const useId = use.useId;
  const { result } = tryCalculateEmission(use.emission);

  const productCategory =
    useId && showsProductCategory(useId)
      ? join(
          PRODUCT_CATEGORIES.filter((pc) => use.productCategoryIds.includes(pc.id)).map((pc) =>
            withOtherText(pc.id, pc.label, OTHER_PRODUCT_CATEGORY_ID, use.productCategoryOtherText),
          ),
        )
      : '';

  const sectorOfUse =
    useId && showsSectorOfUse(useId)
      ? join(
          SECTORS_OF_USE.filter((su) => use.sectorOfUseIds.includes(su.id)).map(
            (su) => `${su.id} ${su.label}`,
          ),
        )
      : '';

  const sites =
    useId && requiresSites(useId)
      ? join(
          state.sites
            .filter((site) => use.siteIds.includes(site.id))
            .map((site) => `${site.name} (${site.city}, ${site.country})`),
        )
      : '';

  return {
    use: useId ? findReportingUse(useId).label : '',
    derogation: join(use.derogationIds.map((id) => findDerogation(id).label)),
    useName: use.useName.trim(),
    productCategory,
    sectorOfUse,
    technicalFunction: join(
      TECHNICAL_FUNCTIONS.filter((tf) => use.technicalFunctionIds.includes(tf.id)).map(
        (tf) => tf.label,
      ),
    ),
    sites,
    polymers: join(
      POLYMER_HS_CODES.filter((hs) => use.polymerHsCodes.includes(hs.code)).map((hs) =>
        withOtherText(hs.code, hs.label, OTHER_POLYMER_HS_CODE, use.polymerOtherText),
      ),
    ),
    emissionValue: result
      ? formatPlainNumber(result.displayValue, result.displayUnit === 't' ? 4 : 2)
      : '',
    emissionUnit: result ? result.displayUnit : '',
    concentration: concentrationColumnValue(use.emission),
  };
}

// Quotes a cell when it holds a comma, quote or line break. Quotes inside are doubled.
export function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function rowToCsvCells(row: ReportRow): string[] {
  // Order must match IUCLID_CSV_COLUMNS.
  return [
    row.use,
    row.derogation,
    row.useName,
    row.productCategory,
    row.sectorOfUse,
    row.technicalFunction,
    row.sites,
    row.polymers,
    row.emissionValue,
    row.emissionUnit,
    row.concentration,
  ];
}

// UTF-8 with BOM so Excel shows umlauts correctly. CRLF line breaks.
export function buildReportCsv(state: ReportState): string {
  const lines = [
    [...IUCLID_CSV_COLUMNS],
    ...state.uses.map((use) => rowToCsvCells(buildReportRow(use, state))),
  ].map((cells) => cells.map(escapeCsvCell).join(','));
  return CSV_BOM + lines.join(LINE_BREAK) + LINE_BREAK;
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildCsvFileName(companyName: string, year: number): string {
  return `spm-report-${slugify(companyName) || 'company'}-${year}.csv`;
}
