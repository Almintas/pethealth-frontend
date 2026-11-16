import {
  FIRST_CODE,
  LAST_CODE,
  charForCode,
  encodeText,
  glyphIndexForCode,
  glyphNameForCode,
} from './encoding';
import type { EmbeddedFontData } from './fonts.generated';

/**
 * A deliberately small PDF 1.4 writer: A4 pages, two embedded TrueType fonts
 * (regular and bold), text, lines and filled rectangles. Enough for the pet
 * health passport without pulling a PDF library into the app.
 *
 * Coordinates are in points with the origin at the TOP-left of the page
 * (y grows downwards), which is easier for flowing layouts; the writer flips
 * them to PDF's bottom-left origin.
 */

export const A4_WIDTH = 595.28;
export const A4_HEIGHT = 841.89;

export type PdfFontStyle = 'regular' | 'bold';

/** Colour as three 0–255 channels. */
export type PdfColor = readonly [number, number, number];

export type PdfFonts = Record<PdfFontStyle, EmbeddedFontData>;

export type PdfMetadata = {
  title: string;
  author?: string;
  subject?: string;
  /** Fixed in tests so the output is reproducible. */
  createdAt?: Date;
};

type TextOptions = {
  font?: PdfFontStyle;
  size: number;
  color?: PdfColor;
};

const FONT_RESOURCE: Record<PdfFontStyle, string> = {
  regular: 'F1',
  bold: 'F2',
};

const FONT_NAME: Record<PdfFontStyle, string> = {
  regular: 'PHAAAA+DejaVuSans',
  bold: 'PHAAAB+DejaVuSans-Bold',
};

function num(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function colorOperands(color: PdfColor): string {
  return color.map((channel) => num(channel / 255)).join(' ');
}

function hex(codes: number[]): string {
  return codes.map((code) => code.toString(16).padStart(2, '0')).join('');
}

/** PDF text string in UTF-16BE (for the document information dictionary). */
function infoString(text: string): string {
  const units: number[] = [0xfe, 0xff];
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    units.push(unit >> 8, unit & 0xff);
  }
  return `<${hex(units)}>`;
}

function pdfDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return (
    `(D:${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z)`
  );
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toUnicodeCMap(): string {
  const entries: string[] = [];
  for (let code = FIRST_CODE; code <= LAST_CODE; code += 1) {
    const char = charForCode(code);
    if (char === null) {
      continue;
    }
    const unicode = char.charCodeAt(0).toString(16).padStart(4, '0');
    entries.push(`<${code.toString(16).padStart(2, '0')}> <${unicode}>`);
  }
  const blocks: string[] = [];
  for (let start = 0; start < entries.length; start += 100) {
    const chunk = entries.slice(start, start + 100);
    blocks.push(`${chunk.length} beginbfchar\n${chunk.join('\n')}\nendbfchar`);
  }
  return [
    '/CIDInit /ProcSet findresource begin',
    '12 dict begin',
    'begincmap',
    '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
    '/CMapName /PetHealth-UCS def',
    '/CMapType 2 def',
    '1 begincodespacerange',
    '<00> <ff>',
    'endcodespacerange',
    ...blocks,
    'endcmap',
    'CMapName currentdict /CMap defineresource pop',
    'end',
    'end',
  ].join('\n');
}

export class PdfDocument {
  readonly width = A4_WIDTH;
  readonly height = A4_HEIGHT;

  private readonly fonts: PdfFonts;
  private readonly pages: string[][] = [];

  constructor(fonts: PdfFonts) {
    this.fonts = fonts;
  }

  get pageCount(): number {
    return this.pages.length;
  }

  /** Starts a new page; drawing goes to it until the next addPage. */
  addPage(): number {
    this.pages.push([]);
    return this.pages.length - 1;
  }

  private ops(pageIndex?: number): string[] {
    const index = pageIndex ?? this.pages.length - 1;
    const page = this.pages[index];
    if (!page) {
      throw new Error('PdfDocument: call addPage() before drawing');
    }
    return page;
  }

  /** Width of a single line of text in points. */
  measure(text: string, size: number, font: PdfFontStyle = 'regular'): number {
    const widths = this.fonts[font].widths;
    let total = 0;
    for (const code of encodeText(text)) {
      total += widths[glyphIndexForCode(code)] ?? 0;
    }
    return (total * size) / 1000;
  }

