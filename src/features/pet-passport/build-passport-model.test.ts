import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import type { Medication } from '../medications/types';
import type { Vaccination } from '../vaccinations/types';
import {
  buildPassportModel,
  passportFileName,
  type PassportData,
} from './build-passport-model';
import { encodeText } from './pdf/encoding';
import { DEJAVU_SANS } from './pdf/fonts.generated';
import { renderPassportPdf, type PassportTableSection } from './pdf/render-passport';

/** Returns the key (or the default value), with interpolation values appended. */
const t = ((key: string, options?: Record<string, unknown>) => {
  if (options && typeof options.defaultValue === 'string') {
    return options.defaultValue;
  }
  if (options) {
    return `${key}(${Object.values(options).join(',')})`;
  }
  return key;
}) as unknown as TFunction;

const format = {
  date: (value: string | Date) =>
    (typeof value === 'string' ? value : value.toISOString()).slice(0, 10),
  age: (birthDate?: string | null) => (birthDate ? '3 y' : null),
  medicationStatus: (medication: Medication) => (medication.isActive ? 'active' : 'inactive'),
};

const stamp = { createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' };

function vaccination(overrides: Partial<Vaccination>): Vaccination {
  return {
    id: 'v',
    petId: 'p1',
    vaccineName: 'Rabies',
    administeredAt: '2026-01-10T00:00:00.000Z',
    ...stamp,
    ...overrides,
  };
}

function data(overrides: Partial<PassportData> = {}): PassportData {
  return {
    pet: {
      id: 'p1',
      ownerId: 'u1',
      name: 'Reksas',
      species: 'Dog',
      breed: 'Labrador Retriever',
      gender: 'Male',
      birthDate: '2023-05-01T00:00:00.000Z',
      microchipNumber: '440123456789012',
      ...stamp,
    },
    owner: { firstName: 'Ona', lastName: 'Žukauskienė', email: 'ona@example.com' },
    vaccinations: [
      vaccination({ id: 'old', vaccineName: 'Rabies', administeredAt: '2025-02-01T00:00:00.000Z' }),
      vaccination({
        id: 'new',
        vaccineName: 'DHPPi',
        administeredAt: '2026-03-01T00:00:00.000Z',
        nextDueAt: '2027-03-01T00:00:00.000Z',
        batchNumber: 'B-7',
        veterinarianName: 'Dr. Jonas',
        clinicName: 'Ąžuolo klinika',
      }),
    ],
    medications: [
      {
        id: 'm1',
        petId: 'p1',
        name: 'Carprofen',
        dosage: 50,
        dosageUnit: 'mg',
        frequency: '2x per day',
        startDate: '2026-02-01T00:00:00.000Z',
        endDate: null,
        isActive: true,
        ...stamp,
      },
    ],
    medicalRecords: [
      {
        id: 'r1',
        petId: 'p1',
        date: '2026-04-01T00:00:00.000Z',
        type: 'Checkup',
        title: 'Annual exam',
        diagnosis: 'Healthy',
        attachments: [
          { id: 'a1', fileName: 'blood.pdf', contentType: 'application/pdf', size: 10, createdAt: '' },
          { id: 'a2', fileName: 'xray.png', contentType: 'image/png', size: 10, createdAt: '' },
        ],
        ...stamp,
      },
    ],
    clinics: [
      {
        clinicId: 'c1',
        clinicName: 'Ąžuolo klinika',
        clinicAddress: 'Vilnius',
        clinicPhone: null,
        grantedAt: '2026-01-05T00:00:00.000Z',
      },
    ],
    generatedAt: new Date('2026-11-16T10:00:00Z'),
    ...overrides,
  };
}

function table(model: ReturnType<typeof buildPassportModel>, heading: string) {
  const section = model.sections.find((item) => item.heading === heading);
  expect(section?.kind).toBe('table');
  return section as PassportTableSection;
}

describe('buildPassportModel', () => {
  it('lists pet details, microchip and owner first', () => {
    const model = buildPassportModel(data(), t, format);
    const [facts] = model.sections;
    expect(facts.kind).toBe('facts');
    expect(facts.kind === 'facts' && Object.fromEntries(facts.rows)).toMatchObject({
      'pets.name': 'Reksas',
      'pets.species': 'pets.speciesOptions.dog',
      'pets.breed': 'Labrador Retriever',
      'pets.dateOfBirth': '2023-05-01 (3 y)',
      'pets.microchip': '440123456789012',
      'passport.owner': 'Ona Žukauskienė\nona@example.com',
    });
    expect(model.generatedLine).toBe('passport.generatedOn(2026-11-16)');
    expect(model.pageLabel(2, 3)).toBe('passport.page(2,3)');
  });

  it('puts the newest vaccination first with its validity, batch and clinic', () => {
    const vaccinations = table(buildPassportModel(data(), t, format), 'health.vaccinations');
    expect(vaccinations.rows).toEqual([
      ['DHPPi', '2026-03-01', '2027-03-01', 'B-7', 'Dr. Jonas\nĄžuolo klinika'],
      ['Rabies', '2025-02-01', '—', '—', '—'],
    ]);
  });

  it('describes treatments, records and clinics', () => {
    const model = buildPassportModel(data(), t, format);
    expect(table(model, 'passport.treatments').rows).toEqual([
      ['Carprofen\n50 mg · 2x per day', '2026-02-01 – health.ongoingLabel', 'active', '—'],
    ]);
    expect(table(model, 'health.medicalRecords').rows).toEqual([
      [
        'Annual exam\nhealth.diagnosis: Healthy\npassport.attachments: blood.pdf, xray.png',
        '2026-04-01',
        'Checkup',
        '—',
      ],
    ]);
    expect(table(model, 'clinicAccess.clinicsTitle').rows).toEqual([
      ['Ąžuolo klinika', 'Vilnius', '—', '2026-01-05'],
    ]);
  });

  it('says when the clinic list is unavailable or empty', () => {
    expect(
      table(buildPassportModel(data({ clinics: null }), t, format), 'clinicAccess.clinicsTitle')
        .emptyText,
    ).toBe('passport.clinicsUnavailable');
    expect(
      table(buildPassportModel(data({ clinics: [] }), t, format), 'clinicAccess.clinicsTitle')
        .emptyText,
    ).toBe('clinicAccess.noClinics');
  });

  it('leaves the owner out when unknown', () => {
    const [facts] = buildPassportModel(data({ owner: null }), t, format).sections;
    expect(facts.kind === 'facts' && facts.rows.map(([label]) => label)).not.toContain(
      'passport.owner',
    );
  });
});

describe('renderPassportPdf', () => {
  const hex = (text: string) =>
    encodeText(text)
      .map((code) => code.toString(16).padStart(2, '0'))
      .join('');

  it('renders the passport with its records', () => {
    const model = buildPassportModel(data(), t, format);
    const output = new TextDecoder('latin1').decode(
      renderPassportPdf(model, DEJAVU_SANS, new Date('2026-11-16T10:00:00Z')),
    );
    expect(output.startsWith('%PDF-')).toBe(true);
    for (const text of ['Reksas', 'DHPPi', '440123456789012', 'Ąžuolo klinika', 'Ona Žukauskienė']) {
      expect(output).toContain(`<${hex(text)}>`);
    }
    expect(output).toContain('/Count 1');
  });

  it('continues on new pages and numbers them', () => {
    const many = Array.from({ length: 60 }, (_, index) =>
      vaccination({ id: `v${index}`, vaccineName: `Vaccine ${index}` }),
    );
    const model = buildPassportModel(data({ vaccinations: many }), t, format);
    const output = new TextDecoder('latin1').decode(renderPassportPdf(model, DEJAVU_SANS));
    const pages = Number(/\/Count (\d+)/.exec(output)?.[1]);
    expect(pages).toBeGreaterThan(1);
    expect(output).toContain(`<${hex(`passport.page(${pages},${pages})`)}>`);
    // The table header is repeated on every page the table continues on.
    const headerCount = output.split(`<${hex('passport.vaccine')}>`).length - 1;
    expect(headerCount).toBeGreaterThan(1);
  });
});

describe('passportFileName', () => {
  it('builds a safe file name', () => {
    expect(passportFileName('sveikatos-pasas', 'Žvaigždė Nr. 2', new Date(2026, 10, 16))).toBe(
      'sveikatos-pasas-zvaigzde-nr-2-2026-11-16.pdf',
    );
  });
});
