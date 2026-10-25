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

// Reads what the user typed. Accepts "45,5" as well as "45.5". Empty → null. Rubbish → NaN.
export function parseNumberInput(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '') return null;
  if (!/^-?\d*\.?\d*$/.test(trimmed) || trimmed === '-' || trimmed === '.') return NaN;
  return Number(trimmed);
}
