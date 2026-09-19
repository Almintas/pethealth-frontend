import type { ApolloClient } from '@apollo/client';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';
import * as appointmentsService from '../../appointments/appointments.service';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import * as medicationsService from '../../medications/medications.service';
import { MY_PETS_QUERY } from '../../pets/graphql';
import type { MyPetsQueryResult, Pet } from '../../pets/types';
import * as remindersService from '../../reminders/reminders.service';
import * as vaccinationsService from '../../vaccinations/vaccinations.service';
import type { PetHealthBundle } from '../types';
import {
  buildAttentionItems,
  buildDashboardStats,
  buildPetOverviewSummaries,
  buildUpcomingItems,
} from '../utils/build-dashboard-insights';

type DashboardHealthState = {
  bundles: PetHealthBundle[];
  healthLoading: boolean;
  healthError: string | null;
  partialHealthErrors: number;
};

const emptyHealthState: DashboardHealthState = {
  bundles: [],
  healthLoading: false,
  healthError: null,
  partialHealthErrors: 0,
};

async function loadPetHealthBundle(
  client: ApolloClient,
  pet: Pet,
): Promise<PetHealthBundle> {
  try {
    const [vaccinations, medications, appointments, reminders] =
      await Promise.all([
        vaccinationsService.fetchVaccinationsForPet(client, pet.id),
        medicationsService.fetchMedicationsForPet(client, pet.id),
        appointmentsService.fetchAppointmentsForPet(client, pet.id),
        remindersService.fetchRemindersForPet(client, pet.id),
      ]);

    return {
      pet,
      vaccinations,
      medications,
      appointments,
      reminders,
      loadError: null,
    };
  } catch (error) {
    return {
      pet,
      vaccinations: [],
      medications: [],
      appointments: [],
      reminders: [],
      loadError: getUserFacingErrorMessage(error, 'generic-load'),
    };
  }
}

export function useDashboardHealthData() {
  const client = useApolloClient();
  const {
    data: petsData,
    loading: petsLoading,
    error: petsError,
  } = useQuery<MyPetsQueryResult>(MY_PETS_QUERY, {
    fetchPolicy: 'cache-first',
  });

  const pets = petsData?.myPets ?? [];
  const petList = petsData?.myPets;

  const [healthState, setHealthState] =
    useState<DashboardHealthState>(emptyHealthState);

  useEffect(() => {
    if (petsLoading) {
      return;
    }

    if (!petList?.length) {
      setHealthState(emptyHealthState);
      return;
    }

    let cancelled = false;

    const loadHealth = async () => {
      setHealthState((current) => ({
        ...current,
        healthLoading: true,
        healthError: null,
        partialHealthErrors: 0,
      }));

      const bundles = await Promise.all(
        petList.map((pet) => loadPetHealthBundle(client, pet)),
      );

      if (cancelled) {
        return;
      }

      const partialHealthErrors = bundles.filter((bundle) => bundle.loadError).length;
      const allFailed =
        bundles.length > 0 && partialHealthErrors === bundles.length;

      setHealthState({
        bundles,
        healthLoading: false,
        healthError: allFailed
          ? 'We could not load health details right now. Try again in a moment.'
          : null,
        partialHealthErrors,
      });
    };

    void loadHealth();

    return () => {
      cancelled = true;
    };
  }, [client, petList, petsLoading]);

  const insights = useMemo(() => {
    const { bundles } = healthState;
    return {
      stats: buildDashboardStats(bundles),
      attentionItems: buildAttentionItems(bundles),
      upcomingItems: buildUpcomingItems(bundles),
      petSummaries: buildPetOverviewSummaries(bundles),
    };
  }, [healthState]);

  return {
    pets,
    petsLoading,
    petsError,
    healthLoading: healthState.healthLoading,
    healthError: healthState.healthError,
    partialHealthErrors: healthState.partialHealthErrors,
    ...insights,
  };
}
