import type { MethodHandler } from '../../types';

export type ImageCollection = {
  generateBaseImage: () => Promise<ImageBitmap>;
};

const BLOCK_SIZE = 8;
const DELTA = 25;
const REPEAT = 5;
const ECC_BLOCK_SIZE = 16;
const MIN_IMAGE_SIDE = 512;
const MAX_IMAGE_SIDE = 8192;

function clamp(v: number) {
  return Math.max(0, Math.min(255, v));
}

function shiftBlockBrightnessDiff(
  data: Uint8ClampedArray,
  width: number,
  startX: number,
  startY: number,
  size: number,
  delta: number,
) {
  const half = Math.floor(size / 2);
  for (let y = startY; y < startY + size; y++) {
    for (let x = startX; x < startX + half; x++) {
      const i = (y * width + x) * 4;
      data[i] = clamp(data[i] + delta);
      data[i + 1] = clamp(data[i + 1] + delta);
      data[i + 2] = clamp(data[i + 2] + delta);
    }
    for (let x = startX + half; x < startX + size; x++) {
      const i = (y * width + x) * 4;
      data[i] = clamp(data[i] - delta);
      data[i + 1] = clamp(data[i + 1] - delta);
      data[i + 2] = clamp(data[i + 2] - delta);
    }
  }
}

function measureBlockBrightnessDiff(
  data: Uint8ClampedArray,
  width: number,
  startX: number,
  startY: number,
  size: number,
): number {
  const half = Math.floor(size / 2);
  let leftSum = 0;
  let rightSum = 0;
  for (let y = startY; y < startY + size; y++) {
    for (let x = startX; x < startX + half; x++) {
      const i = (y * width + x) * 4;
      leftSum += data[i] + data[i + 1] + data[i + 2];
    }
    for (let x = startX + half; x < startX + size; x++) {
      const i = (y * width + x) * 4;
      rightSum += data[i] + data[i + 1] + data[i + 2];
    }
  }
  return leftSum - rightSum;
}

function bitsToUint8(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length * 8; i++) {
    const byteIndex = Math.floor(i / 8);
    bytes[byteIndex] |= bits[i] << (7 - (i % 8));
  }
  return bytes;
}

function pickImageSize(totalBits: number) {
  const minBlocks = totalBits * REPEAT;
  const side = Math.ceil(Math.sqrt(minBlocks)) * BLOCK_SIZE + BLOCK_SIZE;
  return Math.max(MIN_IMAGE_SIDE, side);
}

