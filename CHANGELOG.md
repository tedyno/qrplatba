# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.1.1] - 2026-06-10

### Changed

- Updated `qrcode-generator` to v2 and the TypeScript toolchain to v6 (build target raised to ES2020)

## [2.1.0] - 2026-06-10

### Changed

- Package renamed to **`qrplatba`** (published under the new, unscoped name). The previous `@tedyno/cz-qr-payment` package is deprecated and points here; the API is unchanged.

### Added

- Dual **ESM + CommonJS** build with an `exports` map and `sideEffects: false` for better tree-shaking and native ESM support
- Continuous-integration workflow running lint, tests and build on every push and pull request
- Dependabot configuration for npm and GitHub Actions updates

## [2.0.1] - 2026-06-10

### Changed

- Test runner switched from Jest to the built-in `bun test`; dropped the `jest`, `ts-jest`, `@types/jest` and `ts-node` dev dependencies

## [2.0.0] - 2026-06-10

### Added

- `currency` option (`CC`), defaulting to `CZK`, validated as a 3-letter ISO 4217 code
- `crc32` option to append a SPAYD `CRC32` checksum field
- `getDataUrl()` / `createQrPaymentDataUrl()` to render the QR code as a data URL
- `createQrPaymentContent()` to obtain the raw SPAYD string
- `ValidationError` is exported and thrown for all invalid input

### Changed

- **BREAKING**: validation no longer throws `ZodError`; it throws the exported `ValidationError` instead
- `MSG` and `X-URL` values are now percent-encoded (`*` → `%2A`, `%` → `%25`) instead of rejecting `*`
- Package now ships only `dist/` via the `files` whitelist; `dist/` is no longer committed and is rebuilt on publish

### Removed

- `cdigit` dependency; IBAN check digits are now computed with a small inline mod-97 routine
- `zod` dependency; validation is now done with small hand-written checks (drops ~85% of the package's install footprint)

## [1.3.0] - 2026-06-09

### Fixed

- `DT` (due date) now validates and emits the SPAYD `YYYYMMDD` format instead of requiring an ISO 8601 datetime that produced an invalid QR payload
- `DT` rejects impossible calendar dates (e.g. `20230231`)

### Added

- `MSG` length validation (maximum 60 characters per SPAYD)

## [1.2.0] - 2024-11-19

### Added

- types for inputs

## [1.1.0] - 2024-11-19

### Added

- support for nullish amount
- support for zero value
- changelog

## [1.0.1] - 2023-11-18

### Added

- QR payment created
