import { EXTRA_CHARS, GLYPH_NAMES } from './fonts.generated';

/** First PDF code of the extra (non-ASCII) characters. */
export const EXTRA_CODE_START = 128;
export const FIRST_CODE = 32;
export const LAST_CODE = EXTRA_CODE_START + EXTRA_CHARS.length - 1;

const FALLBACK_CODE = '?'.charCodeAt(0);

/** Characters that become something drawable before encoding. */
const REPLACEMENTS: Record<string, string> = {
  ' ': ' ', // no-break space (Intl number/date output)
  ' ': ' ', // narrow no-break space (Intl time output)
  ' ': ' ',
  '\t': ' ',
  '‑': '-',
  '−': '-',
};

const CODE_BY_CHAR = new Map<string, number>();
for (let code = FIRST_CODE; code < 127; code += 1) {
  CODE_BY_CHAR.set(String.fromCharCode(code), code);
}
Array.from(EXTRA_CHARS).forEach((char, index) => {
  CODE_BY_CHAR.set(char, EXTRA_CODE_START + index);
});

/** Index into GLYPH_NAMES / font widths for a PDF code, or -1 if unused. */
export function glyphIndexForCode(code: number): number {
  if (code >= FIRST_CODE && code < 127) {
    return code - FIRST_CODE;
  }
  if (code >= EXTRA_CODE_START && code <= LAST_CODE) {
    return 127 - FIRST_CODE + (code - EXTRA_CODE_START);
  }
  return -1;
}

export function glyphNameForCode(code: number): string | null {
  const index = glyphIndexForCode(code);
  return index >= 0 ? GLYPH_NAMES[index] : null;
}

/** The Unicode character a PDF code stands for (for the ToUnicode map). */
export function charForCode(code: number): string | null {
  if (code >= FIRST_CODE && code < 127) {
    return String.fromCharCode(code);
  }
  if (code >= EXTRA_CODE_START && code <= LAST_CODE) {
    return Array.from(EXTRA_CHARS)[code - EXTRA_CODE_START];
  }
  return null;
}

function codeForChar(char: string): number {
  const direct = CODE_BY_CHAR.get(char);
  if (direct !== undefined) {
    return direct;
  }
  // Drop accents the font does not cover (e.g. "ř" → "r"), keep the letter.
  const base = char.normalize('NFD').replace(/\p{M}+/gu, '');
  if (base && base !== char) {
    const baseCode = CODE_BY_CHAR.get(base);
    if (baseCode !== undefined) {
      return baseCode;
    }
  }
  return FALLBACK_CODE;
}

/**
 * Turns text into one-byte PDF codes for the embedded fonts. Characters the
 * fonts do not cover lose their accent or become "?"; control characters
 * (including line breaks) are dropped — lay text out line by line instead.
 */
export function encodeText(text: string): number[] {
  const codes: number[] = [];
  for (const raw of text.normalize('NFC')) {
    const char = REPLACEMENTS[raw] ?? raw;
    if (/\p{Cc}/u.test(char)) {
      continue;
    }
    codes.push(codeForChar(char));
  }
  return codes;
}
