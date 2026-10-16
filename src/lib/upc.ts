/** GS1 check digit for the first 11 digits of a UPC-A code. */
export function upcCheckDigit(first11: string): number {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += Number(first11[i]) * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}

export type UpcResult =
  | { ok: true; code: string; addedCheckDigit: boolean }
  | { ok: false; error: string };

/**
 * Accepts 11 digits (check digit is calculated) or 12 digits (check digit is
 * verified). Spaces and dashes are ignored.
 */
export function parseUpcA(input: string): UpcResult {
  const digits = input.replace(/[\s-]/g, "");

  if (!/^\d*$/.test(digits)) return { ok: false, error: "Use digits only." };

  if (digits.length === 11) {
    return { ok: true, code: digits + upcCheckDigit(digits), addedCheckDigit: true };
  }

  if (digits.length === 12) {
    const expected = upcCheckDigit(digits);
    if (Number(digits[11]) !== expected) {
      return { ok: false, error: `The last digit should be ${expected}.` };
    }
    return { ok: true, code: digits, addedCheckDigit: false };
  }

  return { ok: false, error: "A UPC-A code is 11 or 12 digits." };
}

/**
 * Best-effort cleanup of a barcode from a spreadsheet. Excel stores UPCs as
 * numbers, which drops leading zeros, so short codes are re-padded when that
 * yields a valid check digit. Returns the digits unchanged if nothing fits.
 */
export function normalizeUpcA(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const padded = digits.padStart(12, "0");
  if (digits.length <= 12 && parseUpcA(padded).ok) return padded;
  if (digits.length === 11) return digits + upcCheckDigit(digits);
  return digits;
}
