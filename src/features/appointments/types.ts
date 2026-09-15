export const AppointmentStatus = {
  Scheduled: 'SCHEDULED',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export type Appointment = {
  id: string;
  petId: string;
  scheduledAt: string;
  type: string;
  clinicName?: string | null;
  veterinarianName?: string | null;
  reason?: string | null;
  notes?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateAppointmentInput = {
  petId: string;
  scheduledAt: string;
  type: string;
  clinicName?: string;
  veterinarianName?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
};

export type UpdateAppointmentInput = {
  scheduledAt?: string;
  type?: string;
  clinicName?: string;
  veterinarianName?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
};

export type AppointmentsQueryResult = {
  appointments: Appointment[];
};

export type AppointmentsQueryVariables = {
  petId: string;
};

export type AppointmentQueryResult = {
  appointment: Appointment;
};

export type AppointmentQueryVariables = {
  id: string;
};

export type CreateAppointmentMutationResult = {
  createAppointment: Appointment;
};

export type CreateAppointmentMutationVariables = {
  input: CreateAppointmentInput;
};

export type UpdateAppointmentMutationResult = {
  updateAppointment: Appointment;
};

export type UpdateAppointmentMutationVariables = {
  id: string;
  input: UpdateAppointmentInput;
};

export type DeleteAppointmentMutationResult = {
  deleteAppointment: boolean;
};

export type DeleteAppointmentMutationVariables = {
  id: string;
};
