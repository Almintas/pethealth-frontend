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

function readRawErrorMessages(error: unknown): string[] {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((graphQLError) => graphQLError.message);
  }
  if (error instanceof Error) {
    return [error.message];
  }
  return [];
}

/**
 * Credential failures are also 401/UNAUTHENTICATED responses, so they must be
 * recognised before the generic "session expired" handling.
 */
function mapCredentialFailure(error: unknown): string | null {
  const messages = readRawErrorMessages(error).map((message) =>
    message.toLowerCase(),
  );
  if (messages.some((message) => message.includes('invalid credentials'))) {
    return i18n.t('errors.invalidCredentials');
  }
  if (
    messages.some((message) => message.includes('current password is incorrect'))
  ) {
    return i18n.t('errors.currentPasswordIncorrect');
  }
  return null;
}

/** True when the API reported that the requested resource does not exist. */
export function isNotFoundError(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some(
      (graphQLError) =>
        graphQLError.extensions?.code === 'NOT_FOUND' ||
        graphQLError.message.toLowerCase().includes('not found'),
    );
  }
  return (
    error instanceof Error && error.message.toLowerCase().includes('not found')
  );
}

export function isUnauthorizedError(error: unknown): boolean {
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
  const credentialFailure = mapCredentialFailure(error);
  if (credentialFailure) {
    return credentialFailure;
  }

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
