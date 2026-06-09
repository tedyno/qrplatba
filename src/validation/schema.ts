import { Account, Payment, PaymentOptions } from '../index';
import {
  bankAccountBankCodePattern,
  bankAccountNumberPattern,
  bankAccountPrefixPattern,
  bankAccountStringPattern,
  currencyPattern,
  isNumeric,
  isYYYYMMDDDate,
} from './validators';
import {
  transformBankAccountString,
  transformBankCode,
  transformNumber,
  transformPrefix,
} from './transformators';
import { ValidationError } from './ValidationError';

export const parseBankAccountString = (bankAccount: string): Account => {
  if (!bankAccountStringPattern.test(bankAccount)) {
    throw new ValidationError('Bank account string is invalid');
  }

  return transformBankAccountString(bankAccount);
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

export const parsePaymentOptions = (options: PaymentOptions): PaymentOptions => {
  const { message, currency, DT, VS, SS, KS, URL, crc32 } = options;

  if (message !== undefined && message.length > 60) {
    throw new ValidationError('Message maximum length is 60');
  }

  if (currency !== undefined && !currencyPattern.test(currency)) {
    throw new ValidationError('Currency has to be a 3-letter ISO 4217 code (e.g. CZK)');
  }

  if (DT !== undefined && !isYYYYMMDDDate(DT)) {
    throw new ValidationError('DT has to be a valid date in YYYYMMDD format');
  }

  for (const [name, value] of [
    ['VS', VS],
    ['SS', SS],
    ['KS', KS],
  ] as const) {
    if (value !== undefined && !(value.length <= 10 && isNumeric(value))) {
      throw new ValidationError(
        `${name} should be empty or contain only digits (maximum length is 10)`,
      );
    }
  }

  if (URL !== undefined && URL.length > 140) {
    throw new ValidationError('Maximum length is 140');
  }

  const result: PaymentOptions = {};

  if (message !== undefined) result.message = message;
  if (currency !== undefined) result.currency = currency;
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
    if (typeof input.amount !== 'number' || Number.isNaN(input.amount)) {
      throw new ValidationError('Invalid amount');
    }

    if (input.amount < 0) {
      throw new ValidationError('Minimum value is 0');
    }

    const formatted = input.amount.toFixed(2);

    if (formatted.length > 10) {
      throw new ValidationError('Invalid amount');
    }

    amount = formatted;
  }

  return {
    amount,
    currency: input.currency ?? 'CZK',
  };
};
