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

export const getIban = (account: Account): string => {
  const checkDigits = calculateCheckDigits(account);

  return [country, checkDigits, account.bankCode, account.prefix, account.number].join('');
};
