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

export type PetActivityEvent = {
  id: string;
  action: string;
  entityType: string;
  actorType: string;
  actorName?: string | null;
  clinicName?: string | null;
  summary?: string | null;
  createdAt: string;
};

export type PetActivityLogQueryResult = {
  petActivityLog: PetActivityEvent[];
};

export type PetActivityLogQueryVariables = {
  petId: string;
  limit?: number;
};