export function encode(
  input: Uint8Array,
  collection: ImageCollection,
): Promise<File> {
  const payloadWithLength = new Uint8Array(4 + input.length);
  new DataView(payloadWithLength.buffer).setUint32(0, input.length, false);
  payloadWithLength.set(input, 4);

  const padLen = ECC_BLOCK_SIZE - (payloadWithLength.length % ECC_BLOCK_SIZE);
  const totalPaddedLen =
    padLen === ECC_BLOCK_SIZE
      ? payloadWithLength.length
      : payloadWithLength.length + padLen;
  const paddedPayload = new Uint8Array(totalPaddedLen);
  paddedPayload.set(payloadWithLength);

  const blocks: Uint8Array[] = [];
  for (let i = 0; i < paddedPayload.length; i += ECC_BLOCK_SIZE) {
    blocks.push(paddedPayload.slice(i, i + ECC_BLOCK_SIZE));
  }

  const parity = new Uint8Array(ECC_BLOCK_SIZE);
  for (const b of blocks) {
    for (let i = 0; i < b.length; i++) parity[i] ^= b[i];
  }
  blocks.push(parity);

  const bits: number[] = [];
  for (const b of blocks) {
    for (const byte of b) {
      for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
    }
  }

  const imgSize = pickImageSize(bits.length);

  if (imgSize > MAX_IMAGE_SIDE) {
    throw new Error('Payload too large for image steganography.');
  }

  return collection.generateBaseImage().then(async (imgBitmap) => {
    const canvas = new OffscreenCanvas(imgSize, imgSize);
    const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    ctx.drawImage(imgBitmap, 0, 0, imgSize, imgSize);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const blocksX = Math.floor(canvas.width / BLOCK_SIZE);
    const blocksY = Math.floor(canvas.height / BLOCK_SIZE);
    const totalBlocks = blocksX * blocksY;
    const maxBits = Math.floor(totalBlocks / REPEAT);

    for (let i = 0; i < bits.length; i++) {
      const bit = bits[i];
      for (let r = 0; r < REPEAT; r++) {
        const blockIndex = i + r * maxBits;
        const bx = blockIndex % blocksX;
        const by = Math.floor(blockIndex / blocksX);
        shiftBlockBrightnessDiff(
          data,
          canvas.width,
          bx * BLOCK_SIZE,
          by * BLOCK_SIZE,
          BLOCK_SIZE,
          bit ? DELTA : -DELTA,
        );
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return new File([blob], `stego_${Date.now()}.png`, {
      type: 'image/png',
    });
  });
}

export async function decode(file: File): Promise<Uint8Array> {
  const imgBitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  ctx.drawImage(imgBitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const blocksX = Math.floor(canvas.width / BLOCK_SIZE);
  const blocksY = Math.floor(canvas.height / BLOCK_SIZE);
  const totalBlocks = blocksX * blocksY;
  const maxBits = Math.floor(totalBlocks / REPEAT);
  const bits: number[] = [];

  for (let i = 0; i < maxBits; i++) {
    let score = 0;
    for (let r = 0; r < REPEAT; r++) {
      const blockIndex = i + r * maxBits;
      const bx = blockIndex % blocksX;
      const by = Math.floor(blockIndex / blocksX);
      score += measureBlockBrightnessDiff(
        data,
        canvas.width,
        bx * BLOCK_SIZE,
        by * BLOCK_SIZE,
        BLOCK_SIZE,
      );
    }
    bits.push(score > 0 ? 1 : 0);
  }

  const decodedBytes = bitsToUint8(bits);

  const dataView = new DataView(
    decodedBytes.buffer,
    decodedBytes.byteOffset,
    decodedBytes.byteLength,
  );
  const payloadLen = dataView.getUint32(0, false);

  if (payloadLen > decodedBytes.length) {
    throw new Error(
      'Invalid payload length. Decoding failed or image corrupted.',
    );
  }

  const payloadWithLengthLen = 4 + payloadLen;
  const padLen = ECC_BLOCK_SIZE - (payloadWithLengthLen % ECC_BLOCK_SIZE);
  const totalPaddedLen =
    padLen === ECC_BLOCK_SIZE
      ? payloadWithLengthLen
      : payloadWithLengthLen + padLen;
  const expectedTotalLen = totalPaddedLen + ECC_BLOCK_SIZE;

  if (decodedBytes.length < expectedTotalLen) {
    throw new Error(
      'Image capacity too small for the extracted payload length.',
    );
  }

  const blocks: Uint8Array[] = [];
  for (let i = 0; i < expectedTotalLen; i += ECC_BLOCK_SIZE) {
    blocks.push(decodedBytes.slice(i, i + ECC_BLOCK_SIZE));
  }

  const parityBlock = blocks.pop() as Uint8Array;

  const checkXor = new Uint8Array(ECC_BLOCK_SIZE);
  for (const b of blocks) {
    for (let i = 0; i < ECC_BLOCK_SIZE; i++) checkXor[i] ^= b[i];
  }

  let hasError = false;
  for (let i = 0; i < ECC_BLOCK_SIZE; i++) {
    if (checkXor[i] !== parityBlock[i]) {
      hasError = true;
      break;
    }
  }

  if (hasError) {
    console.warn('ECC checksum failed. The payload might be corrupted.');
  }

  const reconstructedPayload = new Uint8Array(payloadLen);
  let byteIndex = 0;
  for (let i = 0; i < blocks.length; i++) {
    for (let j = 0; j < ECC_BLOCK_SIZE; j++) {
      if (byteIndex >= 4 && byteIndex < 4 + payloadLen) {
        reconstructedPayload[byteIndex - 4] = blocks[i][j];
      }
      byteIndex++;
    }
  }

  return reconstructedPayload;
}

export const createImageHandler = (
  collection: ImageCollection,
  method: Omit<MethodHandler<File>, 'encode' | 'decode'>,
): MethodHandler<File> => ({
  ...method,
  encode: (data) => encode(data, collection),
  decode: (data) => decode(data),
});
