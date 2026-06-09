export const bankAccountBankCodePattern = /^\d{3,4}$/;
export const bankAccountNumberPattern = /^\d{2,10}$/;
export const bankAccountPrefixPattern = /^\d{0,6}$/;
export const bankAccountStringPattern = /^(\d{1,6}-)?(\d{2,10})\/\d{3,4}$/;
export const dateYYYYMMDDPattern = /^(\d{4})(\d{2})(\d{2})$/;
export const currencyPattern = /^[A-Z]{3}$/;

export const isNumeric = (value: string): boolean => /^\d+$/.test(value);

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
