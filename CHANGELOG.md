
# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - yyyy-mm-dd

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
