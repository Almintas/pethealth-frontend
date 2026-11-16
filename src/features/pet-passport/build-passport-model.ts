import type { TFunction } from 'i18next';
import type { PetClinicAccess } from '../clinic-access/types';
import type { MedicalRecord } from '../medical-records/types';
import type { Medication } from '../medications/types';
import type { Pet } from '../pets/types';
import type { Vaccination } from '../vaccinations/types';
import {
  translatePetBreed,
  translatePetGender,
  translatePetSpecies,
} from '../pets/utils/pet-field-display';
import type { PassportModel, PassportSection } from './pdf/render-passport';

export type PassportOwner = {
  firstName: string;
  lastName: string;
  email: string;
};

export type PassportData = {
  pet: Pet;
  owner: PassportOwner | null;
  vaccinations: Vaccination[];
  medications: Medication[];
  medicalRecords: MedicalRecord[];
  /** null when the clinic list could not be loaded. */
  clinics: PetClinicAccess[] | null;
  generatedAt: Date;
};

export type PassportFormatters = {
  /** Calendar date of an ISO timestamp in the user's language. */
  date: (value: string | Date) => string;
  /** Pet age from the birth date, or null when unknown. */
  age: (birthDate?: string | null) => string | null;
  /** Medication status for today (active, ongoing, completed, inactive). */
  medicationStatus: (medication: Medication) => string;
};

const DASH = '—';

function joinLines(...parts: Array<string | null | undefined>): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join('\n');
}

function byNewest<T>(rows: T[], date: (row: T) => string): T[] {
  return [...rows].sort((a, b) => Date.parse(date(b)) - Date.parse(date(a)));
}

function practitioner(row: {
  veterinarianName?: string | null;
  clinicName?: string | null;
}): string {
  return joinLines(row.veterinarianName, row.clinicName) || DASH;
}

/**
 * Turns the pet's records into the passport layout, translated with t.
 * Kept free of React and network calls so it can be unit-tested.
 */
export function buildPassportModel(
  data: PassportData,
  t: TFunction,
  format: PassportFormatters,
): PassportModel {
  const { pet } = data;
  const notProvided = t('common.notProvided');

  const age = format.age(pet.birthDate);
  const birthDate = pet.birthDate
    ? [format.date(pet.birthDate), age ? `(${age})` : null].filter(Boolean).join(' ')
    : notProvided;

  const petRows: Array<readonly [string, string]> = [
    [t('pets.name'), pet.name],
    [t('pets.species'), translatePetSpecies(pet.species, t) || notProvided],
    [t('pets.breed'), pet.breed ? translatePetBreed(pet.breed, t) : notProvided],
    [t('pets.gender'), pet.gender ? translatePetGender(pet.gender, t) : notProvided],
    [t('pets.dateOfBirth'), birthDate],
    [t('pets.microchip'), pet.microchipNumber?.trim() || notProvided],
  ];
  if (data.owner) {
    const ownerName = `${data.owner.firstName} ${data.owner.lastName}`.trim();
    petRows.push([t('passport.owner'), joinLines(ownerName, data.owner.email)]);
  }

  const vaccinations: PassportSection = {
    kind: 'table',
    heading: t('health.vaccinations'),
    columns: [
      { label: t('passport.vaccine'), width: 3 },
      { label: t('passport.administered'), width: 1.7 },
      { label: t('passport.validUntil'), width: 1.7 },
      { label: t('passport.batch'), width: 1.6 },
      { label: t('passport.vetClinic'), width: 3 },
    ],
    rows: byNewest(data.vaccinations, (row) => row.administeredAt).map((row) => [
      joinLines(row.vaccineName, row.notes),
      format.date(row.administeredAt),
      row.nextDueAt ? format.date(row.nextDueAt) : DASH,
      row.batchNumber?.trim() || DASH,
      practitioner(row),
    ]),
    emptyText: t('health.emptyVaccinations'),
  };

  const medications: PassportSection = {
    kind: 'table',
    heading: t('passport.treatments'),
    columns: [
      { label: t('passport.medication'), width: 3.4 },
      { label: t('passport.period'), width: 2.4 },
      { label: t('passport.status'), width: 1.4 },
      { label: t('passport.vetClinic'), width: 2.8 },
    ],
    rows: byNewest(data.medications, (row) => row.startDate).map((row) => [
      joinLines(
        row.name,
        `${row.dosage} ${row.dosageUnit} · ${row.frequency}`,
        row.notes,
      ),
      `${format.date(row.startDate)} – ${
        row.endDate ? format.date(row.endDate) : t('health.ongoingLabel')
      }`,
      format.medicationStatus(row),
      practitioner(row),
    ]),
    emptyText: t('health.emptyMedications'),
  };

  const records: PassportSection = {
    kind: 'table',
    heading: t('health.medicalRecords'),
    columns: [
      { label: t('passport.record'), width: 3.8 },
      { label: t('passport.date'), width: 1.6 },
      { label: t('passport.type'), width: 1.6 },
      { label: t('passport.vetClinic'), width: 3 },
    ],
    rows: byNewest(data.medicalRecords, (row) => row.date).map((row) => [
      joinLines(
        row.title,
        row.diagnosis ? `${t('health.diagnosis')}: ${row.diagnosis}` : null,
        row.description,
        row.attachments?.length
          ? `${t('passport.attachments')}: ${row.attachments
              .map((attachment) => attachment.fileName)
              .join(', ')}`
          : null,
      ),
      format.date(row.date),
      row.type.trim() || DASH,
      practitioner(row),
    ]),
    emptyText: t('health.emptyMedical'),
  };

  const clinics: PassportSection = {
    kind: 'table',
    heading: t('clinicAccess.clinicsTitle'),
    columns: [
      { label: t('passport.clinic'), width: 3 },
      { label: t('passport.address'), width: 3.2 },
      { label: t('passport.phone'), width: 1.8 },
      { label: t('passport.accessSince'), width: 1.6 },
    ],
    rows: (data.clinics ?? []).map((clinic) => [
      clinic.clinicName,
      clinic.clinicAddress?.trim() || DASH,
      clinic.clinicPhone?.trim() || DASH,
      format.date(clinic.grantedAt),
    ]),
    emptyText:
      data.clinics === null ? t('passport.clinicsUnavailable') : t('clinicAccess.noClinics'),
  };

  const title = t('passport.title');
  return {
    brand: 'PetHealth',
    title,
    petName: pet.name,
    subtitle: [
      pet.breed ? translatePetBreed(pet.breed, t) : translatePetSpecies(pet.species, t),
      pet.gender ? translatePetGender(pet.gender, t) : null,
      age,
    ]
      .filter(Boolean)
      .join(' · '),
    generatedLine: t('passport.generatedOn', { date: format.date(data.generatedAt) }),
    sections: [
      { kind: 'facts', heading: t('passport.petSection'), rows: petRows },
      vaccinations,
      medications,
      records,
      clinics,
    ],
    disclaimer: t('passport.disclaimer'),
    footerLabel: `PetHealth · ${title} · ${pet.name}`,
    pageLabel: (page, total) => t('passport.page', { page, total }),
  };
}

/** e.g. "sveikatos-pasas-reksas-2026-11-16.pdf" */
export function passportFileName(prefix: string, petName: string, date: Date): string {
  const slug = (value: string) =>
    value
      .normalize('NFD')
      .replace(/\p{M}+/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  const day = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
  return `${[slug(prefix), slug(petName)].filter(Boolean).join('-')}-${day}.pdf`;
}
