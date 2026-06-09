import { Payment, PaymentOptions } from '../index';
import qrcode from 'qrcode-generator';
import { crc32Hex } from './crc32';

/**
 * Percent-encodes the `%` and `*` characters so a value cannot break the
 * `*`-delimited SPAYD structure. Other characters (including diacritics and
 * URL punctuation such as `:` or `/`) are left intact.
 */
const percentEncode = (value: string): string => value.replace(/%/g, '%25').replace(/\*/g, '%2A');

export const generateQrContent = (
  iban: string,
  payment: Payment,
  options: PaymentOptions,
): string => {
  const content = new Map<string, string>([
    ['ACC', iban],
    ['CC', payment.currency],
  ]);

  if (payment.amount) {
    content.set('AM', payment.amount);
  }

  if (options.message) {
    content.set('MSG', percentEncode(options.message));
  }

  if (options.VS) {
    content.set('X-VS', options.VS);
  }

  if (options.SS) {
    content.set('X-SS', options.SS);
  }

  if (options.KS) {
    content.set('X-KS', options.KS);
  }

  if (options.URL) {
    content.set('X-URL', percentEncode(options.URL));
  }

  if (options.DT) {
    content.set('DT', options.DT);
  }

  const spayd =
    'SPD*1.0*' + [...content.entries()].map(([key, value]) => `${key}:${value}`).join('*');

  if (options.crc32) {
    return `${spayd}*CRC32:${crc32Hex(spayd)}`;
  }

  return spayd;
};

const buildQrCode = (content: string) => {
  const qr = qrcode(0, 'L');
  qr.addData(content);
  qr.make();

  return qr;
};

export const createQrCode = (content: string): string => {
  return buildQrCode(content).createSvgTag({ scalable: true });
};

export const createQrCodeDataUrl = (content: string): string => {
  return buildQrCode(content).createDataURL();
};
