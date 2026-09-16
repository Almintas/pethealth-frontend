import { AppointmentStatus, type Appointment } from '../types';

export function isUpcomingAppointment(appointment: Appointment): boolean {
  if (appointment.status !== AppointmentStatus.Scheduled) {
    return false;
  }

  const scheduledMs = new Date(appointment.scheduledAt).getTime();
  if (Number.isNaN(scheduledMs)) {
    return false;
  }

  return scheduledMs >= Date.now();
}

export function partitionAppointments(appointments: Appointment[]): {
  upcoming: Appointment[];
  history: Appointment[];
} {
  const upcoming: Appointment[] = [];
  const history: Appointment[] = [];

  for (const appointment of appointments) {
    if (isUpcomingAppointment(appointment)) {
      upcoming.push(appointment);
    } else {
      history.push(appointment);
    }
  }

  upcoming.sort(
    (left, right) =>
      new Date(left.scheduledAt).getTime() -
      new Date(right.scheduledAt).getTime(),
  );

  history.sort(
    (left, right) =>
      new Date(right.scheduledAt).getTime() -
      new Date(left.scheduledAt).getTime(),
  );

  return { upcoming, history };
}

export function getAppointmentStatusLabel(
  status: Appointment['status'],
): string {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return 'Scheduled';
    case AppointmentStatus.Completed:
      return 'Completed';
    case AppointmentStatus.Cancelled:
      return 'Cancelled';
    default:
      return status;
  }
}
