export declare const bankAccountBankCodePattern: RegExp;
export declare const bankAccountNumberPattern: RegExp;
export declare const bankAccountPrefixPattern: RegExp;
export declare const bankAccountStringPattern: RegExp;
export declare const dateYYYYMMDDPattern: RegExp;
export declare const isNumeric: (value: string) => boolean;
/**
 * Validates a due date in the SPAYD `DT` format (YYYYMMDD) and rejects
 * impossible calendar dates such as 20230231.
 */
export declare const isYYYYMMDDDate: (date: string) => boolean;
