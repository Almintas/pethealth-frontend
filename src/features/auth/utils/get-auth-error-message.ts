import { CombinedGraphQLErrors } from '@apollo/client/errors';

export function getAuthErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    const messages = error.errors
      .map((graphQLError) => graphQLError.message)
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
