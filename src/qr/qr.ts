import { Payment, PaymentOptions } from '../index';
import qrcode from 'qrcode-generator';
import { crc32Hex } from './crc32';
import { percentEncode } from '../validation/transformators';

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

  if (options.RN) {
    content.set('RN', percentEncode(options.RN));
  }

  if (options.message) {
    content.set('MSG', percentEncode(options.message));
  }

  if (options.RF) {
    content.set('RF', options.RF);
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

  const entries = [...content.entries()];
  const spayd = buildSpayd(entries);

  if (options.crc32) {
    // Per the SPAYD spec the checksum is computed over a canonical string:
    // the header followed by the attributes sorted by key (and secondarily
    // by value), CRC32 itself excluded. The emitted attribute order is free.
    const canonical = buildSpayd([...entries].sort(compareEntries));

    return `${spayd}*CRC32:${crc32Hex(canonical)}`;
  }

  return spayd;
};

const buildSpayd = (entries: [string, string][]): string =>
  'SPD*1.0*' + entries.map(([key, value]) => `${key}:${value}`).join('*');

// Plain code-unit comparison — the canonical order must not depend on locale.
const compareEntries = ([aKey, aValue]: [string, string], [bKey, bValue]: [string, string]) => {
  if (aKey !== bKey) {
    return aKey < bKey ? -1 : 1;
  }

  return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
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
