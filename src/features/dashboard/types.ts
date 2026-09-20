import type { Appointment } from '../appointments/types';
import type { Medication } from '../medications/types';
import type { Pet } from '../pets/types';
import type { Reminder } from '../reminders/types';
import type { Vaccination } from '../vaccinations/types';

export type PetHealthBundle = {
  pet: Pet;
  vaccinations: Vaccination[];
  medications: Medication[];
  appointments: Appointment[];
  reminders: Reminder[];
  loadError?: string | null;
};

export type DashboardStats = {
  petCount: number;
  upcomingAppointments: number;
  pendingReminders: number;
  activeMedications: number;
};

export type DashboardAttentionKind =
  | 'reminder-overdue'
  | 'vaccination-overdue'
  | 'medication-ended-active';

export type DashboardAttentionItem = {
  id: string;
  petId: string;
  petName: string;
  label: string;
  href: string;
  attentionKind?: DashboardAttentionKind;
  reminderTitle?: string;
  vaccineName?: string;
  medicationName?: string;
};

export type DashboardUpcomingKind =
  | 'appointment'
  | 'reminder'
  | 'vaccination'
  | 'medication';

export type DashboardUpcomingItem = {
  id: string;
  petId: string;
  petName: string;
  kind: DashboardUpcomingKind;
  /** Reminder title or fallback display text */
  title: string;
  at: string;
  href: string;
  appointmentType?: string;
  vaccineName?: string;
  medicationName?: string;
};

export type PetOverviewSummary = {
  pet: Pet;
  pendingReminders: number;
  upcomingAppointments: number;
  activeMedications: number;
  overdueVaccinations: number;
};
