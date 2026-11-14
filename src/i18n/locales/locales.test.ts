import { describe, expect, it } from 'vitest';
import en from './en';
import lt from './lt';

type Messages = Record<string, unknown>;

function flatten(messages: Messages, prefix = ''): Record<string, unknown> {
  return Object.entries(messages).reduce<Record<string, unknown>>(
    (result, [key, value]) => {
      const path = `${prefix}${key}`;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, flatten(value as Messages, `${path}.`));
      } else {
        result[path] = value;
      }
      return result;
    },
    {},
  );
}

/*
 * Breed names are Lithuanian-only on purpose: English falls back to the
 * canonical (English) breed label via `defaultValue`.
 */
const LT_ONLY_PREFIX = /^\w+\.breedNames\./;
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

const flatEn = flatten(en as Messages);
const flatLt = flatten(lt as Messages);

describe('translations', () => {
  it('has every English key in Lithuanian', () => {
    expect(Object.keys(flatEn).filter((key) => !(key in flatLt))).toEqual([]);
  });

  it('has every Lithuanian key in English', () => {
    expect(
      Object.keys(flatLt).filter(
        (key) =>
          !(key in flatEn) &&
          !LT_ONLY_PREFIX.test(key) &&
          // English only needs _one/_other; Lithuanian adds _few/_many.
          !(PLURAL_SUFFIX.test(key) && `${key.replace(PLURAL_SUFFIX, '')}_other` in flatEn),
      ),
    ).toEqual([]);
  });

  it('has no empty strings', () => {
    const empty = [...Object.entries(flatEn), ...Object.entries(flatLt)]
      .filter(([, value]) => typeof value === 'string' && value.trim() === '')
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('defines every Lithuanian plural form used for whole numbers', () => {
    // Lithuanian: 1 pacientas (one), 2 pacientai (few), 10 pacientų (other).
    const required = new Intl.PluralRules('lt').resolvedOptions().pluralCategories;
    const pluralBases = new Set(
      Object.keys(flatLt)
        .filter((key) => /_(one|few|many|other)$/.test(key))
        .map((key) => key.replace(/_(one|few|many|other)$/, '')),
    );
    const missing = [...pluralBases].flatMap((base) =>
      required
        .filter((category) => !(`${base}_${category}` in flatLt))
        .map((category) => `${base}_${category}`),
    );
    expect(missing).toEqual([]);
  });

  it('uses the same {{placeholders}} in both languages', () => {
    const placeholders = (value: unknown) =>
      typeof value === 'string'
        ? [...value.matchAll(/{{\s*(\w+)\s*}}/g)].map((match) => match[1]).sort()
        : [];
    const mismatched = Object.keys(flatEn).filter(
      (key) =>
        key in flatLt &&
        placeholders(flatEn[key]).join() !== placeholders(flatLt[key]).join(),
    );
    expect(mismatched).toEqual([]);
  });
});
