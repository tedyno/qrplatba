import { Account } from '../index';

const country: string = 'CZ';
// 'CZ' encoded for the IBAN mod-97 check: C -> 12, Z -> 35.
const countryCode: string = '1235';

/**
 * Computes the two IBAN check digits using the ISO 7064 MOD 97-10 scheme,
 * so that the full number (BBAN + country code + check digits) ≡ 1 (mod 97).
 */
export const calculateCheckDigits = (account: Account): string => {
  const payload = [account.bankCode, account.prefix, account.number, countryCode].join('');

  let remainder = 0;
  for (const char of payload) {
    remainder = (remainder * 10 + (char.charCodeAt(0) - 48)) % 97;
  }

  const checkDigits = 98 - ((remainder * 100) % 97);

  return checkDigits.toString().padStart(2, '0');
};

/**
 * Builds the IBAN from a normalized (zero-padded) Account. Callers must pass
 * an account that went through parsing/padding first — unpadded fields would
 * silently produce a malformed IBAN. The public entry point that accepts any
 * input is `getIban` in QRPayment.ts.
 */
export const normalizedAccountToIban = (account: Account): string => {
  const checkDigits = calculateCheckDigits(account);

  return [country, checkDigits, account.bankCode, account.prefix, account.number].join('');
};
