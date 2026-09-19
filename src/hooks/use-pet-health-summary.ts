import { useApolloClient } from '@apollo/client/react';
import { useCallback, useEffect, useState } from 'react';
import { fetchAppointmentsForPet } from '../features/appointments/appointments.service';
import {
  AppointmentStatus,
  type Appointment,
} from '../features/appointments/types';
import { getAuthErrorMessage } from '../features/auth/utils/get-auth-error-message';
import { fetchMedicationsForPet } from '../features/medications/medications.service';
import type { Medication } from '../features/medications/types';
import { fetchMyPets } from '../features/pets/pets.service';
import type { Pet } from '../features/pets/types';
import { fetchRemindersForPet } from '../features/reminders/reminders.service';
import {
  ReminderStatus,
  type Reminder,
} from '../features/reminders/types';

export type AppointmentWithPet = Appointment & { petName: string };
export type ReminderWithPet = Reminder & { petName: string };
export type MedicationWithPet = Medication & { petName: string };

export type PetHealthSummary = {
  pets: Pet[];
  appointments: AppointmentWithPet[];
  reminders: ReminderWithPet[];
  medications: MedicationWithPet[];
  upcomingAppointments: AppointmentWithPet[];
  pendingReminders: ReminderWithPet[];
  activeMedicationCount: number;
  loading: boolean;
  error: string | null;
};

function withPetName<T extends { petId: string }>(
  items: T[],
  pet: Pet,
): (T & { petName: string })[] {
  return items.map((item) => ({ ...item, petName: pet.name }));
}

export function usePetHealthSummary(): PetHealthSummary & {
  reload: () => void;
} {
  const client = useApolloClient();
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithPet[]>([]);
  const [reminders, setReminders] = useState<ReminderWithPet[]>([]);
  const [medications, setMedications] = useState<MedicationWithPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const petList = await fetchMyPets(client);
        if (cancelled) {
          return;
        }

        const appointmentLists = await Promise.all(
          petList.map((pet) => fetchAppointmentsForPet(client, pet.id)),
        );
        const reminderLists = await Promise.all(
          petList.map((pet) => fetchRemindersForPet(client, pet.id)),
        );
        const medicationLists = await Promise.all(
          petList.map((pet) => fetchMedicationsForPet(client, pet.id)),
        );

        if (cancelled) {
          return;
        }

        const allAppointments = petList.flatMap((pet, index) =>
          withPetName(appointmentLists[index] ?? [], pet),
        );
        const allReminders = petList.flatMap((pet, index) =>
          withPetName(reminderLists[index] ?? [], pet),
        );
        const allMedications = petList.flatMap((pet, index) =>
          withPetName(medicationLists[index] ?? [], pet),
        );

        setPets(petList);
        setAppointments(allAppointments);
        setReminders(allReminders);
        setMedications(allMedications);
      } catch (loadError) {
        if (!cancelled) {
          setError(getAuthErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [client, reloadToken]);

  const now = Date.now();

  const upcomingAppointments = appointments
    .filter(
      (appointment) =>
        appointment.status === AppointmentStatus.Scheduled &&
        new Date(appointment.scheduledAt).getTime() >= now,
    )
    .sort(
      (left, right) =>
        new Date(left.scheduledAt).getTime() -
        new Date(right.scheduledAt).getTime(),
    );

  const pendingReminders = reminders
    .filter((reminder) => reminder.status === ReminderStatus.Pending)
    .sort(
      (left, right) =>
        new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime(),
    );

  const activeMedicationCount = medications.filter(
    (medication) => medication.isActive,
  ).length;

  return {
    pets,
    appointments,
    reminders,
    medications,
    upcomingAppointments,
    pendingReminders,
    activeMedicationCount,
    loading,
    error,
    reload,
  };
}
