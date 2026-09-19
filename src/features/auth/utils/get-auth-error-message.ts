import { CombinedGraphQLErrors } from '@apollo/client/errors';

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

const CONTEXT_MESSAGES: Record<UserErrorContext, string> = {
  auth: 'We could not sign you in. Check your email and password, then try again.',
  'load-pets': "We couldn't load your pets. Please try again.",
  'load-pet': "We couldn't load this pet. Please try again.",
  'save-pet': "We couldn't save this pet. Please try again.",
  'load-medical-records': "We couldn't load medical records. Please try again.",
  'save-medical-record': "We couldn't save this medical record. Please try again.",
  'load-vaccinations': "We couldn't load vaccinations. Please try again.",
  'save-vaccination': "We couldn't save this vaccination. Please try again.",
  'load-medications': "We couldn't load medications. Please try again.",
  'save-medication': "We couldn't save this medication. Please try again.",
  'load-appointments': "We couldn't load appointments. Please try again.",
  'save-appointment': "We couldn't save this appointment. Please try again.",
  'load-reminders': "We couldn't load reminders. Please try again.",
  'save-reminder': "We couldn't save this reminder. Please try again.",
  'generic-load': "We couldn't load this information. Please try again.",
  'generic-save': "We couldn't save your changes. Please try again.",
};

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

  return messages.join(' ');
}

export function getUserFacingErrorMessage(
  error: unknown,
  context: UserErrorContext = 'generic-load',
): string {
  if (isUnauthorizedError(error)) {
    return 'Your session may have expired. Please sign in again.';
  }

  if (isNetworkError(error)) {
    return CONTEXT_MESSAGES[context];
  }

  const graphQLErrorMessage = readGraphQLErrorMessage(error);
  if (graphQLErrorMessage) {
    if (graphQLErrorMessage.toLowerCase().includes('not found')) {
      return 'The requested item could not be found.';
    }
    return graphQLErrorMessage;
  }

  if (error instanceof Error && error.message && !isTechnicalMessage(error.message)) {
    if (error.message.toLowerCase().includes('not found')) {
      return 'The requested item could not be found.';
    }
    return error.message;
  }

  return CONTEXT_MESSAGES[context];
}

export function getAuthErrorMessage(
  error: unknown,
  context: UserErrorContext = 'generic-load',
): string {
  return getUserFacingErrorMessage(error, context);
}
