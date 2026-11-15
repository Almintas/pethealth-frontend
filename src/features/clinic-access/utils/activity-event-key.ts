import type { PetActivityEvent } from '../types';

/**
 * Translation key for an activity event, e.g. `activity.events.CREATED_VACCINATION`
 * or `activity.events.OWNER_ACCESS_REVOKED` for the owner's own changes.
 */
export function getActivityEventKey(
  event: Pick<PetActivityEvent, 'action' | 'entityType' | 'actorType'>,
): string {
  if (event.actorType === 'OWNER') {
    return `activity.events.OWNER_${event.action}`;
  }
  return `activity.events.${event.action}_${event.entityType}`;
}
