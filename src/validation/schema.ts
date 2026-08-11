import { Account, BankAccountInput, Payment, PaymentOptions, PaymentOptionsInput } from '../index';
import {
  bankAccountBankCodePattern,
  bankAccountNumberPattern,
  bankAccountPrefixPattern,
  bankAccountStringPattern,
  currencyPattern,
  czechIbanPattern,
  isNumeric,
  isYYYYMMDDDate,
} from './validators';
import {
  percentEncode,
  transformBankAccountString,
  transformBankCode,
  transformIbanString,
  transformNumber,
  transformPrefix,
} from './transformators';
import { ValidationError } from './ValidationError';
import { calculateCheckDigits } from '../iban/iban';

export const parseBankAccountString = (bankAccount: string): Account => {
  if (!bankAccountStringPattern.test(bankAccount)) {
    throw new ValidationError('Bank account string is invalid');
  }

  return transformBankAccountString(bankAccount);
};

export const parseIbanString = (iban: string): Account => {
  const normalized = iban.replace(/\s/g, '').toUpperCase();

  if (!czechIbanPattern.test(normalized)) {
    throw new ValidationError('IBAN is invalid (only Czech "CZ" IBANs are supported)');
  }

  const account = transformIbanString(normalized);

  if (calculateCheckDigits(account) !== normalized.slice(2, 4)) {
    throw new ValidationError('IBAN check digits are invalid');
  }

  return account;
};

export const parseBankAccount = (bankAccount: BankAccountInput): Account => {
  if (typeof bankAccount === 'string') {
    const trimmed = bankAccount.trim();

    if (/^cz/i.test(trimmed)) {
      return parseIbanString(trimmed);
    }

    return parseBankAccountString(trimmed);
  }

  if (bankAccount === null || typeof bankAccount !== 'object') {
    throw new ValidationError('Bank account must be a string or an Account object');
  }

  return parseAccount(bankAccount);
};

export const parseAccount = (account: Account): Account => {
  const prefix = account.prefix || '';

  if (!bankAccountPrefixPattern.test(prefix)) {
    throw new ValidationError('Account number prefix is invalid');
  }

  if (!bankAccountNumberPattern.test(account.number)) {
    throw new ValidationError('Account number is invalid');
  }

  if (!bankAccountBankCodePattern.test(account.bankCode)) {
    throw new ValidationError('BankCode is invalid');
  }

  return {
    prefix: transformPrefix(prefix),
    number: transformNumber(account.number),
    bankCode: transformBankCode(account.bankCode),
  };
};

export const parsePaymentOptions = (options: PaymentOptionsInput): PaymentOptions => {
  const { message, currency, RN, RF, DT, VS, SS, KS, URL, crc32 } = options;

  // The SPAYD length limits apply to the emitted value, i.e. after `*` and
  // `%` are percent-encoded; the type check keeps untyped JS callers from
  // crashing with a TypeError inside percentEncode later on.
  for (const [name, value, maxLength] of [
    ['Message', message, 60],
    ['RN', RN, 35],
    ['URL', URL, 140],
  ] as const) {
    if (
      value !== undefined &&
      (typeof value !== 'string' || percentEncode(value).length > maxLength)
    ) {
      throw new ValidationError(`${name} maximum length is ${maxLength} (percent-encoded)`);
    }
  }

  if (currency !== undefined && !currencyPattern.test(currency)) {
    throw new ValidationError('Currency has to be a 3-letter ISO 4217 code (e.g. CZK)');
  }

  if (DT !== undefined && !isYYYYMMDDDate(DT)) {
    throw new ValidationError('DT has to be a valid date in YYYYMMDD format');
  }

  for (const [name, value, maxLength] of [
    ['RF', RF, 16],
    ['VS', VS, 10],
    ['SS', SS, 10],
    ['KS', KS, 10],
  ] as const) {
    if (
      value !== undefined &&
      value !== '' &&
      !(typeof value === 'string' && value.length <= maxLength && isNumeric(value))
    ) {
      throw new ValidationError(
        `${name} should be empty or contain only digits (maximum length is ${maxLength})`,
      );
    }
  }

  const result: PaymentOptions = {};

  if (message !== undefined) result.message = message;
  if (currency !== undefined) result.currency = currency;
  if (RN !== undefined) result.RN = RN;
  if (RF !== undefined) result.RF = RF;
  if (DT !== undefined) result.DT = DT;
  if (VS !== undefined) result.VS = VS;
  if (SS !== undefined) result.SS = SS;
  if (KS !== undefined) result.KS = KS;
  if (URL !== undefined) result.URL = URL;
  if (crc32 !== undefined) result.crc32 = crc32;

  return result;
};

export const parsePayment = (input: { amount: number | null; currency?: string }): Payment => {
  let amount: string | null = null;

  if (input.amount !== null) {
    if (typeof input.amount !== 'number' || !Number.isFinite(input.amount)) {
      throw new ValidationError('Invalid amount');
    }

    if (input.amount < 0) {
      throw new ValidationError('Minimum value is 0');
    }

    const formatted = input.amount.toFixed(2);

    // toFixed switches to exponential notation for values >= 1e21, which
    // would slip past the length check and produce an invalid SPAYD amount.
    if (formatted.length > 10 || !/^\d+\.\d{2}$/.test(formatted)) {
      throw new ValidationError('Invalid amount');
    }

    amount = formatted;
  }

  return {
    amount,
    currency: input.currency ?? 'CZK',
  };
};
