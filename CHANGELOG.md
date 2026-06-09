# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - yyyy-mm-dd

### Added

- `currency` option (`CC`), defaulting to `CZK`, validated as a 3-letter ISO 4217 code
- `crc32` option to append a SPAYD `CRC32` checksum field
- `getDataUrl()` / `createQrPaymentDataUrl()` to render the QR code as a data URL
- `createQrPaymentContent()` to obtain the raw SPAYD string

### Changed

- `MSG` and `X-URL` values are now percent-encoded (`*` → `%2A`, `%` → `%25`) instead of rejecting `*`
- Package now ships only `dist/` via the `files` whitelist; `dist/` is no longer committed and is rebuilt on publish

### Removed

- `cdigit` dependency; IBAN check digits are now computed with a small inline mod-97 routine

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
