"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountSchema = exports.PaymentSchema = exports.PaymentOptionsSchema = exports.BankAccountStringSchema = void 0;
const zod_1 = require("zod");
const validators_1 = require("./validators");
const transformators_1 = require("./transformators");
exports.BankAccountStringSchema = zod_1.z
    .string()
    .regex(validators_1.bankAccountStringPattern)
    .transform((bankAccount) => (0, transformators_1.transformBankAccountString)(bankAccount));
exports.PaymentOptionsSchema = zod_1.z.object({
    message: zod_1.z
        .string()
        .optional()
        .refine((message) => !message || !message.includes('*'), "Message cannot contain the '*' character")
        .refine((message) => !message || message.length <= 60, 'Message maximum length is 60'),
    DT: zod_1.z
        .string()
        .optional()
        .refine((date) => !date || (0, validators_1.isYYYYMMDDDate)(date), 'DT has to be a valid date in YYYYMMDD format'),
    VS: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || (val.length <= 10 && (0, validators_1.isNumeric)(val)), 'VS should be empty or contain only digits (maximum length is 10)'),
    SS: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || (val.length <= 10 && (0, validators_1.isNumeric)(val)), 'SS should be empty or contain only digits (maximum length is 10)'),
    KS: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || (val.length <= 10 && (0, validators_1.isNumeric)(val)), 'KS should be empty or contain only digits (maximum length is 10)'),
    URL: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || val.length <= 140, 'Maximum length is 140'),
});
exports.PaymentSchema = zod_1.z
    .object({
    amount: zod_1.z
        .number()
        .min(0, 'Minimum value is 0')
        .transform((amount) => amount.toFixed(2))
        .refine((val) => val.length <= 10, 'Invalid amount')
        .nullable(),
})
    .transform((data) => ({
    ...data,
    currency: 'CZK',
}));
exports.AccountSchema = zod_1.z
    .object({
    prefix: zod_1.z.string().regex(validators_1.bankAccountPrefixPattern, 'Account number prefix is invalid'),
    number: zod_1.z.string().regex(validators_1.bankAccountNumberPattern, 'Account number is invalid'),
    bankCode: zod_1.z.string().regex(validators_1.bankAccountBankCodePattern, 'BankCode is invalid'),
})
    .transform((data) => ({
    ...data,
    prefix: (0, transformators_1.transformPrefix)(data.prefix || ''),
    number: (0, transformators_1.transformNumber)(data.number),
    bankCode: (0, transformators_1.transformBankCode)(data.bankCode),
}));
