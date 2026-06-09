import { describe, it, expect } from 'bun:test';
import { calculateCheckDigits, getIban } from './iban';

describe('iban', () => {
  it('calculateCheckDigits', () => {
    expect(
      calculateCheckDigits({
        bankCode: '0800',
        prefix: '000000',
        number: '123123',
      }),
    ).toEqual('43');
  });

  it('getIban', () => {
    expect(
      getIban({
        bankCode: '3030',
        prefix: '000000',
        number: '1263035066',
      }),
    ).toEqual('CZ2130300000001263035066');
  });

  it.each([
    ['0800', '000000', '0000123123', 'CZ2708000000000000123123'],
    ['2010', '000000', '2901360000', 'CZ2220100000002901360000'],
    ['0100', '000123', '1234567891', 'CZ5701000001231234567891'],
    ['0800', '000019', '2000145399', 'CZ6508000000192000145399'],
  ])('getIban for %s/%s/%s', (bankCode, prefix, number, expected) => {
    expect(getIban({ bankCode, prefix, number })).toEqual(expected);
  });
});
