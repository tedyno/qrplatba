import { Account } from '../index';

export const bankAccountBankCodePattern = /^\d{3,4}$/;
export const bankAccountNumberPattern = /^\d{2,10}$/;
export const bankAccountPrefixPattern = /^\d{0,6}$/;
export const bankAccountStringPattern = /^(?:(\d{1,6})-)?(\d{2,10})\/(\d{3,4})$/;
export const dateYYYYMMDDPattern = /^(\d{4})(\d{2})(\d{2})$/;
export const currencyPattern = /^[A-Z]{3}$/;
// Czech IBAN: CZ + 2 check digits + 4-digit bank code + 6-digit prefix + 10-digit number.
export const czechIbanPattern = /^CZ\d{22}$/;

export const isNumeric = (value: string): boolean => /^\d+$/.test(value);

// The ČNB mod-11 weights (2^i mod 11), applied right-aligned to the digits,
// so leading-zero padding does not change the result.
const mod11Weights = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];

const hasValidMod11Checksum = (digits: string): boolean => {
  const offset = mod11Weights.length - digits.length;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += Number(digits[i]) * mod11Weights[offset + i];
  }

  return sum % 11 === 0;
};

const countNonZeroDigits = (digits: string): number => digits.replace(/0/g, '').length;

/**
 * Verifies a normalized (zero-padded) Czech account per ČNB vyhláška
 * č. 169/2011 Sb.: both the prefix and the account number must pass the
 * mod-11 checksum, and the number must contain at least two non-zero digits
 * (an all-zero number would trivially satisfy the checksum).
 */
export const normalizedAccountHasValidChecksum = (account: Account): boolean =>
  hasValidMod11Checksum(account.prefix) &&
  hasValidMod11Checksum(account.number) &&
  countNonZeroDigits(account.number) >= 2;

/**
 * Validates a due date in the SPAYD `DT` format (YYYYMMDD) and rejects
 * impossible calendar dates such as 20230231.
 */
export const isYYYYMMDDDate = (date: string): boolean => {
  const match = dateYYYYMMDDPattern.exec(date);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};
