import { Account, Payment } from '../index';
import { z } from 'zod';
export declare const BankAccountStringSchema: z.ZodEffects<z.ZodString, Account, string>;
export declare const PaymentOptionsSchema: z.ZodObject<{
    message: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>, string | undefined, string | undefined>;
    DT: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    VS: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    SS: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    KS: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    URL: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    message?: string | undefined;
    DT?: string | undefined;
    VS?: string | undefined;
    SS?: string | undefined;
    KS?: string | undefined;
    URL?: string | undefined;
}, {
    message?: string | undefined;
    DT?: string | undefined;
    VS?: string | undefined;
    SS?: string | undefined;
    KS?: string | undefined;
    URL?: string | undefined;
}>;
export declare const PaymentSchema: z.ZodEffects<z.ZodObject<{
    amount: z.ZodNullable<z.ZodEffects<z.ZodEffects<z.ZodNumber, string, number>, string, number>>;
}, "strip", z.ZodTypeAny, {
    amount: string | null;
}, {
    amount: number | null;
}>, Payment, {
    amount: number | null;
}>;
export declare const AccountSchema: z.ZodEffects<z.ZodObject<{
    prefix: z.ZodString;
    number: z.ZodString;
    bankCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    number: string;
    prefix: string;
    bankCode: string;
}, {
    number: string;
    prefix: string;
    bankCode: string;
}>, Account, {
    number: string;
    prefix: string;
    bankCode: string;
}>;
