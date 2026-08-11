import { Account } from '../index';
import { bankAccountStringPattern } from './validators';
import { ValidationError } from './ValidationError';

/**
 * Percent-encodes the `%` and `*` characters so a value cannot break the
 * `*`-delimited SPAYD structure. Other characters (including diacritics and
 * URL punctuation such as `:` or `/`) are left intact.
 */
export const percentEncode = (value: string): string =>
  value.replace(/%/g, '%25').replace(/\*/g, '%2A');

export const transformPrefix = (prefix: string): string => {
  return prefix.padStart(6, '0');
};

export const transformNumber = (number: string): string => {
  return number.padStart(10, '0');
};

export const transformBankCode = (bankCode: string): string => {
  return bankCode.padStart(4, '0');
};

export const transformBankAccountString = (bankAccount: string): Account => {
  const matches = bankAccount.match(bankAccountStringPattern);

  if (!matches) {
    throw new ValidationError('Bank account string is invalid');
  }

  return {
    prefix: transformPrefix(matches[1] || ''),
    number: transformNumber(matches[2]),
    bankCode: transformBankCode(matches[3]),
  };
};

/**
 * Splits a normalized Czech IBAN (`CZ` + 22 digits) into its BBAN parts.
 * The parts are already zero-padded in the IBAN, so no further padding is needed.
 */
export const transformIbanString = (iban: string): Account => ({
  prefix: iban.slice(8, 14),
  number: iban.slice(14, 24),
  bankCode: iban.slice(4, 8),
});
