const crc32Table: number[] = (() => {
  const table = new Array<number>(256);

  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }

  return table;
})();

/**
 * Computes the CRC32 checksum of a string and returns it as the 8-character
 * uppercase hexadecimal value used by the SPAYD `CRC32` field.
 */
export const crc32Hex = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xff];
  }

  crc = (crc ^ 0xffffffff) >>> 0;

  return crc.toString(16).toUpperCase().padStart(8, '0');
};
