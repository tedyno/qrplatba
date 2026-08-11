export type AmountInput = number | null;
export type BankAccountInput = Account | string;

/**
 * Constructor options: all SPAYD payload fields plus behavioral switches
 * that are consumed during validation and never stored on the instance.
 */
export type PaymentOptionsInput = PaymentOptions & {
  /** When true, rejects accounts that fail the ČNB mod-11 checksum. */
  validateChecksum?: boolean;
};

/**
 * Represents an account with specific details.
 * @interface Account
 * @property {string} prefix - The account prefix.
 * @property {string} number - The account number.
 * @property {string} bankCode - The bank code associated with the account.
 */
export interface Account {
  readonly prefix: string;
  readonly number: string;
  readonly bankCode: string;
}

/**
 * Represents a payment with specific details.
 * @interface Payment
 * @property {string} amount - The payment amount.
 * @property {string} currency - The ISO 4217 currency code (defaults to 'CZK').
 */
export interface Payment {
  readonly amount: string | null;
  readonly currency: string;
}

/**
 * Represents options for a specific operation.
 * @interface PaymentOptions
 * @property {string | undefined} message - The main message content (max 60 characters, percent-encoded).
 * @property {string | undefined} currency - ISO 4217 currency code (e.g. 'CZK', 'EUR'). Defaults to 'CZK'.
 * @property {string | undefined} RN - Jméno příjemce (max 35 characters, percent-encoded).
 * @property {string | undefined} RF - Reference platby pro příjemce (max 16 digits).
 * @property {string | undefined} DT - Datum splatnosti (YYYYMMDD).
 * @property {string | undefined} VS - Variabilní symbol.
 * @property {string | undefined} SS - Specifický symbol.
 * @property {string | undefined} KS - Konstantní symbol.
 * @property {string | undefined} URL - The URL associated with the operation (max 140 characters, percent-encoded).
 * @property {boolean | undefined} crc32 - When true, appends a SPAYD CRC32 checksum field.
 */
export interface PaymentOptions {
  message?: string;
  currency?: string;
  RN?: string;
  RF?: string;
  DT?: string;
  VS?: string;
  SS?: string;
  KS?: string;
  URL?: string;
  crc32?: boolean;
}

export * from './QRPayment';
export * from './validation/ValidationError';
