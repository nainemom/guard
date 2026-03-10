import type { MethodHandler } from '../../types';

export type SteganographyCollection = {
  conjuctions: string[];
  finishers: string[];
  templates: (string | string[])[][];
};

/**
 * Treats a byte array as a little-endian number and converts it to a bigint.
 * Example: [0x03, 0x01] means 3 + 1*256 = 259n
 */
function bytesToBigInt(bytes: Uint8Array): bigint {
  let n = 0n;
  // Walk from the last byte to the first (most significant to least significant)
  for (let i = bytes.length - 1; i >= 0; i--) {
    // Shift existing value up by one byte (multiply by 256) and add current byte
    n = n * 256n + BigInt(bytes[i]);
  }
  return n;
}

/**
 * Converts a bigint back to a little-endian byte array.
 * The reverse of bytesToBigInt.
 */
function bigIntToBytes(n: bigint): Uint8Array {
  const bytes: number[] = [];
  while (n > 0n) {
    // Take the lowest byte (remainder of dividing by 256)
    bytes.push(Number(n % 256n));
    // Remove the lowest byte (integer division by 256)
    n = n / 256n;
  }
  return new Uint8Array(bytes);
}

/**
 * Counts how many zero bytes are at the end of the data.
 * We need this because bigint conversion drops trailing zeros,
 * so we store the count separately to restore them later.
 */
function countTrailingZeros(data: Uint8Array): number {
  let count = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i] === 0) count++;
    else break;
  }
  return count;
}

/**
 * Encodes part of the number `n` into a single sentence using a template.
 * Each word-list slot in the template "consumes" some digits from `n`
 * (via modulo/division), picking a word. Literal strings are copied as-is.
 * Returns the sentence text and the remaining (unconsumed) part of `n`.
 */
function encodeSentence(
  n: bigint,
  template: (string | string[])[],
): { sentence: string; n: bigint } {
  const parts: string[] = [];

  for (const element of template) {
    if (typeof element === 'string') {
      // Literal text — just copy it
      parts.push(element);
    } else {
      // Word list — pick a word using modulo, then divide to consume those digits
      const listSize = BigInt(element.length);
      const wordIndex = Number(n % listSize);
      n = n / listSize;
      parts.push(element[wordIndex]);
    }
  }

  return { sentence: parts.join(''), n };
}

/**
 * Tries to match the beginning of `text` (starting at `textPos`) against
 * a template format. Walks through format elements one by one:
 *   - Literal strings must match exactly
 *   - Word lists try each word (longest first to avoid partial matches)
 *
 * Returns the matched word indices and the position after the match,
 * or null if no match is possible.
 *
 * This is recursive: each element calls itself for the rest of the format.
 * It backtracks on word lists — if one word matches but the rest of the
 * format fails, it tries the next word.
 */
function tryParsePrefix(
  text: string,
  format: (string | string[])[],
  textPos: number,
  formatIdx: number,
  indices: number[],
): { indices: number[]; endPos: number } | null {
  // All format elements matched — success
  if (formatIdx >= format.length) {
    return { indices, endPos: textPos };
  }

  const element = format[formatIdx];

  if (typeof element === 'string') {
    // Literal — must match exactly at current position
    if (text.startsWith(element, textPos)) {
      return tryParsePrefix(
        text,
        format,
        textPos + element.length,
        formatIdx + 1,
        indices,
      );
    }
    return null;
  }

  // Word list — sort by length descending so "خوشمزه‌ترین" is tried before "خوش"
  const sorted = element
    .map((word, idx) => ({ word, idx }))
    .sort((a, b) => b.word.length - a.word.length);

  for (const { word, idx } of sorted) {
    if (text.startsWith(word, textPos)) {
      // This word matches — try to match the rest of the format
      const result = tryParsePrefix(
        text,
        format,
        textPos + word.length,
        formatIdx + 1,
        [...indices, idx],
      );
      // If the rest matched too, we're done. Otherwise try the next word.
      if (result !== null) return result;
    }
  }

  return null;
}

/**
 * Quick check: can any template in the collection match the text
 * starting at position `pos`? Used to verify that after a conjunction,
 * another valid sentence follows.
 */
function canParseSentenceAt(
  text: string,
  pos: number,
  templates: (string | string[])[][],
): boolean {
  for (let t = 0; t < templates.length; t++) {
    if (tryParsePrefix(text, templates[t], pos, 0, []) !== null) return true;
  }
  return false;
}

