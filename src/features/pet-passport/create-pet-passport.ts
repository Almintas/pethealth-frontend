import type { ApolloClient } from '@apollo/client';
import type { TFunction } from 'i18next';
import { PET_CLINIC_ACCESS_QUERY } from '../clinic-access/graphql';
import type {
  PetClinicAccess,
  PetClinicAccessQueryResult,
  PetClinicAccessQueryVariables,
} from '../clinic-access/types';
import { fetchMedicalRecordsForPet } from '../medical-records/medical-records.service';
import { fetchMedicationsForPet } from '../medications/medications.service';
import {
  getMedicationTreatmentStatus,
  getMedicationTreatmentStatusLabel,
} from '../medications/utils/get-medication-treatment-status';
import { formatPetDate } from '../pets/utils/format-pet-date';
import type { Pet } from '../pets/types';
import { fetchVaccinationsForPet } from '../vaccinations/vaccinations.service';
import { formatPetAge } from '../../utils/format-pet-age';
import {
  buildPassportModel,
  passportFileName,
  type PassportOwner,
} from './build-passport-model';

async function fetchClinics(
  client: ApolloClient,
  petId: string,
): Promise<PetClinicAccess[] | null> {
  try {
    const { data } = await client.query<
      PetClinicAccessQueryResult,
      PetClinicAccessQueryVariables
    >({
      query: PET_CLINIC_ACCESS_QUERY,
      variables: { petId },
      fetchPolicy: 'network-only',
    });
    return data?.petClinicAccess ?? [];
  } catch {
    // The clinic list comes from the clinic API; the passport is still
    // useful without it, and says so instead of failing.
    return null;
  }
}

export type PetPassportFile = {
  bytes: Uint8Array<ArrayBuffer>;
  fileName: string;
};

/**
 * Loads the pet's latest records and renders the health passport PDF.
 * The PDF writer and its embedded font are loaded only when needed.
 */
export async function createPetPassport(
  client: ApolloClient,
  pet: Pet,
  owner: PassportOwner | null,
  t: TFunction,
): Promise<PetPassportFile> {
  const [vaccinations, medications, medicalRecords, clinics, renderer, fonts] =
    await Promise.all([
      fetchVaccinationsForPet(client, pet.id),
      fetchMedicationsForPet(client, pet.id),
      fetchMedicalRecordsForPet(client, pet.id),
      fetchClinics(client, pet.id),
      import('./pdf/render-passport'),
      import('./pdf/fonts.generated'),
    ]);

  const generatedAt = new Date();
  const model = buildPassportModel(
    { pet, owner, vaccinations, medications, medicalRecords, clinics, generatedAt },
    t,
    {
      date: (value) => formatPetDate(typeof value === 'string' ? value : value.toISOString()),
      age: formatPetAge,
      medicationStatus: (medication) =>
        getMedicationTreatmentStatusLabel(getMedicationTreatmentStatus(medication)),
    },
  );

  return {
    bytes: renderer.renderPassportPdf(model, fonts.DEJAVU_SANS, generatedAt),
    fileName: passportFileName(t('passport.fileNamePrefix'), pet.name, generatedAt),
  };
}

export function saveFile(file: PetPassportFile): void {
  const blob = new Blob([file.bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Some browsers start the download asynchronously.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
