const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function bytesToBase58(bytes: Uint8Array): string {
  let zeros = 0;
  for (const b of bytes) {
    if (b !== 0) break;
    zeros++;
  }

  let num = bytes.reduce((n, b) => n * 256n + BigInt(b), 0n);
  let result = '';
  while (num > 0n) {
    result = BASE58_ALPHABET[Number(num % 58n)] + result;
    num /= 58n;
  }

  return '1'.repeat(zeros) + result;
}

export function base58ToBytes(str: string): Uint8Array {
  let zeros = 0;
  for (const c of str) {
    if (c !== '1') break;
    zeros++;
  }

  let num = 0n;
  for (const c of str) {
    const value = BASE58_ALPHABET.indexOf(c);
    if (value === -1) throw new Error(`Invalid base58 character: ${c}`);
    num = num * 58n + BigInt(value);
  }

  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num & 0xffn));
    num >>= 8n;
  }

  return new Uint8Array([...new Array(zeros).fill(0), ...bytes]);
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
