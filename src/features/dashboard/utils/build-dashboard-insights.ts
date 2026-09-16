import { isUpcomingAppointment } from '../../appointments/utils/appointment-list-utils';
import { getMedicationTreatmentStatus } from '../../medications/utils/get-medication-treatment-status';
import { ReminderStatus } from '../../reminders/types';
import {
  getReminderDueUrgency,
} from '../../reminders/utils/reminder-list-utils';
import { getVaccinationDueStatus } from '../../vaccinations/utils/get-vaccination-due-status';
import type {
  DashboardAttentionItem,
  DashboardStats,
  DashboardUpcomingItem,
  PetHealthBundle,
  PetOverviewSummary,
} from '../types';

const UPCOMING_LIMIT = 10;

function startOfLocalDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

function petDetailsHref(petId: string): string {
  return `/pets/${petId}`;
}

export function buildDashboardStats(bundles: PetHealthBundle[]): DashboardStats {
  let upcomingAppointments = 0;
  let pendingReminders = 0;
  let activeMedications = 0;

  for (const bundle of bundles) {
    upcomingAppointments += bundle.appointments.filter(isUpcomingAppointment).length;
    pendingReminders += bundle.reminders.filter(
      (reminder) => reminder.status === ReminderStatus.Pending,
    ).length;
    activeMedications += bundle.medications.filter((medication) => {
      const status = getMedicationTreatmentStatus(medication);
      return status === 'active' || status === 'ongoing';
    }).length;
  }

  return {
    petCount: bundles.length,
    upcomingAppointments,
    pendingReminders,
    activeMedications,
  };
}

export function buildAttentionItems(
  bundles: PetHealthBundle[],
): DashboardAttentionItem[] {
  const items: DashboardAttentionItem[] = [];
  const todayMs = startOfLocalDay(new Date());

  for (const bundle of bundles) {
    const { pet } = bundle;
    const href = petDetailsHref(pet.id);

    for (const reminder of bundle.reminders) {
      if (reminder.status !== ReminderStatus.Pending) {
        continue;
      }
      if (getReminderDueUrgency(reminder.dueAt) === 'overdue') {
        items.push({
          id: `reminder-overdue-${reminder.id}`,
          petId: pet.id,
          petName: pet.name,
          label: `Overdue reminder: ${reminder.title}`,
          href,
        });
      }
    }

    for (const vaccination of bundle.vaccinations) {
      if (getVaccinationDueStatus(vaccination.nextDueAt) === 'overdue') {
        items.push({
          id: `vaccination-overdue-${vaccination.id}`,
          petId: pet.id,
          petName: pet.name,
          label: `Vaccination overdue: ${vaccination.vaccineName}`,
          href,
        });
      }
    }

    for (const medication of bundle.medications) {
      if (!medication.isActive || !medication.endDate) {
        continue;
      }
      const endMs = startOfLocalDay(new Date(medication.endDate));
      if (endMs < todayMs) {
        items.push({
          id: `medication-ended-active-${medication.id}`,
          petId: pet.id,
          petName: pet.name,
          label: `Medication ended but still active: ${medication.name}`,
          href,
        });
      }
    }
  }

  return items;
}

export function buildUpcomingItems(
  bundles: PetHealthBundle[],
): DashboardUpcomingItem[] {
  const items: DashboardUpcomingItem[] = [];
  const todayMs = startOfLocalDay(new Date());

  for (const bundle of bundles) {
    const { pet } = bundle;
    const href = petDetailsHref(pet.id);

    for (const appointment of bundle.appointments) {
      if (!isUpcomingAppointment(appointment)) {
        continue;
      }
      items.push({
        id: `appointment-${appointment.id}`,
        petId: pet.id,
        petName: pet.name,
        kind: 'appointment',
        title: appointment.type,
        at: appointment.scheduledAt,
        href,
      });
    }

    for (const reminder of bundle.reminders) {
      if (reminder.status !== ReminderStatus.Pending) {
        continue;
      }
      const dueMs = new Date(reminder.dueAt).getTime();
      if (Number.isNaN(dueMs)) {
        continue;
      }
      items.push({
        id: `reminder-${reminder.id}`,
        petId: pet.id,
        petName: pet.name,
        kind: 'reminder',
        title: reminder.title,
        at: reminder.dueAt,
        href,
      });
    }

    for (const vaccination of bundle.vaccinations) {
      if (!vaccination.nextDueAt) {
        continue;
      }
      const dueMs = startOfLocalDay(new Date(vaccination.nextDueAt));
      if (dueMs < todayMs) {
        continue;
      }
      items.push({
        id: `vaccination-${vaccination.id}`,
        petId: pet.id,
        petName: pet.name,
        kind: 'vaccination',
        title: `${vaccination.vaccineName} due`,
        at: vaccination.nextDueAt,
        href,
      });
    }

    for (const medication of bundle.medications) {
      const status = getMedicationTreatmentStatus(medication);
      if (status !== 'active' && status !== 'ongoing') {
        continue;
      }
      if (!medication.endDate) {
        continue;
      }
      const endMs = startOfLocalDay(new Date(medication.endDate));
      if (endMs < todayMs) {
        continue;
      }
      items.push({
        id: `medication-end-${medication.id}`,
        petId: pet.id,
        petName: pet.name,
        kind: 'medication',
        title: `${medication.name} course ends`,
        at: medication.endDate,
        href,
      });
    }
  }

  return items
    .sort((left, right) => new Date(left.at).getTime() - new Date(right.at).getTime())
    .slice(0, UPCOMING_LIMIT);
}

export function buildPetOverviewSummaries(
  bundles: PetHealthBundle[],
): PetOverviewSummary[] {
  return bundles.map((bundle) => {
    const overdueVaccinations = bundle.vaccinations.filter(
      (vaccination) => getVaccinationDueStatus(vaccination.nextDueAt) === 'overdue',
    ).length;

    return {
      pet: bundle.pet,
      pendingReminders: bundle.reminders.filter(
        (reminder) => reminder.status === ReminderStatus.Pending,
      ).length,
      upcomingAppointments: bundle.appointments.filter(isUpcomingAppointment).length,
      activeMedications: bundle.medications.filter((medication) => {
        const status = getMedicationTreatmentStatus(medication);
        return status === 'active' || status === 'ongoing';
      }).length,
      overdueVaccinations,
    };
  });
}
