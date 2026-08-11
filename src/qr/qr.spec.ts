import { describe, it, expect } from 'bun:test';
import { generateQrContent } from './qr';
import { Payment, PaymentOptions } from '../index';

describe('qr', () => {
  it('generateQrContent', () => {
    const iban = 'CZ2130300000001263035066';
    const payment: Payment = {
      amount: '199.90',
      currency: 'CZK',
    };
    const paymentOptions: PaymentOptions = {
      message: 'Poznamka',
      DT: '20230408',
      VS: '123',
      SS: '321',
      KS: '456',
      URL: 'www.google.com',
    };
    expect(generateQrContent(iban, payment, paymentOptions)).toEqual(
      'SPD*1.0*ACC:CZ2130300000001263035066*CC:CZK*AM:199.90*MSG:Poznamka*X-VS:123*X-SS:321*X-KS:456*X-URL:www.google.com*DT:20230408',
    );
  });

  it('computes CRC32 over the canonical key-sorted string, not the emitted order', () => {
    const iban = 'CZ2130300000001263035066';
    const payment: Payment = {
      amount: '199.90',
      currency: 'CZK',
    };
    const paymentOptions: PaymentOptions = {
      message: 'Poznamka',
      DT: '20230408',
      VS: '123',
      SS: '321',
      KS: '456',
      URL: 'www.google.com',
      crc32: true,
    };

    // Expected value independently verified with Python's zlib over
    // 'SPD*1.0*ACC:…*AM:199.90*CC:CZK*DT:…*MSG:…*X-KS:456*X-SS:321*X-URL:…*X-VS:123'.
    expect(generateQrContent(iban, payment, paymentOptions)).toEqual(
      'SPD*1.0*ACC:CZ2130300000001263035066*CC:CZK*AM:199.90*MSG:Poznamka*X-VS:123*X-SS:321*X-KS:456*X-URL:www.google.com*DT:20230408*CRC32:62C8E387',
    );
  });
});
