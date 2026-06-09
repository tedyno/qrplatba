"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isYYYYMMDDDate = exports.isNumeric = exports.dateYYYYMMDDPattern = exports.bankAccountStringPattern = exports.bankAccountPrefixPattern = exports.bankAccountNumberPattern = exports.bankAccountBankCodePattern = void 0;
exports.bankAccountBankCodePattern = /^\d{3,4}$/;
exports.bankAccountNumberPattern = /^\d{2,10}$/;
exports.bankAccountPrefixPattern = /^\d{0,6}$/;
exports.bankAccountStringPattern = /^(\d{1,6}-)?(\d{2,10})\/\d{3,4}$/;
exports.dateYYYYMMDDPattern = /^(\d{4})(\d{2})(\d{2})$/;
const isNumeric = (value) => /^\d+$/.test(value);
exports.isNumeric = isNumeric;
/**
 * Validates a due date in the SPAYD `DT` format (YYYYMMDD) and rejects
 * impossible calendar dates such as 20230231.
 */
const isYYYYMMDDDate = (date) => {
    const match = exports.dateYYYYMMDDPattern.exec(date);
    if (!match) {
        return false;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return (parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day);
};
exports.isYYYYMMDDDate = isYYYYMMDDDate;
