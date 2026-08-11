<div align="center">

# qrplatba

**Generate Czech 🇨🇿 SPAYD payment QR codes — from an account number to a scannable code in one call.**

[![npm version](https://img.shields.io/npm/v/qrplatba.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/qrplatba) [![npm downloads](https://img.shields.io/npm/dm/qrplatba.svg)](https://www.npmjs.com/package/qrplatba) [![CI](https://img.shields.io/github/actions/workflow/status/tedyno/qrplatba/ci.yml?branch=main&label=CI)](https://github.com/tedyno/qrplatba/actions/workflows/ci.yml) [![bundle size](https://img.shields.io/bundlephobia/minzip/qrplatba?label=min%2Bgzip)](https://bundlephobia.com/package/qrplatba) [![types](https://img.shields.io/npm/types/qrplatba.svg?logo=typescript)](https://www.typescriptlang.org/) [![license](https://img.shields.io/npm/l/qrplatba.svg)](./LICENSE)

### [▶ Live demo](https://tedyno.github.io/qrplatba/)

<a href="https://tedyno.github.io/qrplatba/">
  <img src="https://raw.githubusercontent.com/tedyno/qrplatba/main/docs/demo.png" alt="qrplatba demo" width="640" />
</a>

</div>

---

## Features

- 🏦 Derives the **IBAN** from a Czech account number (with prefix and bank code) automatically — or accepts a Czech **IBAN** directly.
- 🧾 Builds spec-compliant **SPAYD** content (`SPD*1.0*…`) per [qr-platba.cz](https://qr-platba.cz/pro-vyvojare/specifikace-formatu/).
- 🖼️ Renders to **SVG**, a **data URL**, or the **raw payload** string.
- ⚙️ Optional fields: variable/specific/constant symbols, message, recipient name, payment reference, due date, currency, `CRC32`.
- ✅ Optional **ČNB mod-11 checksum** validation of the account number.
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

You can pass the account as an object or a Czech IBAN instead:

```js
const qrPayment = new QRPayment(322.4, {
  prefix: '19',
  number: '2000145399',
  bankCode: '0800',
});

// or a Czech IBAN
const fromIban = new QRPayment(322.4, 'CZ65 0800 0000 1920 0014 5399');
```

> IBAN input is normalized (spaces and case don't matter) and its check digits are verified.

> Pass `null` as the amount to omit the `AM` field (e.g. for an open-amount payment).

## Helper functions

If you don't need the instance, the one-shot helpers do the same in a single call:

```js
import { createQrPaymentSvg, createQrPaymentDataUrl, createQrPaymentContent } from 'qrplatba';

createQrPaymentSvg(322.4, '19-2000145399/0800', { VS: '126303' }); // SVG string
createQrPaymentDataUrl(322.4, '19-2000145399/0800', { VS: '126303' }); // data URL
createQrPaymentContent(322.4, '19-2000145399/0800', { VS: '126303' }); // raw SPAYD string
```

Two account utilities are exported as well:

```js
import { getIban, hasValidAccountChecksum } from 'qrplatba';

getIban('19-2000145399/0800'); // 'CZ6508000000192000145399'
hasValidAccountChecksum('19-2000145399/0800'); // true — ČNB mod-11 checksum of prefix and number
hasValidAccountChecksum('not-an-account'); // false — never throws, unparseable input is just invalid
```

## API

### `new QRPayment(amount, account, options?)`

| Argument | Type | Description |
| --- | --- | --- |
| `amount` | `number \| null` | Amount in the chosen currency. `null` omits the `AM` field. |
| `account` | `string \| Account` | Account string (`"19-2000145399/0800"`), a Czech IBAN (`"CZ65…"`) or `{ prefix, number, bankCode }`. |
| `options` | `PaymentOptions` | See the [Options](#options) table below. |

**Instance methods:** `getSvg()`, `getDataUrl()`, `getQrContent()`, `getIban()`. **Instance properties:** `account`, `payment`, `paymentOptions` (the validated, normalized values).

### Options

| Option | Type | Description |
| --- | --- | --- |
| `message` | `string` | Payment note (`MSG`). Maximum 60 characters after `*`/`%` percent-encoding. |
| `currency` | `string` | ISO 4217 currency code (`CC`). Defaults to `CZK`. |
| `RN` | `string` | Recipient name (`RN`). Up to 35 characters after `*`/`%` percent-encoding. |
| `RF` | `string` | Payment reference for the recipient (`RF`). Up to 16 digits. |
| `DT` | `string` | Due date (`DT`) in `YYYYMMDD` format. |
| `VS` | `string` | Variable symbol (`X-VS`). Up to 10 digits. |
| `SS` | `string` | Specific symbol (`X-SS`). Up to 10 digits. |
| `KS` | `string` | Constant symbol (`X-KS`). Up to 10 digits. |
| `URL` | `string` | URL (`X-URL`). Up to 140 characters after `*`/`%` percent-encoding. |
| `crc32` | `boolean` | When `true`, appends a `CRC32` checksum field to the payload. |
| `validateChecksum` | `boolean` | When `true`, rejects accounts that fail the ČNB mod-11 checksum. |

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
bun run smoke    # verify the built dist/ works in plain Node (CJS + ESM)
bun run lint     # check formatting with Prettier
```

The live demo lives in [`docs/`](./docs) and is published to GitHub Pages from the `main` branch.

## Issues

Found a problem or have a suggestion? Please [open an issue](https://github.com/tedyno/qrplatba/issues).

## License

[MIT](./LICENSE)
