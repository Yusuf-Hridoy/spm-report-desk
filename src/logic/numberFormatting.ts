// Number helpers shared by the calculator, the review table and the CSV export.

// Removes floating point noise like 2.4354000000000002 before rounding or showing a number.
function cleanFloat(value: number): number {
  return Number(value.toPrecision(15));
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(cleanFloat(value) * factor) / factor;
}

// Human-friendly number with thousands separators, e.g. 2435.4 → "2,435.4".
export function formatNumber(value: number, maxDecimals = 4): string {
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: maxDecimals,
  }).format(roundTo(value, maxDecimals));
}

// Machine-friendly number for files: dot decimal, no separators, e.g. "2.4354".
export function formatPlainNumber(value: number, maxDecimals = 4): string {
  return String(roundTo(value, maxDecimals));
}

// "45", "45.5", ".5", and "45." while the user is still typing.
const PLAIN_NUMBER = /^-?(\d+\.?\d*|\.\d+)$/;
// Comma as thousands separator: "1,200", "1,200.5", "1,234,567".
const THOUSANDS_GROUPED = /^-?\d{1,3}(,\d{3})+(\.\d*)?$/;
// One comma, no dot: "45,5", "0,25", ",5".
const SINGLE_COMMA_NO_DOT = /^-?(\d+,\d*|,\d+)$/;

// Reads what the user typed. Empty → null. Anything unclear → NaN, so the form asks
// the user to check the number instead of guessing.
// A comma is a decimal sign only with exactly one comma, no dot, and NOT exactly
// 3 digits after it. "1,200" is read as 1200, never as 1.2.
export function parseNumberInput(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  if (PLAIN_NUMBER.test(trimmed)) return Number(trimmed);
  if (THOUSANDS_GROUPED.test(trimmed)) return Number(trimmed.replace(/,/g, ''));
  if (SINGLE_COMMA_NO_DOT.test(trimmed) && trimmed.split(',')[1].length !== 3) {
    return Number(trimmed.replace(',', '.'));
  }
  return NaN;
}
