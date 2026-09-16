import { ReminderStatus, type Reminder } from '../types';

export type ReminderDueUrgency = 'overdue' | 'today' | 'future' | 'none';

function startOfLocalDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

function parseDueInstant(dueAt?: string | null): Date | null {
  if (!dueAt) {
    return null;
  }

  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getReminderDueUrgency(dueAt?: string | null): ReminderDueUrgency {
  const due = parseDueInstant(dueAt);
  if (!due) {
    return 'none';
  }

  const dueDayMs = startOfLocalDay(due);
  const todayMs = startOfLocalDay(new Date());

  if (dueDayMs < todayMs) {
    return 'overdue';
  }

  if (dueDayMs === todayMs) {
    return 'today';
  }

  return 'future';
}

export function getReminderDueUrgencyLabel(urgency: ReminderDueUrgency): string {
  switch (urgency) {
    case 'overdue':
      return 'Overdue';
    case 'today':
      return 'Due today';
    case 'future':
      return 'Upcoming';
    case 'none':
      return 'No due date';
  }
}

const URGENCY_SORT_ORDER: Record<ReminderDueUrgency, number> = {
  overdue: 0,
  today: 1,
  future: 2,
  none: 3,
};

export function sortPendingReminders(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort((left, right) => {
    const leftUrgency = getReminderDueUrgency(left.dueAt);
    const rightUrgency = getReminderDueUrgency(right.dueAt);
    const urgencyDelta =
      URGENCY_SORT_ORDER[leftUrgency] - URGENCY_SORT_ORDER[rightUrgency];

    if (urgencyDelta !== 0) {
      return urgencyDelta;
    }

    const leftDue = parseDueInstant(left.dueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightDue = parseDueInstant(right.dueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;

    if (leftUrgency === 'overdue') {
      return leftDue - rightDue;
    }

    if (leftUrgency === 'future' || leftUrgency === 'today') {
      return leftDue - rightDue;
    }

    return left.title.localeCompare(right.title);
  });
}

export function sortHistoryReminders(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort((left, right) => {
    const leftUpdated = new Date(left.updatedAt).getTime();
    const rightUpdated = new Date(right.updatedAt).getTime();
    if (leftUpdated !== rightUpdated) {
      return rightUpdated - leftUpdated;
    }

    const leftDue = parseDueInstant(left.dueAt)?.getTime() ?? 0;
    const rightDue = parseDueInstant(right.dueAt)?.getTime() ?? 0;
    return rightDue - leftDue;
  });
}

export function partitionReminders(reminders: Reminder[]): {
  pending: Reminder[];
  history: Reminder[];
} {
  const pending: Reminder[] = [];
  const history: Reminder[] = [];

  for (const reminder of reminders) {
    if (reminder.status === ReminderStatus.Pending) {
      pending.push(reminder);
    } else {
      history.push(reminder);
    }
  }

  return {
    pending: sortPendingReminders(pending),
    history: sortHistoryReminders(history),
  };
}

export function getReminderStatusLabel(status: Reminder['status']): string {
  switch (status) {
    case ReminderStatus.Pending:
      return 'Pending';
    case ReminderStatus.Completed:
      return 'Completed';
    case ReminderStatus.Dismissed:
      return 'Dismissed';
    default:
      return status;
  }
}

export function getReminderTypeLabel(type: Reminder['type']): string {
  switch (type) {
    case 'VACCINATION':
      return 'Vaccination';
    case 'MEDICATION':
      return 'Medication';
    case 'APPOINTMENT':
      return 'Appointment';
    case 'GENERAL':
      return 'General';
    default:
      return type;
  }
}

export function formatReminderSource(reminder: Reminder): string | null {
  if (!reminder.sourceType) {
    return null;
  }

  switch (reminder.sourceType) {
    case 'VACCINATION':
      return 'Linked to vaccination';
    case 'MEDICATION':
      return 'Linked to medication';
    case 'APPOINTMENT':
      return 'Linked to appointment';
    default:
      return `Linked to ${reminder.sourceType}`;
  }
}
