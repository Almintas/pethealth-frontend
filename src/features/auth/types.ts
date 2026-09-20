export const UserRole = {
  User: 'USER',
  Vet: 'VET',
  Admin: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type NotificationPreferences = {
  emailAppointmentReminders: boolean;
  emailMedicationReminders: boolean;
  emailVaccinationReminders: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  notificationPreferences: NotificationPreferences;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type AuthPayload = {
  accessToken: string;
  user: AuthUser;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateNotificationPreferencesInput = {
  emailAppointmentReminders?: boolean;
  emailMedicationReminders?: boolean;
  emailVaccinationReminders?: boolean;
};