/**
 * Encodes raw bytes into natural-language text using a collection's
 * templates and conjunctions.
 *
 * How it works:
 * 1. Strip trailing zero bytes and prepend their count as the first byte
 * 2. Convert the byte array into one big number
 * 3. Repeatedly extract digits from that number to pick templates,
 *    words within templates, and conjunctions between sentences
 * 4. Concatenate everything into the output string
 *
 * This is essentially converting a number from base-256 into a
 * "mixed-radix" representation where each digit's base depends on
 * the size of the word list or template list at that position.
 */
export function encode(
  data: Uint8Array,
  collection: SteganographyCollection,
): string {
  if (data.length === 0) return '';

  const { templates, conjuctions, finishers } = collection;

  // Strip trailing zeros and remember how many there were
  const trailingZeros = countTrailingZeros(data);
  const stripped = data.slice(0, data.length - trailingZeros);

  // Prepend the trailing zero count so the decoder can restore them
  const payload = new Uint8Array(stripped.length + 1);
  payload[0] = trailingZeros;
  payload.set(stripped, 1);

  // Turn the whole byte array into a single big number
  let n = bytesToBigInt(payload);

  const hasConj = conjuctions.length > 0;
  const conjCount = hasConj ? BigInt(conjuctions.length) : 0n;
  const hasFinishers = finishers.length > 0;
  const finisherCount = hasFinishers ? BigInt(finishers.length) : 0n;

  // Consume finisher index first (least-significant bits).
  // It will be appended at the very end of the output.
  let finisherIndex = 0;
  if (hasFinishers) {
    finisherIndex = Number(n % finisherCount);
    n = n / finisherCount;
  }

  const parts: string[] = [];
  let isFirstSentence = true;
  let sentenceIndex = 0;

  // Keep generating sentences until the entire number is consumed
  while (n > 0n) {
    // Between sentences, pick a conjunction (except before the first sentence)
    if (!isFirstSentence && hasConj) {
      const conjIndex = Number(n % conjCount);
      n = n / conjCount;
      parts.push(conjuctions[conjIndex]);
    }

    // Pick template deterministically: rotate starting point for variety,
    // but verify the decoder would identify the same template (no ambiguity).
    let encoded: { sentence: string; n: bigint } | null = null;
    for (let offset = 0; offset < templates.length; offset++) {
      const ti = (sentenceIndex + offset) % templates.length;
      const result = encodeSentence(n, templates[ti]);

      // Check: would any lower-index template also parse this sentence?
      let ambiguous = false;
      for (let t = 0; t < ti; t++) {
        if (tryParsePrefix(result.sentence, templates[t], 0, 0, []) !== null) {
          ambiguous = true;
          break;
        }
      }

      if (!ambiguous) {
        encoded = result;
        break;
      }
    }

    // Template 0 is always unambiguous (no lower-index template exists),
    // so this fallback should never be needed, but just in case:
    if (!encoded) {
      encoded = encodeSentence(n, templates[0]);
    }

    parts.push(encoded.sentence);
    n = encoded.n;
    isFirstSentence = false;
    sentenceIndex++;
  }

  if (hasFinishers) {
    parts.push(finishers[finisherIndex]);
  }

  return parts.join('');
}

/**
 * Decodes natural-language text back into raw bytes.
 * This is the reverse of encode():
 *
 * 1. Parse the text into a sequence of (sentence, conjunction) pairs
 *    by trying every template at the current position
 * 2. For each parsed sentence, recover which template was used and
 *    which word index was chosen for each word-list slot
 * 3. Reconstruct the big number by replaying the encode decisions
 *    in reverse order (last sentence first)
 * 4. Convert the big number back to bytes and restore trailing zeros
 */