  /** Draws one line of text with its baseline at y (measured from the top). */
  text(
    content: string,
    x: number,
    y: number,
    { font = 'regular', size, color = [0, 0, 0] }: TextOptions,
    pageIndex?: number,
  ): void {
    const codes = encodeText(content);
    if (codes.length === 0) {
      return;
    }
    this.ops(pageIndex).push(
      `BT /${FONT_RESOURCE[font]} ${num(size)} Tf ${colorOperands(color)} rg ` +
        `${num(x)} ${num(this.height - y)} Td <${hex(codes)}> Tj ET`,
    );
  }

  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    { width = 0.5, color = [0, 0, 0] }: { width?: number; color?: PdfColor } = {},
    pageIndex?: number,
  ): void {
    this.ops(pageIndex).push(
      `${colorOperands(color)} RG ${num(width)} w ` +
        `${num(x1)} ${num(this.height - y1)} m ${num(x2)} ${num(this.height - y2)} l S`,
    );
  }

  /** Filled rectangle; (x, y) is its top-left corner. */
  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: PdfColor,
    pageIndex?: number,
  ): void {
    this.ops(pageIndex).push(
      `${colorOperands(fill)} rg ${num(x)} ${num(this.height - y - height)} ` +
        `${num(width)} ${num(height)} re f`,
    );
  }

  /** Serialises the document. Streams are left uncompressed on purpose. */
  toBytes(metadata: PdfMetadata): Uint8Array<ArrayBuffer> {
    if (this.pages.length === 0) {
      this.addPage();
    }

    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let length = 0;

    const push = (bytes: Uint8Array) => {
      chunks.push(bytes);
      length += bytes.length;
    };
    const write = (text: string) => push(encoder.encode(text));

    // Object numbers, fixed layout: 1 catalog, 2 pages, 3 info, then fonts,
    // then one content stream + page object per page.
    let nextObject = 4;
    const fontObjects = {} as Record<
      PdfFontStyle,
      { font: number; descriptor: number; file: number }
    >;
    for (const style of ['regular', 'bold'] as const) {
      fontObjects[style] = {
        font: nextObject,
        descriptor: nextObject + 1,
        file: nextObject + 2,
      };
      nextObject += 3;
    }
    const toUnicodeObject = nextObject;
    nextObject += 1;
    const pageObjects = this.pages.map(() => {
      const ids = { content: nextObject, page: nextObject + 1 };
      nextObject += 2;
      return ids;
    });

    const beginObject = (id: number) => {
      offsets[id] = length;
      write(`${id} 0 obj\n`);
    };
    const object = (id: number, body: string) => {
      beginObject(id);
      write(`${body}\nendobj\n`);
    };
    const stream = (id: number, dictionary: string, data: Uint8Array) => {
      beginObject(id);
      write(`<< ${dictionary} /Length ${data.length} >>\nstream\n`);
      push(data);
      write('\nendstream\nendobj\n');
    };

    write('%PDF-1.4\n');
    push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

    object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    object(
      2,
      `<< /Type /Pages /Count ${this.pages.length} /Kids [${pageObjects
        .map((ids) => `${ids.page} 0 R`)
        .join(' ')}] >>`,
    );
    const info = [
      `/Title ${infoString(metadata.title)}`,
      metadata.author ? `/Author ${infoString(metadata.author)}` : '',
      metadata.subject ? `/Subject ${infoString(metadata.subject)}` : '',
      `/Creator ${infoString('PetHealth')}`,
      `/CreationDate ${pdfDate(metadata.createdAt ?? new Date())}`,
    ]
      .filter(Boolean)
      .join(' ');
    object(3, `<< ${info} >>`);

    const differences: string[] = [];
    const widths: string[] = [];
    for (let code = FIRST_CODE; code <= LAST_CODE; code += 1) {
      const name = glyphNameForCode(code);
      if (name) {
        differences.push(`${code} /${name}`);
      }
    }
    for (const style of ['regular', 'bold'] as const) {
      const data = this.fonts[style];
      const ids = fontObjects[style];
      widths.length = 0;
      for (let code = FIRST_CODE; code <= LAST_CODE; code += 1) {
        const index = glyphIndexForCode(code);
        widths.push(String(index >= 0 ? data.widths[index] : 0));
      }
      object(
        ids.font,
        `<< /Type /Font /Subtype /TrueType /BaseFont /${FONT_NAME[style]} ` +
          `/FirstChar ${FIRST_CODE} /LastChar ${LAST_CODE} /Widths [${widths.join(' ')}] ` +
          `/Encoding << /Type /Encoding /Differences [${differences.join(' ')}] >> ` +
          `/FontDescriptor ${ids.descriptor} 0 R /ToUnicode ${toUnicodeObject} 0 R >>`,
      );
      object(
        ids.descriptor,
        `<< /Type /FontDescriptor /FontName /${FONT_NAME[style]} /Flags 32 ` +
          `/FontBBox [${data.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${data.ascent} ` +
          `/Descent ${data.descent} /CapHeight ${data.capHeight} ` +
          `/StemV ${style === 'bold' ? 120 : 80} /FontFile2 ${ids.file} 0 R >>`,
      );
      const fontBytes = base64ToBytes(data.base64);
      stream(ids.file, `/Length1 ${fontBytes.length}`, fontBytes);
    }
    stream(toUnicodeObject, '', encoder.encode(toUnicodeCMap()));

    const resources =
      `<< /Font << /${FONT_RESOURCE.regular} ${fontObjects.regular.font} 0 R ` +
      `/${FONT_RESOURCE.bold} ${fontObjects.bold.font} 0 R >> >>`;
    this.pages.forEach((ops, index) => {
      const ids = pageObjects[index];
      stream(ids.content, '', encoder.encode(ops.join('\n')));
      object(
        ids.page,
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(this.width)} ${num(this.height)}] ` +
          `/Resources ${resources} /Contents ${ids.content} 0 R >>`,
      );
    });

    const xrefOffset = length;
    const objectCount = nextObject;
    const xref = ['xref', `0 ${objectCount}`, '0000000000 65535 f '];
    for (let id = 1; id < objectCount; id += 1) {
      xref.push(`${String(offsets[id]).padStart(10, '0')} 00000 n `);
    }
    write(`${xref.join('\n')}\n`);
    write(
      `trailer\n<< /Size ${objectCount} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
    );

    const output = new Uint8Array(length);
    let position = 0;
    for (const chunk of chunks) {
      output.set(chunk, position);
      position += chunk.length;
    }
    return output;
  }
}
