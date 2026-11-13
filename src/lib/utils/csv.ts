/**
 * Spreadsheet formula-injection protection: values beginning with = + - @
 * (or tab/CR) are prefixed with an apostrophe so Excel/Sheets treat them as text.
 */
export function spreadsheetSafe(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}

export function csvCell(value: unknown): string {
  const s = spreadsheetSafe(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: unknown[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}
