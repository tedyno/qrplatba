import { describe, it, expect } from 'bun:test';
import { QRPayment, getIban, hasValidAccountChecksum } from './QRPayment';
import { ValidationError } from './validation/ValidationError';

describe('QRPayment', () => {
  describe('creates QRPayment instance', () => {
    it('using BankAccount object', () => {
      const qrPayment = new QRPayment(
        156.9,
        {
          prefix: '123',
          number: '1234567891',
          bankCode: '0100',
        },
        {
          VS: '126303',
          message: 'Payment for order #126303',
        },
      );

      expect(qrPayment.payment.amount).toEqual('156.90');
      expect(qrPayment.account.prefix).toEqual('000123');
      expect(qrPayment.account.number).toEqual('1234567891');
      expect(qrPayment.account.bankCode).toEqual('0100');
      expect(qrPayment.paymentOptions).toMatchObject({
        message: 'Payment for order #126303',
        VS: '126303',
      });
    });

    it('using bank account string', () => {
      const qrPayment = new QRPayment(322.4, '19-2000145399/0800', {
        VS: '126303',
        message: 'Payment for order #126303',
      });

      expect(qrPayment.payment.amount).toEqual('322.40');
      expect(qrPayment.account.prefix).toEqual('000019');
      expect(qrPayment.account.number).toEqual('2000145399');
      expect(qrPayment.account.bankCode).toEqual('0800');
      expect(qrPayment.paymentOptions).toMatchObject({
        message: 'Payment for order #126303',
        VS: '126303',
      });
    });

    it('without amount', () => {
      const qrPayment = new QRPayment(null, '19-2000145399/0800', {
        VS: '126303',
        message: 'Payment for order #126303',
      });

      expect(qrPayment.payment.amount).toEqual(null);
      expect(qrPayment.account.prefix).toEqual('000019');
      expect(qrPayment.account.number).toEqual('2000145399');
      expect(qrPayment.account.bankCode).toEqual('0800');
      expect(qrPayment.paymentOptions).toMatchObject({
        message: 'Payment for order #126303',
        VS: '126303',
      });
    });

    it('using IBAN string', () => {
      const qrPayment = new QRPayment(322.4, 'CZ6508000000192000145399');

      expect(qrPayment.account).toEqual({
        prefix: '000019',
        number: '2000145399',
        bankCode: '0800',
      });
    });

    it('using formatted lowercase IBAN string', () => {
      const qrPayment = new QRPayment(322.4, 'cz65 0800 0000 1920 0014 5399');

      expect(qrPayment.account).toEqual({
        prefix: '000019',
        number: '2000145399',
        bankCode: '0800',
      });
    });

    it('trims surrounding whitespace from the account string', () => {
      const qrPayment = new QRPayment(322.4, ' 19-2000145399/0800 ');

      expect(qrPayment.account).toEqual({
        prefix: '000019',
        number: '2000145399',
        bankCode: '0800',
      });
    });

    it('accepts empty symbols and reference and omits them from the payload', () => {
      const qrPayment = new QRPayment(100, '19-2000145399/0800', {
        VS: '',
        SS: '',
        KS: '',
        RF: '',
      });

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:100.00',
      );
    });

    it('does not store validateChecksum in paymentOptions', () => {
      const qrPayment = new QRPayment(100, '19-2000145399/0800', {
        validateChecksum: true,
      });

      expect('validateChecksum' in qrPayment.paymentOptions).toBe(false);
    });

    it('with 0 amount', () => {
      const qrPayment = new QRPayment(0, '19-2000145399/0800', {
        VS: '126303',
        message: 'Payment for order #126303',
      });

      expect(qrPayment.payment.amount).toEqual('0.00');
      expect(qrPayment.account.prefix).toEqual('000019');
      expect(qrPayment.account.number).toEqual('2000145399');
      expect(qrPayment.account.bankCode).toEqual('0800');
      expect(qrPayment.paymentOptions).toMatchObject({
        message: 'Payment for order #126303',
        VS: '126303',
      });
    });
  });

  describe('generates content for QR code', () => {
    it('using BankAccount object', () => {
      const qrPayment = new QRPayment(
        156.9,
        {
          prefix: '19',
          number: '2000145399',
          bankCode: '0800',
        },
        {
          VS: '126303',
          message: 'Payment for order #126303',
        },
      );

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:156.90*MSG:Payment for order #126303*X-VS:126303',
      );
    });

    it('using bank account string', () => {
      const qrPayment = new QRPayment(156.9, '19-2000145399/0800', {
        VS: '126303',
        message: 'Payment for order #126303',
      });

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:156.90*MSG:Payment for order #126303*X-VS:126303',
      );
    });

    it('without amount', () => {
      const qrPayment = new QRPayment(null, '19-2000145399/0800', {
        VS: '126303',
        message: 'Payment for order #126303',
      });

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*MSG:Payment for order #126303*X-VS:126303',
      );
    });

    it('with 0 amount', () => {
      const qrPayment = new QRPayment(0, '19-2000145399/0800', {
        VS: '126303',
        message: 'Payment for order #126303',
      });

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:0.00*MSG:Payment for order #126303*X-VS:126303',
      );
    });

    it('with due date', () => {
      const qrPayment = new QRPayment(156.9, '19-2000145399/0800', {
        DT: '20230408',
      });

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:156.90*DT:20230408',
      );
    });

    it('with a non-default currency', () => {
      const qrPayment = new QRPayment(156.9, '19-2000145399/0800', {
        currency: 'EUR',
      });

      expect(qrPayment.payment.currency).toEqual('EUR');
      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:EUR*AM:156.90',
      );
    });

    it('percent-encodes * and % in the message', () => {
      const qrPayment = new QRPayment(156.9, '19-2000145399/0800', {
        message: 'a*b%c',
      });

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:156.90*MSG:a%2Ab%25c',
      );
    });

    it('with recipient name and payment reference', () => {
      const qrPayment = new QRPayment(156.9, '19-2000145399/0800', {
        RN: 'Firma s.r.o.',
        RF: '1234567890123456',
      });

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:156.90*RN:Firma s.r.o.*RF:1234567890123456',
      );
    });

    it('percent-encodes * and % in the recipient name', () => {
      const qrPayment = new QRPayment(156.9, '19-2000145399/0800', {
        RN: 'a*b%c',
      });

      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:156.90*RN:a%2Ab%25c',
      );
    });

    it('appends a CRC32 checksum when requested', () => {
      const qrPayment = new QRPayment(10, '19-2000145399/0800', {
        VS: '123',
        crc32: true,
      });

      // Expected value independently verified with Python's zlib over the
      // canonical (key-sorted) string 'SPD*1.0*ACC:…*AM:10.00*CC:CZK*X-VS:123'.
      expect(qrPayment.getQrContent()).toEqual(
        'SPD*1.0*ACC:CZ6508000000192000145399*CC:CZK*AM:10.00*X-VS:123*CRC32:0F6A3F4F',
      );
    });
  });

  describe('output formats', () => {
    it('getSvg returns an SVG tag', () => {
      const qrPayment = new QRPayment(156.9, '19-2000145399/0800');

      expect(qrPayment.getSvg()).toContain('<svg');
    });

    it('getDataUrl returns a data URL', () => {
      const qrPayment = new QRPayment(156.9, '19-2000145399/0800');

      expect(qrPayment.getDataUrl()).toMatch(/^data:image\/gif;base64,/);
    });
  });

  describe('Fails', () => {
    it('invalid amount', () => {
      expect(() => {
        new QRPayment(10000000, '19-2000145399/0800');
      }).toThrow(ValidationError);
    });

    it('non-finite amount', () => {
      expect(() => {
        new QRPayment(Infinity, '19-2000145399/0800');
      }).toThrow(ValidationError);

      expect(() => {
        new QRPayment(NaN, '19-2000145399/0800');
      }).toThrow(ValidationError);
    });

    it('amount formatted in exponential notation', () => {
      expect(() => {
        new QRPayment(1e21, '19-2000145399/0800');
      }).toThrow(ValidationError);
    });

    it('IBAN with invalid check digits', () => {
      expect(() => {
        new QRPayment(100, 'CZ0008000000192000145399');
      }).toThrow(ValidationError);
    });

    it('non-Czech IBAN', () => {
      expect(() => {
        new QRPayment(100, 'DE89370400440532013000');
      }).toThrow(ValidationError);
    });

    it('IBAN with invalid length', () => {
      expect(() => {
        new QRPayment(100, 'CZ650800000019200014539');
      }).toThrow(ValidationError);
    });

    it('RN is too long', () => {
      expect(() => {
        new QRPayment(100, '19-2000145399/0800', {
          RN: 'a'.repeat(36),
        });
      }).toThrow(ValidationError);
    });

    it('RN exceeding the limit only after percent-encoding', () => {
      // 12 × '*' percent-encodes to 36 characters, one over the RN limit.
      expect(() => {
        new QRPayment(100, '19-2000145399/0800', {
          RN: '*'.repeat(12),
        });
      }).toThrow(ValidationError);
    });

    it('message exceeding the limit only after percent-encoding', () => {
      // 21 × '*' percent-encodes to 63 characters, over the 60-char limit.
      expect(() => {
        new QRPayment(100, '19-2000145399/0800', {
          message: '*'.repeat(21),
        });
      }).toThrow(ValidationError);
    });

    it('non-string RN', () => {
      expect(() => {
        new QRPayment(100, '19-2000145399/0800', {
          RN: 12345 as unknown as string,
        });
      }).toThrow(ValidationError);
    });

    it('RF is invalid', () => {
      expect(() => {
        new QRPayment(100, '19-2000145399/0800', {
          RF: '1'.repeat(17),
        });
      }).toThrow(ValidationError);

      expect(() => {
        new QRPayment(100, '19-2000145399/0800', {
          RF: 'abc',
        });
      }).toThrow(ValidationError);
    });

    it('account failing the mod-11 checksum when validateChecksum is on', () => {
      expect(() => {
        new QRPayment(100, '1234567891/0100', {
          validateChecksum: true,
        });
      }).toThrow(ValidationError);
    });

    it('all-zero account number when validateChecksum is on', () => {
      expect(() => {
        new QRPayment(100, '00/0800', {
          validateChecksum: true,
        });
      }).toThrow(ValidationError);
    });

    it('non-string non-object bank account', () => {
      expect(() => {
        new QRPayment(100, null as unknown as string);
      }).toThrow(ValidationError);
    });

    it('invalid bankAccount number', () => {
      expect(() => {
        new QRPayment(100, '19-2000213213145399/0800');
      }).toThrow(ValidationError);
    });

    it('invalid bankAccount prefix', () => {
      expect(() => {
        new QRPayment(100, '12312319-2000145399/0800');
      }).toThrow(ValidationError);
    });

    it('invalid bankAccount bankCode', () => {
      expect(() => {
        new QRPayment(100, '19-2000145399/08000');
      }).toThrow(ValidationError);
    });

    it('invalid currency code', () => {
      expect(() => {
        new QRPayment(
          156.9,
          {
            prefix: '19',
            number: '2000145399',
            bankCode: '0800',
          },
          {
            currency: 'czk',
          },
        );
      }).toThrow(ValidationError);
    });

    it('DT is not in YYYYMMDD format', () => {
      expect(() => {
        new QRPayment(
          156.9,
          {
            prefix: '19',
            number: '2000145399',
            bankCode: '0800',
          },
          {
            DT: 'dsads',
          },
        );
      }).toThrow(ValidationError);
    });

    it('DT is an impossible calendar date', () => {
      expect(() => {
        new QRPayment(
          156.9,
          {
            prefix: '19',
            number: '2000145399',
            bankCode: '0800',
          },
          {
            DT: '20230231',
          },
        );
      }).toThrow(ValidationError);
    });

    it('Message is too long', () => {
      expect(() => {
        new QRPayment(
          156.9,
          {
            prefix: '19',
            number: '2000145399',
            bankCode: '0800',
          },
          {
            message: 'a'.repeat(61),
          },
        );
      }).toThrow(ValidationError);
    });

    describe('VS', () => {
      it('is too long', () => {
        expect(() => {
          new QRPayment(
            156.9,
            {
              prefix: '19',
              number: '2000145399',
              bankCode: '0800',
            },
            {
              VS: '123123123123',
            },
          );
        }).toThrow(ValidationError);
      });

      it('is invalid', () => {
        expect(() => {
          new QRPayment(
            156.9,
            {
              prefix: '19',
              number: '2000145399',
              bankCode: '0800',
            },
            {
              VS: 'NaN',
            },
          );
        }).toThrow(ValidationError);
      });
    });

    describe('KS', () => {
      it('is too long', () => {
        expect(() => {
          new QRPayment(
            156.9,
            {
              prefix: '19',
              number: '2000145399',
              bankCode: '0800',
            },
            {
              KS: '123123123123',
            },
          );
        }).toThrow(ValidationError);
      });

      it('is invalid', () => {
        expect(() => {
          new QRPayment(
            156.9,
            {
              prefix: '19',
              number: '2000145399',
              bankCode: '0800',
            },
            {
              KS: 'NaN',
            },
          );
        }).toThrow(ValidationError);
      });
    });

    describe('SS', () => {
      it('is too long', () => {
        expect(() => {
          new QRPayment(
            156.9,
            {
              prefix: '19',
              number: '2000145399',
              bankCode: '0800',
            },
            {
              SS: '123123123123',
            },
          );
        }).toThrow(ValidationError);
      });

      it('is invalid', () => {
        expect(() => {
          new QRPayment(
            156.9,
            {
              prefix: '19',
              number: '2000145399',
              bankCode: '0800',
            },
            {
              SS: 'NaN',
            },
          );
        }).toThrow(ValidationError);
      });
    });

    describe('URL', () => {
      it('is too long', () => {
        expect(() => {
          new QRPayment(
            156.9,
            {
              prefix: '19',
              number: '2000145399',
              bankCode: '0800',
            },
            {
              URL: 'a'.repeat(141),
            },
          );
        }).toThrow(ValidationError);
      });
    });
  });
});

