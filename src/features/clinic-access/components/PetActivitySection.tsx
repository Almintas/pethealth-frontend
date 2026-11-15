import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorAlert, LoadingState } from '../../../components/feedback';
import { toIntlLocale } from '../../../i18n/app-locale';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { PET_ACTIVITY_LOG_QUERY } from '../graphql';
import type {
  PetActivityEvent,
  PetActivityLogQueryResult,
  PetActivityLogQueryVariables,
} from '../types';
import { getActivityEventKey } from '../utils/activity-event-key';
import './pet-activity-section.css';

const ACTIVITY_LIMIT = 50;
const INITIAL_VISIBLE = 8;

type PetActivitySectionProps = {
  petId: string;
};

/**
 * Audit log for the owner: which clinic staff viewed or changed the pet's
 * data and when. Part of the owner-consent model behind clinic access.
 */
export function PetActivitySection({ petId }: PetActivitySectionProps) {
  const { t, i18n } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const { data, loading, error, refetch } = useQuery<
    PetActivityLogQueryResult,
    PetActivityLogQueryVariables
  >(PET_ACTIVITY_LOG_QUERY, {
    variables: { petId, limit: ACTIVITY_LIMIT },
    fetchPolicy: 'network-only',
  });

  const events = data?.petActivityLog ?? [];
  const visibleEvents = showAll ? events : events.slice(0, INITIAL_VISIBLE);
  const dateFormatter = new Intl.DateTimeFormat(toIntlLocale(i18n.language), {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const describeActor = (event: PetActivityEvent): string => {
    if (event.actorType === 'OWNER') {
      return t('activity.you');
    }
    const name = event.actorName || t('activity.clinicStaff');
    return event.clinicName ? `${name} · ${event.clinicName}` : name;
  };

  // For the owner's own changes, the subject is the clinic they acted on.
  // Pet-level events would only repeat this pet's name, so they have none.
  const describeSubject = (event: PetActivityEvent): string | null => {
    if (event.actorType === 'OWNER') {
      return event.clinicName ?? null;
    }
    return event.entityType === 'PATIENT' ? null : (event.summary ?? null);
  };

  return (
    <section
      id="pet-activity"
      className="pet-activity-section"
      aria-labelledby="pet-activity-title"
    >
      <header className="pet-activity-section__header">
        <h2 id="pet-activity-title">{t('activity.title')}</h2>
        <p className="pet-activity-section__intro">{t('activity.intro')}</p>
      </header>

      {loading ? <LoadingState message={t('common.loading')} skeleton /> : null}

      {error ? (
        <ErrorAlert
          message={getUserFacingErrorMessage(error, 'generic-load')}
          onRetry={() => void refetch()}
          compact
        />
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <p className="pet-activity-section__empty">{t('activity.empty')}</p>
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <>
          <ol className="pet-activity-section__list">
            {visibleEvents.map((event) => (
              <li key={event.id} className="pet-activity-section__item">
                <span
                  className={`pet-activity-section__dot pet-activity-section__dot--${event.action.toLowerCase()}`}
                  aria-hidden="true"
                />
                <div className="pet-activity-section__body">
                  <p className="pet-activity-section__actor">{describeActor(event)}</p>
                  <p className="pet-activity-section__what">
                    {t(getActivityEventKey(event), {
                      defaultValue: t('activity.events.fallback'),
                    })}
                    {describeSubject(event) ? (
                      <span className="pet-activity-section__summary">
                        {' '}
                        „{describeSubject(event)}“
                      </span>
                    ) : null}
                  </p>
                </div>
                <time className="pet-activity-section__time" dateTime={event.createdAt}>
                  {dateFormatter.format(new Date(event.createdAt))}
                </time>
              </li>
            ))}
          </ol>
          {events.length > INITIAL_VISIBLE ? (
            <button
              type="button"
              className="pet-activity-section__toggle"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? t('activity.showLess') : t('activity.showAll')}
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
