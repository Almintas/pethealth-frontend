export const PET_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const PET_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function validatePetPhotoFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'Use a JPG, PNG, or WebP image.';
  }

  if (file.size > PET_PHOTO_MAX_BYTES) {
    return 'Photo must be 5 MB or smaller.';
  }

  return null;
}

export type PetPhotoIntent =
  | { kind: 'unchanged' }
  | { kind: 'upload'; file: File }
  | { kind: 'remove' };
