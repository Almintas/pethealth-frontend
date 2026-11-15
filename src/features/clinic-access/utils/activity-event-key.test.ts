import { describe, expect, it } from 'vitest';
import en from '../../../i18n/locales/en';
import lt from '../../../i18n/locales/lt';
import { getActivityEventKey } from './activity-event-key';

const ACTIONS_BY_ENTITY: Record<string, string[]> = {
  PATIENT: ['VIEWED', 'CREATED', 'UPDATED', 'ACCESS_GRANTED', 'ACCESS_REVOKED'],
  MEDICAL_RECORD: ['CREATED', 'UPDATED'],
  MEDICATION: ['CREATED', 'UPDATED'],
  VACCINATION: ['CREATED', 'UPDATED'],
  APPOINTMENT: ['CREATED', 'UPDATED', 'CANCELLED'],
};

function lookup(messages: unknown, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
      messages,
    );
}

describe('getActivityEventKey', () => {
  it('builds clinic and owner keys', () => {
    expect(
      getActivityEventKey({
        action: 'CREATED',
        entityType: 'VACCINATION',
        actorType: 'CLINIC_USER',
      }),
    ).toBe('activity.events.CREATED_VACCINATION');
    expect(
      getActivityEventKey({
        action: 'ACCESS_REVOKED',
        entityType: 'PATIENT',
        actorType: 'OWNER',
      }),
    ).toBe('activity.events.OWNER_ACCESS_REVOKED');
  });

  it('has a translation for every event the Vet backend records', () => {
    const keys = [
      ...Object.entries(ACTIONS_BY_ENTITY).flatMap(([entityType, actions]) =>
        actions.map((action) =>
          getActivityEventKey({ action, entityType, actorType: 'CLINIC_USER' }),
        ),
      ),
      getActivityEventKey({
        action: 'ACCESS_REVOKED',
        entityType: 'PATIENT',
        actorType: 'OWNER',
      }),
    ];
    for (const messages of [en, lt]) {
      expect(keys.filter((key) => typeof lookup(messages, key) !== 'string')).toEqual([]);
    }
  });
});
