import { crc32Hex } from './crc32';

describe('crc32Hex', () => {
  it('returns 8 uppercase hex characters', () => {
    expect(crc32Hex('test')).toMatch(/^[0-9A-F]{8}$/);
  });

  it('matches a known CRC32 value', () => {
    // crc32('123456789') === 0xCBF43926
    expect(crc32Hex('123456789')).toEqual('CBF43926');
  });

  it('left-pads short checksums to 8 characters', () => {
    expect(crc32Hex('').length).toEqual(8);
  });
});
