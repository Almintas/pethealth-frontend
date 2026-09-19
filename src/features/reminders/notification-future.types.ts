/**
 * Placeholder types for future notification delivery (not implemented).
 * Reminder queries/mutations remain unchanged; preferences will live on the owner profile.
 */
export type OwnerNotificationChannel = 'in_app' | 'email' | 'push';

export type OwnerNotificationPreferences = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  /** In-app reminders are always available when a reminder exists */
  inAppEnabled: boolean;
};

/** Fields on Reminder already suitable for notification scheduling */
export type ReminderNotificationPayload = {
  reminderId: string;
  petId: string;
  dueAt: string;
  title: string;
  message?: string | null;
  status: string;
};

/**
 * Future per-reminder delivery tracking (e.g. email sent at, push acknowledged).
 * Not stored in the owner portal yet.
 */
export type ReminderDeliveryState = {
  channel: OwnerNotificationChannel;
  sentAt?: string;
  failedAt?: string;
};
