import { PdfDocument } from './pdf-document';
import type { PdfColor, PdfFontStyle, PdfFonts } from './pdf-document';

/** Language-neutral description of the passport; see build-passport-model.ts. */
export type PassportFactsSection = {
  kind: 'facts';
  heading: string;
  rows: ReadonlyArray<readonly [label: string, value: string]>;
};

export type PassportTableSection = {
  kind: 'table';
  heading: string;
  /** Relative column widths; they are scaled to the page width. */
  columns: ReadonlyArray<{ label: string; width: number }>;
  /** Cell text; "\n" starts a new line inside a cell. */
  rows: ReadonlyArray<ReadonlyArray<string>>;
  emptyText: string;
};

export type PassportSection = PassportFactsSection | PassportTableSection;

export type PassportModel = {
  brand: string;
  title: string;
  petName: string;
  subtitle: string;
  generatedLine: string;
  sections: readonly PassportSection[];
  disclaimer: string;
  footerLabel: string;
  pageLabel: (page: number, total: number) => string;
};

const COLORS = {
  primary: [37, 99, 235],
  text: [23, 32, 51],
  secondary: [85, 101, 122],
  border: [220, 227, 234],
  headerFill: [239, 246, 255],
  zebra: [248, 250, 252],
  white: [255, 255, 255],
  onPrimaryMuted: [219, 234, 254],
} satisfies Record<string, PdfColor>;

const MARGIN_X = 42;
const MARGIN_TOP = 42;
const FOOTER_HEIGHT = 40;
const BODY_SIZE = 9;
const LINE_GAP = 1.35;
const CELL_PAD_X = 5;
const CELL_PAD_Y = 4;

type Cursor = { y: number };

export class PassportRenderer {
  private readonly pdf: PdfDocument;
  private readonly contentWidth: number;
  private readonly bottom: number;
  private readonly cursor: Cursor = { y: 0 };

  constructor(fonts: PdfFonts) {
    this.pdf = new PdfDocument(fonts);
    this.contentWidth = this.pdf.width - MARGIN_X * 2;
    this.bottom = this.pdf.height - FOOTER_HEIGHT - 12;
  }

