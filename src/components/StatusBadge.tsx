import './status-badge.css';

export type StatusBadgeTone =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'pending'
  | 'dismissed'
  | 'active'
  | 'inactive'
  | 'neutral';

type StatusBadgeProps = {
  label: string;
  tone: StatusBadgeTone;
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      {label.replaceAll('_', ' ')}
    </span>
  );
}

export function appointmentStatusTone(
  status: string,
): StatusBadgeTone {
  switch (status) {
    case 'SCHEDULED':
      return 'scheduled';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'neutral';
  }
}

export function reminderStatusTone(status: string): StatusBadgeTone {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'COMPLETED':
      return 'completed';
    case 'DISMISSED':
      return 'dismissed';
    default:
      return 'neutral';
  }
}

export function medicationStatusTone(isActive: boolean): StatusBadgeTone {
  return isActive ? 'active' : 'inactive';
}