describe('getIban', () => {
  it('derives the IBAN from a bank account string', () => {
    expect(getIban('19-2000145399/0800')).toEqual('CZ6508000000192000145399');
  });

  it('derives the IBAN from an Account object', () => {
    expect(getIban({ prefix: '19', number: '2000145399', bankCode: '800' })).toEqual(
      'CZ6508000000192000145399',
    );
  });

  it('normalizes a formatted IBAN string', () => {
    expect(getIban('cz65 0800 0000 1920 0014 5399')).toEqual('CZ6508000000192000145399');
  });

  it('is exposed as an instance method', () => {
    expect(new QRPayment(100, '19-2000145399/0800').getIban()).toEqual('CZ6508000000192000145399');
  });
});

describe('hasValidAccountChecksum', () => {
  it('accepts an account with valid mod-11 checksums', () => {
    expect(hasValidAccountChecksum('19-2000145399/0800')).toBe(true);
  });

  it('rejects an account with an invalid number checksum', () => {
    expect(hasValidAccountChecksum('1234567891/0100')).toBe(false);
  });

  it('rejects an account with an invalid prefix checksum', () => {
    expect(hasValidAccountChecksum('18-2000145399/0800')).toBe(false);
  });

  it('rejects an all-zero account number', () => {
    expect(hasValidAccountChecksum('00/0800')).toBe(false);
  });

  it('returns false for unparseable input instead of throwing', () => {
    expect(hasValidAccountChecksum('19-')).toBe(false);
    expect(hasValidAccountChecksum('abc')).toBe(false);
    expect(hasValidAccountChecksum('')).toBe(false);
    expect(hasValidAccountChecksum(null as unknown as string)).toBe(false);
  });
});
