import { QRPayment } from './QRPayment';
import { ZodError } from 'zod';

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
  });

  describe('Fails', () => {
    it('invalid amount', () => {
      expect(() => {
        new QRPayment(10000000, '19-2000145399/0800');
      }).toThrow(ZodError);
    });

    it('invalid bankAccount number', () => {
      expect(() => {
        new QRPayment(100, '19-2000213213145399/0800');
      }).toThrow(ZodError);
    });

    it('invalid bankAccount prefix', () => {
      expect(() => {
        new QRPayment(100, '12312319-2000145399/0800');
      }).toThrow(ZodError);
    });

    it('invalid bankAccount bankCode', () => {
      expect(() => {
        new QRPayment(100, '19-2000145399/08000');
      }).toThrow(ZodError);
    });

    it('Message contains * character', () => {
      expect(() => {
        new QRPayment(
          156.9,
          {
            prefix: '19',
            number: '2000145399',
            bankCode: '0800',
          },
          {
            message: 'content * content',
          },
        );
      }).toThrow(ZodError);
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
      }).toThrow(ZodError);
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
      }).toThrow(ZodError);
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
      }).toThrow(ZodError);
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
        }).toThrow(ZodError);
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
        }).toThrow(ZodError);
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
        }).toThrow(ZodError);
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
        }).toThrow(ZodError);
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
        }).toThrow(ZodError);
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
        }).toThrow(ZodError);
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
        }).toThrow(ZodError);
      });
    });
  });
});