export function decode(
  text: string,
  collection: SteganographyCollection,
): Uint8Array {
  if (text.length === 0) return new Uint8Array(0);

  const { templates, conjuctions, finishers } = collection;
  const hasConj = conjuctions.length > 0;
  const conjCount = hasConj ? BigInt(conjuctions.length) : 0n;
  const hasFinishers = finishers.length > 0;
  const finisherCount = hasFinishers ? BigInt(finishers.length) : 0n;

  // Sort conjunctions by length descending so longer ones are tried first
  const conjSorted = conjuctions
    .map((c, idx) => ({ text: c, idx }))
    .sort((a, b) => b.text.length - a.text.length);

  // Sort finishers by length descending so "..." is tried before "."
  const finisherSorted = finishers
    .map((f, idx) => ({ text: f, idx }))
    .sort((a, b) => b.text.length - a.text.length);

  // --- Phase 0: Strip finisher from end of text ---
  let finisherIndex = 0;
  let body = text;
  if (hasFinishers) {
    for (const { text: fText, idx } of finisherSorted) {
      if (text.endsWith(fText)) {
        finisherIndex = idx;
        body = text.slice(0, text.length - fText.length);
        break;
      }
    }
  }

  // --- Phase 1: Parse text into sentences and conjunctions ---

  const parsedSentences: { templateIndex: number; wordIndices: number[] }[] =
    [];
  const conjIndices: number[] = [];
  let pos = 0;

  while (pos < body.length) {
    let sentenceFound = false;

    // Try every template to see which one matches at current position
    for (let t = 0; t < templates.length; t++) {
      const result = tryParsePrefix(body, templates[t], pos, 0, []);
      if (result === null) continue;

      const nextPos = result.endPos;

      // If we've consumed all text, this is the last sentence
      if (nextPos >= body.length) {
        parsedSentences.push({
          templateIndex: t,
          wordIndices: result.indices,
        });
        pos = nextPos;
        sentenceFound = true;
        break;
      }

      if (hasConj) {
        // After the sentence, look for a conjunction followed by another sentence
        let conjMatched = false;
        for (const { text: conjText, idx } of conjSorted) {
          if (body.startsWith(conjText, nextPos)) {
            const afterConj = nextPos + conjText.length;
            // Only accept if another valid sentence follows the conjunction
            if (canParseSentenceAt(body, afterConj, templates)) {
              parsedSentences.push({
                templateIndex: t,
                wordIndices: result.indices,
              });
              conjIndices.push(idx);
              pos = afterConj;
              sentenceFound = true;
              conjMatched = true;
              break;
            }
          }
        }
        if (conjMatched) break;
      } else {
        // No conjunctions in this collection — sentences are directly concatenated
        if (canParseSentenceAt(body, nextPos, templates)) {
          parsedSentences.push({
            templateIndex: t,
            wordIndices: result.indices,
          });
          pos = nextPos;
          sentenceFound = true;
          break;
        }
      }
    }

    if (!sentenceFound) break;
  }

  // --- Phase 2: Reconstruct the big number from parsed data ---
  // We walk sentences in reverse because encode() produced them
  // from least-significant to most-significant digits.
  // For each sentence, we rebuild the number like reading digits:
  //   n = n * base + digit (for each word slot and template choice)

  let n = 0n;

  for (let i = parsedSentences.length - 1; i >= 0; i--) {
    // Restore the conjunction digit (except for the last sentence which has none after it)
    if (i < parsedSentences.length - 1 && hasConj) {
      n = n * conjCount + BigInt(conjIndices[i]);
    }

    const { wordIndices } = parsedSentences[i];
    const template = templates[parsedSentences[i].templateIndex];

    // Collect word-list slots from the template (skip literal strings)
    const wordSlots: { listSize: number; wordIndex: number }[] = [];
    let wi = 0;
    for (const element of template) {
      if (typeof element !== 'string') {
        wordSlots.push({
          listSize: element.length,
          wordIndex: wordIndices[wi],
        });
        wi++;
      }
    }

    // Restore word digits in reverse order (mirrors the encode modulo/divide loop)
    for (let j = wordSlots.length - 1; j >= 0; j--) {
      n = n * BigInt(wordSlots[j].listSize) + BigInt(wordSlots[j].wordIndex);
    }
  }

  // Restore finisher digit (it was consumed first in encode, so restored last)
  if (hasFinishers) {
    n = n * finisherCount + BigInt(finisherIndex);
  }

  // --- Phase 3: Convert big number back to bytes ---
  // Layout: [trailingZeroCount, salt (SALT_SIZE bytes), data...]

  const bytes = bigIntToBytes(n);
  if (bytes.length === 0) return new Uint8Array(0);

  // Skip the zeros to get the actual data
  const trailingZeros = bytes[0];
  const strippedData = bytes.slice(1);

  // Reconstruct the original data by appending the trailing zeros back
  const result = new Uint8Array(strippedData.length + trailingZeros);
  result.set(strippedData);
  return result;
}

export const createSteganographyHandler = (
  collection: SteganographyCollection,
  method: Omit<MethodHandler<string>, 'encode' | 'decode'>,
): MethodHandler<string> => ({
  ...method,
  decode: (data) => Promise.resolve(decode(data, collection)),
  encode: (data) => Promise.resolve(encode(data, collection)),
});
