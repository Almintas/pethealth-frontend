import { describe, expect, it } from 'vitest';
import { encodeText, charForCode } from './encoding';
import { DEJAVU_SANS } from './fonts.generated';
import { PdfDocument } from './pdf-document';

const latin1 = new TextDecoder('latin1');

function pdfText(bytes: Uint8Array): string {
  return latin1.decode(bytes);
}

/** Hex string as the writer puts it in a content stream. */
function shownHex(text: string): string {
  return encodeText(text)
    .map((code) => code.toString(16).padStart(2, '0'))
    .join('');
}

function render(draw: (pdf: PdfDocument) => void): string {
  const pdf = new PdfDocument(DEJAVU_SANS);
  draw(pdf);
  return pdfText(
    pdf.toBytes({ title: 'Test', createdAt: new Date('2026-11-16T10:00:00Z') }),
  );
}

describe('encodeText', () => {
  it('maps every Lithuanian letter to its own code and back', () => {
    const letters = 'ĄąČčĘęĖėĮįŠšŲųŪūŽž';
    const codes = encodeText(letters);
    expect(new Set(codes).size).toBe(letters.length);
    expect(codes.map((code) => charForCode(code)).join('')).toBe(letters);
  });

  it('keeps ASCII as is', () => {
    expect(encodeText('Rex 12')).toEqual([82, 101, 120, 32, 49, 50]);
  });

  it('drops accents the font lacks and replaces unknown characters', () => {
    expect(encodeText('ř')).toEqual(encodeText('r'));
    expect(encodeText('貓')).toEqual(encodeText('?'));
  });

  it('turns no-break spaces into spaces and drops control characters', () => {
    expect(encodeText('a b c\n')).toEqual(encodeText('a b c'));
  });

  it('handles decomposed input', () => {
    expect(encodeText('ę')).toEqual(encodeText('ę'));
  });
});

describe('PdfDocument', () => {
  it('writes a well-formed PDF whose xref points at every object', () => {
    const output = render((pdf) => {
      pdf.addPage();
      pdf.text('Sveikatos pasas', 40, 40, { size: 12 });
      pdf.addPage();
      pdf.line(40, 40, 200, 40);
      pdf.rect(40, 50, 100, 20, [37, 99, 235]);
    });

    expect(output.startsWith('%PDF-1.4\n')).toBe(true);
    expect(output.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(output).toContain('/Count 2');

    const startxref = Number(/startxref\n(\d+)\n%%EOF/.exec(output)?.[1]);
    expect(output.slice(startxref, startxref + 4)).toBe('xref');

    const [, size] = /\/Size (\d+)/.exec(output) ?? [];
    const entries = output
      .slice(startxref)
      .split('\n')
      .filter((line) => / 00000 n $/.test(line));
    expect(entries).toHaveLength(Number(size) - 1);
    entries.forEach((entry, index) => {
      const offset = Number(entry.slice(0, 10));
      expect(output.slice(offset, offset + 12)).toMatch(new RegExp(`^${index + 1} 0 obj\\n`));
    });
  });

  it('embeds both fonts with a ToUnicode map', () => {
    const output = render((pdf) => {
      pdf.addPage();
      pdf.text('Ąžuolas', 40, 40, { size: 12, font: 'bold' });
    });

    expect(output).toContain('/BaseFont /PHAAAA+DejaVuSans ');
    expect(output).toContain('/BaseFont /PHAAAB+DejaVuSans-Bold ');
    expect(output.match(/\/FontFile2 \d+ 0 R/g)).toHaveLength(2);
    expect(output).toContain('/ToUnicode');
    expect(output).toContain('<0104>'); // Ą
    expect(output).toContain(`<${shownHex('Ąžuolas')}> Tj`);
    expect(output).toContain('/F2 12 Tf');
  });

  it('measures text with the font metrics', () => {
    const pdf = new PdfDocument(DEJAVU_SANS);
    const narrow = pdf.measure('iiii', 10);
    const wide = pdf.measure('WWWW', 10);
    expect(narrow).toBeGreaterThan(0);
    expect(wide).toBeGreaterThan(narrow);
    expect(pdf.measure('W', 10, 'bold')).toBeGreaterThan(pdf.measure('W', 10));
    expect(pdf.measure('ą', 10)).toBeCloseTo(pdf.measure('a', 10), 5);
  });

  it('requires a page before drawing', () => {
    const pdf = new PdfDocument(DEJAVU_SANS);
    expect(() => pdf.text('x', 0, 0, { size: 10 })).toThrow(/addPage/);
  });
});
