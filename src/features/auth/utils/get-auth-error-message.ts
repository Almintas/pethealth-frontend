import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '../../../i18n';

export type UserErrorContext =
  | 'auth'
  | 'load-pets'
  | 'load-pet'
  | 'save-pet'
  | 'load-medical-records'
  | 'save-medical-record'
  | 'load-vaccinations'
  | 'save-vaccination'
  | 'load-medications'
  | 'save-medication'
  | 'load-appointments'
  | 'save-appointment'
  | 'load-reminders'
  | 'save-reminder'
  | 'generic-load'
  | 'generic-save';

function isUnauthorizedError(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((graphQLError) => {
      const code = graphQLError.extensions?.code;
      return (
        code === 'UNAUTHENTICATED' ||
        graphQLError.message.toLowerCase().includes('unauthorized') ||
        graphQLError.message.toLowerCase().includes('unauthenticated')
      );
    });
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('unauthorized') ||
      message.includes('unauthenticated') ||
      message.includes('jwt')
    );
  }

  return false;
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('load failed')
    );
  }

  return false;
}

function isTechnicalMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('graphql') ||
    normalized.includes('networkerror') ||
    normalized.includes('status code') ||
    normalized.includes('http://') ||
    normalized.includes('https://') ||
    normalized.includes('unexpected token') ||
    normalized.includes('syntax error')
  );
}

function mapKnownBackendMessage(message: string): string | null {
  const normalized = message.toLowerCase();
  if (
    normalized.includes('invalid credentials') ||
    normalized === 'unauthorized'
  ) {
    return i18n.t('errors.invalidCredentials');
  }
  if (normalized.includes('not found')) {
    return i18n.t('errors.notFound');
  }
  return null;
}

function readGraphQLErrorMessage(error: unknown): string | null {
  if (!CombinedGraphQLErrors.is(error)) {
    return null;
  }

  const messages = error.errors
    .map((graphQLError) => graphQLError.message.trim())
    .filter(Boolean)
    .filter((message) => !isTechnicalMessage(message));

  if (messages.length === 0) {
    return null;
  }

  const combined = messages.join(' ');
  return mapKnownBackendMessage(combined) ?? combined;
}

export function getUserFacingErrorMessage(
  error: unknown,
  context: UserErrorContext = 'generic-load',
): string {
  if (isUnauthorizedError(error)) {
    return i18n.t('errors.sessionExpired');
  }

  if (isNetworkError(error)) {
    if (context === 'auth') {
      return i18n.t('errors.serverUnreachable');
    }
    return i18n.t(`errors.context.${context}`);
  }

  const graphQLErrorMessage = readGraphQLErrorMessage(error);
  if (graphQLErrorMessage) {
    return graphQLErrorMessage;
  }

  if (error instanceof Error && error.message && !isTechnicalMessage(error.message)) {
    const mapped = mapKnownBackendMessage(error.message);
    if (mapped) {
      return mapped;
    }
    return error.message;
  }

  return i18n.t(`errors.context.${context}`);
}

export function getAuthErrorMessage(
  error: unknown,
  context: UserErrorContext = 'generic-load',
): string {
  return getUserFacingErrorMessage(error, context);
}