  /** Splits text into lines that fit maxWidth; long words are broken. */
  wrap(text: string, maxWidth: number, size: number, font: PdfFontStyle): string[] {
    const lines: string[] = [];
    for (const paragraph of text.split('\n')) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push('');
        continue;
      }
      let current = '';
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (this.pdf.measure(candidate, size, font) <= maxWidth) {
          current = candidate;
          continue;
        }
        if (current) {
          lines.push(current);
        }
        // A single word wider than the column: break it by characters.
        let rest = word;
        while (this.pdf.measure(rest, size, font) > maxWidth && rest.length > 1) {
          let cut = rest.length - 1;
          while (cut > 1 && this.pdf.measure(rest.slice(0, cut), size, font) > maxWidth) {
            cut -= 1;
          }
          lines.push(rest.slice(0, cut));
          rest = rest.slice(cut);
        }
        current = rest;
      }
      lines.push(current);
    }
    return lines;
  }

  private lineHeight(size: number): number {
    return size * LINE_GAP;
  }

  private newPage(): void {
    this.pdf.addPage();
    this.cursor.y = MARGIN_TOP;
  }

  private ensureSpace(height: number): boolean {
    if (this.cursor.y + height <= this.bottom) {
      return false;
    }
    this.newPage();
    return true;
  }

  private drawHeader(model: PassportModel): void {
    const pdf = this.pdf;
    const bandHeight = 92;
    pdf.rect(0, 0, pdf.width, bandHeight, COLORS.primary);
    pdf.text(model.brand.toUpperCase(), MARGIN_X, 30, {
      font: 'bold',
      size: 9,
      color: COLORS.onPrimaryMuted,
    });
    pdf.text(model.title, MARGIN_X, 56, { font: 'bold', size: 22, color: COLORS.white });
    pdf.text(model.generatedLine, MARGIN_X, 76, { size: 8.5, color: COLORS.onPrimaryMuted });

    this.cursor.y = bandHeight + 34;
    const nameLines = this.wrap(model.petName, this.contentWidth, 18, 'bold');
    for (const line of nameLines) {
      pdf.text(line, MARGIN_X, this.cursor.y, { font: 'bold', size: 18, color: COLORS.text });
      this.cursor.y += this.lineHeight(18);
    }
    if (model.subtitle) {
      for (const line of this.wrap(model.subtitle, this.contentWidth, 10, 'regular')) {
        pdf.text(line, MARGIN_X, this.cursor.y, { size: 10, color: COLORS.secondary });
        this.cursor.y += this.lineHeight(10);
      }
    }
    // The note sits at the top so it is always seen and never orphaned.
    this.cursor.y += 4;
    for (const line of this.wrap(model.disclaimer, this.contentWidth, 8, 'regular')) {
      pdf.text(line, MARGIN_X, this.cursor.y, { size: 8, color: COLORS.secondary });
      this.cursor.y += this.lineHeight(8);
    }
    this.cursor.y += 2;
  }

  private drawSectionHeading(heading: string): void {
    // Keep the heading together with at least a couple of lines below it.
    this.ensureSpace(64);
    this.cursor.y += 22;
    this.pdf.text(heading, MARGIN_X, this.cursor.y, {
      font: 'bold',
      size: 12.5,
      color: COLORS.primary,
    });
    this.cursor.y += 6;
    this.pdf.line(MARGIN_X, this.cursor.y, MARGIN_X + this.contentWidth, this.cursor.y, {
      width: 0.8,
      color: COLORS.primary,
    });
    this.cursor.y += 10;
  }

  private drawFacts(section: PassportFactsSection): void {
    this.drawSectionHeading(section.heading);
    const labelWidth = this.contentWidth * 0.32;
    const valueWidth = this.contentWidth - labelWidth;
    const lineHeight = this.lineHeight(10);
    for (const [label, value] of section.rows) {
      const labelLines = this.wrap(label, labelWidth - 8, BODY_SIZE, 'regular');
      const valueLines = this.wrap(value, valueWidth, 10, 'bold');
      const rows = Math.max(labelLines.length, valueLines.length);
      const height = rows * lineHeight + 6;
      this.ensureSpace(height);
      const baseline = this.cursor.y + 10;
      labelLines.forEach((line, index) => {
        this.pdf.text(line, MARGIN_X, baseline + index * lineHeight, {
          size: BODY_SIZE,
          color: COLORS.secondary,
        });
      });
      valueLines.forEach((line, index) => {
        this.pdf.text(line, MARGIN_X + labelWidth, baseline + index * lineHeight, {
          font: 'bold',
          size: 10,
          color: COLORS.text,
        });
      });
      this.cursor.y += height;
      this.pdf.line(
        MARGIN_X,
        this.cursor.y - 2,
        MARGIN_X + this.contentWidth,
        this.cursor.y - 2,
        { width: 0.4, color: COLORS.border },
      );
    }
  }

  private drawTableHeader(widths: number[], section: PassportTableSection): void {
    const size = 8;
    const lineHeight = this.lineHeight(size);
    const cells = section.columns.map((column, index) =>
      this.wrap(column.label, widths[index] - CELL_PAD_X * 2, size, 'bold'),
    );
    const height = Math.max(...cells.map((lines) => lines.length)) * lineHeight + CELL_PAD_Y * 2;
    this.pdf.rect(MARGIN_X, this.cursor.y, this.contentWidth, height, COLORS.headerFill);
    let x = MARGIN_X;
    cells.forEach((lines, index) => {
      lines.forEach((line, lineIndex) => {
        this.pdf.text(line, x + CELL_PAD_X, this.cursor.y + CELL_PAD_Y + size + lineIndex * lineHeight, {
          font: 'bold',
          size,
          color: COLORS.secondary,
        });
      });
      x += widths[index];
    });
    this.cursor.y += height;
  }

  private drawTable(section: PassportTableSection): void {
    this.drawSectionHeading(section.heading);
    if (section.rows.length === 0) {
      this.pdf.text(section.emptyText, MARGIN_X, this.cursor.y + 10, {
        size: BODY_SIZE,
        color: COLORS.secondary,
      });
      this.cursor.y += 18;
      return;
    }

    const totalWeight = section.columns.reduce((sum, column) => sum + column.width, 0);
    const widths = section.columns.map((column) => (column.width / totalWeight) * this.contentWidth);
    const lineHeight = this.lineHeight(BODY_SIZE);
    this.drawTableHeader(widths, section);

    section.rows.forEach((row, rowIndex) => {
      const cells = widths.map((width, index) =>
        // The first column's first line is drawn bold, so measure it bold.
        this.wrap(row[index] ?? '', width - CELL_PAD_X * 2, BODY_SIZE, index === 0 ? 'bold' : 'regular'),
      );
      const height = Math.max(1, ...cells.map((lines) => lines.length)) * lineHeight + CELL_PAD_Y * 2;
      if (this.ensureSpace(height)) {
        this.drawTableHeader(widths, section);
      }
      if (rowIndex % 2 === 1) {
        this.pdf.rect(MARGIN_X, this.cursor.y, this.contentWidth, height, COLORS.zebra);
      }
      let x = MARGIN_X;
      cells.forEach((lines, columnIndex) => {
        lines.forEach((line, lineIndex) => {
          const isMain = columnIndex === 0 && lineIndex === 0;
          this.pdf.text(
            line,
            x + CELL_PAD_X,
            this.cursor.y + CELL_PAD_Y + BODY_SIZE + lineIndex * lineHeight,
            {
              font: isMain ? 'bold' : 'regular',
              size: BODY_SIZE,
              color: lineIndex === 0 ? COLORS.text : COLORS.secondary,
            },
          );
        });
        x += widths[columnIndex];
      });
      this.cursor.y += height;
      this.pdf.line(MARGIN_X, this.cursor.y, MARGIN_X + this.contentWidth, this.cursor.y, {
        width: 0.4,
        color: COLORS.border,
      });
    });
  }

  private drawFooters(model: PassportModel): void {
    const total = this.pdf.pageCount;
    const y = this.pdf.height - FOOTER_HEIGHT + 14;
    for (let page = 0; page < total; page += 1) {
      this.pdf.line(MARGIN_X, y - 12, MARGIN_X + this.contentWidth, y - 12, {
        width: 0.4,
        color: COLORS.border,
      }, page);
      this.pdf.text(model.footerLabel, MARGIN_X, y, { size: 7.5, color: COLORS.secondary }, page);
      const label = model.pageLabel(page + 1, total);
      const width = this.pdf.measure(label, 7.5);
      this.pdf.text(label, MARGIN_X + this.contentWidth - width, y, {
        size: 7.5,
        color: COLORS.secondary,
      }, page);
    }
  }

  render(model: PassportModel, createdAt?: Date): Uint8Array<ArrayBuffer> {
    this.newPage();
    this.drawHeader(model);
    for (const section of model.sections) {
      if (section.kind === 'facts') {
        this.drawFacts(section);
      } else {
        this.drawTable(section);
      }
    }
    this.drawFooters(model);
    return this.pdf.toBytes({
      title: `${model.title} — ${model.petName}`,
      author: model.brand,
      subject: model.title,
      createdAt,
    });
  }
}

export function renderPassportPdf(
  model: PassportModel,
  fonts: PdfFonts,
  createdAt?: Date,
): Uint8Array<ArrayBuffer> {
  return new PassportRenderer(fonts).render(model, createdAt);
}
