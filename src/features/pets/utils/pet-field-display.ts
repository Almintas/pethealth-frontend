import type { TFunction } from 'i18next';
import {
  PET_GENDER_SUGGESTIONS,
  PET_SPECIES_SUGGESTIONS,
} from '../constants/pet-field-suggestions';

const SPECIES_I18N_KEY: Record<(typeof PET_SPECIES_SUGGESTIONS)[number], string> = {
  Dog: 'dog',
  Cat: 'cat',
  Rabbit: 'rabbit',
  'Guinea Pig': 'guineaPig',
  Hamster: 'hamster',
  Bird: 'bird',
  Fish: 'fish',
  Reptile: 'reptile',
  Other: 'other',
};

const GENDER_I18N_KEY: Record<(typeof PET_GENDER_SUGGESTIONS)[number], string> = {
  Male: 'male',
  Female: 'female',
  Unknown: 'unknown',
  'Not specified': 'notSpecified',
};

function breedI18nKey(canonical: string): string {
  return canonical
    .toLowerCase()
    .replace(/['.]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function translatePetSpecies(value: string, t: TFunction): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const key = SPECIES_I18N_KEY[trimmed as (typeof PET_SPECIES_SUGGESTIONS)[number]];
  if (key) {
    return t(`pets.speciesOptions.${key}`);
  }

  return trimmed;
}

export function translatePetGender(value: string, t: TFunction): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const key = GENDER_I18N_KEY[trimmed as (typeof PET_GENDER_SUGGESTIONS)[number]];
  if (key) {
    return t(`pets.genderOptions.${key}`);
  }

  return trimmed;
}

export function translatePetBreed(value: string, t: TFunction): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const key = breedI18nKey(trimmed);
  return t(`pets.breedNames.${key}`, { defaultValue: trimmed });
}

export function resolveCanonicalBreedFromInput(
  input: string,
  knownBreeds: readonly string[],
  t: TFunction,
): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  for (const canonical of knownBreeds) {
    if (canonical.toLowerCase() === trimmed.toLowerCase()) {
      return canonical;
    }
    if (translatePetBreed(canonical, t).toLowerCase() === trimmed.toLowerCase()) {
      return canonical;
    }
  }

  return trimmed;
}

export function resolveCanonicalSpeciesFromInput(
  input: string,
  t: TFunction,
): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  for (const canonical of PET_SPECIES_SUGGESTIONS) {
    if (canonical.toLowerCase() === trimmed.toLowerCase()) {
      return canonical;
    }
    if (translatePetSpecies(canonical, t).toLowerCase() === trimmed.toLowerCase()) {
      return canonical;
    }
  }

  return trimmed;
}

export function resolveCanonicalGenderFromInput(
  input: string,
  t: TFunction,
): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  for (const canonical of PET_GENDER_SUGGESTIONS) {
    if (canonical.toLowerCase() === trimmed.toLowerCase()) {
      return canonical;
    }
    if (translatePetGender(canonical, t).toLowerCase() === trimmed.toLowerCase()) {
      return canonical;
    }
  }

  return trimmed;
}
