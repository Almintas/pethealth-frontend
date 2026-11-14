import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { createInstance } from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import en from '../../../i18n/locales/en';
import { getUserFacingErrorMessage } from './get-auth-error-message';

// The app's i18n module touches the DOM; use a plain instance with real strings.
const i18n = vi.hoisted(() => ({ current: undefined as unknown }));
vi.mock('../../../i18n', async () => {
  const instance = createInstance();
  await instance.init({ lng: 'en', resources: { en: { translation: en } } });
  i18n.current = instance;
  return { i18n: instance, default: instance };
});
const t = (key: string) =>
  (i18n.current as { t: (key: string) => string }).t(key);

function graphQLError(message: string, code: string): CombinedGraphQLErrors {
  return new CombinedGraphQLErrors({
    errors: [{ message, extensions: { code } }],
  });
}

describe('getUserFacingErrorMessage', () => {
  it('reports wrong credentials as such, not as an expired session', () => {
    expect(
      getUserFacingErrorMessage(graphQLError('Invalid credentials', 'UNAUTHENTICATED'), 'auth'),
    ).toBe(t('errors.invalidCredentials'));
  });

  it('reports a rejected token as an expired session', () => {
    expect(
      getUserFacingErrorMessage(graphQLError('Unauthorized', 'UNAUTHENTICATED')),
    ).toBe(t('errors.sessionExpired'));
  });
});
