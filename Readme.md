## @tedyno/cz-qr-payment

[![npm version](https://img.shields.io/npm/v/@tedyno/cz-qr-payment.svg)](https://www.npmjs.com/package/@tedyno/cz-qr-payment) [![license](https://img.shields.io/npm/l/@tedyno/cz-qr-payment.svg)](./LICENSE)

### Description

A simple and efficient npm package for generating **SPAYD** (Short Payment Descriptor) QR codes tailored for CZ 🇨🇿 payments. It builds the QR payment content (`SPD*1.0*…`) from the IBAN derived from a Czech account number and renders it as an SVG (or a data URL), providing an easy solution for generating payment QR codes compatible with Czech banking apps.

### Installation

```bash
npm install @tedyno/cz-qr-payment
# or
yarn add @tedyno/cz-qr-payment
# or
bun add @tedyno/cz-qr-payment
```

### Usage

#### Using the class instance

```js
import { QRPayment } from '@tedyno/cz-qr-payment';

const amount = 322.4; // 322.40 CZK
const accountNumber = '19-2000145399/0800';
const options = {
  VS: '126303', // Variable symbol
  KS: '126303', // Constant symbol
  SS: '126303', // Specific symbol
  message: 'Payment for order #126303', // Note (max 60 chars)
};

const qrPayment = new QRPayment(amount, accountNumber, options);

qrPayment.getSvg(); // SVG markup as a string
qrPayment.getDataUrl(); // data:image/gif;base64,… URL
qrPayment.getQrContent(); // raw SPAYD string (SPD*1.0*…)
```

You can also pass the account as an object instead of a string:

```js
const qrPayment = new QRPayment(322.4, {
  prefix: '19',
  number: '2000145399',
  bankCode: '0800',
});
```

#### Using the helper functions

```js
import {
  createQrPaymentSvg,
  createQrPaymentDataUrl,
  createQrPaymentContent,
} from '@tedyno/cz-qr-payment';

const amount = 322.4;
const accountNumber = '19-2000145399/0800';
const options = { VS: '126303', message: 'Payment for order #126303' };

createQrPaymentSvg(amount, accountNumber, options); // SVG string
createQrPaymentDataUrl(amount, accountNumber, options); // data URL
createQrPaymentContent(amount, accountNumber, options); // raw SPAYD string
```

> Pass `null` as the amount to omit the `AM` field (e.g. for an open-amount payment).

### Options

| Option     | Type      | Description                                                           |
| ---------- | --------- | --------------------------------------------------------------------- |
| `message`  | `string`  | Payment note (`MSG`). Maximum 60 characters; `*` and `%` are encoded. |
| `currency` | `string`  | ISO 4217 currency code (`CC`). Defaults to `CZK`.                     |
| `DT`       | `string`  | Due date (`DT`) in `YYYYMMDD` format.                                 |
| `VS`       | `string`  | Variable symbol (`X-VS`). Up to 10 digits.                            |
| `SS`       | `string`  | Specific symbol (`X-SS`). Up to 10 digits.                            |
| `KS`       | `string`  | Constant symbol (`X-KS`). Up to 10 digits.                            |
| `URL`      | `string`  | URL (`X-URL`). Up to 140 characters.                                  |
| `crc32`    | `boolean` | When `true`, appends a `CRC32` checksum field to the payload.         |

### QR Code Content Specifications

The information used for creating the QR code content adheres to the specifications provided by [qr-platba.cz](https://qr-platba.cz/pro-vyvojare/specifikace-formatu/). It's important to note that this package was primarily developed for personal use cases and might not cover all potential scenarios. While efforts have been made to ensure compatibility, users are responsible for verifying and validating the correctness of the generated QR code content.

### Development

This project uses [Bun](https://bun.sh).

```bash
bun install      # install dependencies
bun run test     # run the test suite
bun run build    # compile TypeScript to dist/
bun run lint     # check formatting with Prettier
```

### Troubleshooting and Issues

If you encounter any troubles with the generated QR codes or have suggestions for improvements, please [create an issue](https://github.com/tedyno/cz-qr-payment/issues) on the GitHub repository page.
