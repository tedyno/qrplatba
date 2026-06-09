<div align="center">

# qrplatba

**Generate Czech 🇨🇿 SPAYD payment QR codes — from an account number to a scannable code in one call.**

[![npm version](https://img.shields.io/npm/v/qrplatba.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/qrplatba) [![bundle size](https://img.shields.io/bundlephobia/minzip/qrplatba?label=min%2Bgzip)](https://bundlephobia.com/package/qrplatba) [![types](https://img.shields.io/npm/types/qrplatba.svg?logo=typescript)](https://www.typescriptlang.org/) [![license](https://img.shields.io/npm/l/qrplatba.svg)](./LICENSE)

### [▶ Live demo](https://tedyno.github.io/qrplatba/)

<a href="https://tedyno.github.io/qrplatba/">
  <img src="https://raw.githubusercontent.com/tedyno/qrplatba/main/docs/demo.png" alt="qrplatba demo" width="640" />
</a>

</div>

---

## Features

- 🏦 Derives the **IBAN** from a Czech account number (with prefix and bank code) automatically.
- 🧾 Builds spec-compliant **SPAYD** content (`SPD*1.0*…`) per [qr-platba.cz](https://qr-platba.cz/pro-vyvojare/specifikace-formatu/).
- 🖼️ Renders to **SVG**, a **data URL**, or the **raw payload** string.
- ⚙️ Optional fields: variable/specific/constant symbols, message, due date, currency, `CRC32`.
- 🪶 Tiny footprint — a **single runtime dependency** (`qrcode-generator`).
- 🟦 Written in **TypeScript** with full type definitions.

## Installation

```bash
npm install qrplatba
# or
yarn add qrplatba
# or
bun add qrplatba
```

## Quick start

```js
import { QRPayment } from 'qrplatba';

const qrPayment = new QRPayment(322.4, '19-2000145399/0800', {
  VS: '126303', // Variable symbol
  message: 'Payment for order #126303', // Note (max 60 chars)
});

qrPayment.getSvg(); // <svg …> markup as a string
qrPayment.getDataUrl(); // data:image/gif;base64,… URL
qrPayment.getQrContent(); // SPD*1.0*ACC:CZ65…*CC:CZK*AM:322.40*MSG:…*X-VS:126303
```

You can pass the account as an object instead of a string:

```js
const qrPayment = new QRPayment(322.4, {
  prefix: '19',
  number: '2000145399',
  bankCode: '0800',
});
```

> Pass `null` as the amount to omit the `AM` field (e.g. for an open-amount payment).

## Helper functions

If you don't need the instance, the one-shot helpers do the same in a single call:

```js
import { createQrPaymentSvg, createQrPaymentDataUrl, createQrPaymentContent } from 'qrplatba';

createQrPaymentSvg(322.4, '19-2000145399/0800', { VS: '126303' }); // SVG string
createQrPaymentDataUrl(322.4, '19-2000145399/0800', { VS: '126303' }); // data URL
createQrPaymentContent(322.4, '19-2000145399/0800', { VS: '126303' }); // raw SPAYD string
```

## API

### `new QRPayment(amount, account, options?)`

| Argument | Type | Description |
| --- | --- | --- |
| `amount` | `number \| null` | Amount in the chosen currency. `null` omits the `AM` field. |
| `account` | `string \| Account` | Account string (`"19-2000145399/0800"`) or `{ prefix, number, bankCode }`. |
| `options` | `PaymentOptions` | See the [Options](#options) table below. |

**Instance methods:** `getSvg()`, `getDataUrl()`, `getQrContent()`. **Instance properties:** `account`, `payment`, `paymentOptions` (the validated, normalized values).

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

### Validation

Invalid input throws a `ValidationError` (exported from the package) with a descriptive message:

```js
import { ValidationError } from 'qrplatba';

try {
  createQrPaymentContent(100, '19-2000145399/0800', { DT: '2024-01-01' });
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(err.message); // "DT has to be a valid date in YYYYMMDD format"
  }
}
```

## Specification & disclaimer

The generated content follows the format described at [qr-platba.cz](https://qr-platba.cz/pro-vyvojare/specifikace-formatu/). This package was primarily built for personal use cases and may not cover every scenario. While efforts have been made to ensure compatibility, you are responsible for verifying the correctness of the generated QR codes for your own accounts.

## Development

This project uses [Bun](https://bun.sh).

```bash
bun install      # install dependencies
bun run test     # run the test suite
bun run build    # compile TypeScript to dist/
bun run lint     # check formatting with Prettier
```

The live demo lives in [`docs/`](./docs) and is published to GitHub Pages from the `main` branch.

## Issues

Found a problem or have a suggestion? Please [open an issue](https://github.com/tedyno/qrplatba/issues).

## License

[MIT](./LICENSE)
