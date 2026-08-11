import { parseBankAccount, parsePayment, parsePaymentOptions } from './validation/schema';
import { normalizedAccountHasValidChecksum } from './validation/validators';
import { ValidationError } from './validation/ValidationError';
import { createQrCode, createQrCodeDataUrl, generateQrContent } from './qr/qr';
import {
  Account,
  PaymentOptions,
  Payment,
  AmountInput,
  BankAccountInput,
  PaymentOptionsInput,
} from './index';
import { normalizedAccountToIban } from './iban/iban';

export class QRPayment {
  public readonly paymentOptions: PaymentOptions = {};
  public readonly account: Account;
  public readonly payment: Payment;

  constructor(
    amount: AmountInput,
    bankAccount: BankAccountInput,
    paymentOptions: PaymentOptionsInput = {},
  ) {
    this.account = parseBankAccount(bankAccount);
    this.paymentOptions = parsePaymentOptions(paymentOptions);

    if (paymentOptions.validateChecksum && !normalizedAccountHasValidChecksum(this.account)) {
      throw new ValidationError('Bank account checksum (ČNB mod-11) is invalid');
    }

    this.payment = parsePayment({ amount, currency: this.paymentOptions.currency });
  }

  public getSvg(): string {
    return createQrCode(this.getQrContent());
  }

  public getDataUrl(): string {
    return createQrCodeDataUrl(this.getQrContent());
  }

  public getQrContent(): string {
    return generateQrContent(
      normalizedAccountToIban(this.account),
      this.payment,
      this.paymentOptions,
    );
  }

  public getIban(): string {
    return normalizedAccountToIban(this.account);
  }
}

/**
 * Derives the IBAN from any accepted account input
 * (a `prefix-number/bankCode` string, a Czech IBAN, or an `Account` object).
 */
export function getIban(bankAccount: BankAccountInput): string {
  return normalizedAccountToIban(parseBankAccount(bankAccount));
}

/**
 * Checks the ČNB mod-11 checksums of the account's prefix and number.
 * Returns false for input that cannot be parsed as an account at all.
 * Note this only tells whether the account number is *well-formed* —
 * not whether the account actually exists.
 */
export function hasValidAccountChecksum(bankAccount: BankAccountInput): boolean {
  try {
    return normalizedAccountHasValidChecksum(parseBankAccount(bankAccount));
  } catch {
    return false;
  }
}

export function createQrPaymentSvg(
  amount: AmountInput,
  bankAccount: BankAccountInput,
  paymentOptions: PaymentOptionsInput = {},
): string {
  return new QRPayment(amount, bankAccount, paymentOptions).getSvg();
}

export function createQrPaymentDataUrl(
  amount: AmountInput,
  bankAccount: BankAccountInput,
  paymentOptions: PaymentOptionsInput = {},
): string {
  return new QRPayment(amount, bankAccount, paymentOptions).getDataUrl();
}

export function createQrPaymentContent(
  amount: AmountInput,
  bankAccount: BankAccountInput,
  paymentOptions: PaymentOptionsInput = {},
): string {
  return new QRPayment(amount, bankAccount, paymentOptions).getQrContent();
}
