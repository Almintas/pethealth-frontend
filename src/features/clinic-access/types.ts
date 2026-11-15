export type PetClinicAccess = {
  clinicId: string;
  clinicName: string;
  clinicPhone?: string | null;
  clinicAddress?: string | null;
  grantedAt: string;
};

export type PetShareCode = {
  code: string;
  expiresAt: string;
};

export type PetClinicAccessQueryResult = {
  petClinicAccess: PetClinicAccess[];
};

export type PetClinicAccessQueryVariables = {
  petId: string;
};

export type CreatePetShareCodeMutationResult = {
  createPetShareCode: PetShareCode;
};

export type RevokePetClinicAccessMutationResult = {
  revokePetClinicAccess: boolean;
};
