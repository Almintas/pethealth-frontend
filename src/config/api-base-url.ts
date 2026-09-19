/**
 * REST API origin (GraphQL lives at `${apiBaseUrl}/graphql`).
 */
export function getApiBaseUrl(): string {
  const explicit = import.meta.env.VITE_API_BASE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL?.trim();
  if (graphqlUrl) {
    return graphqlUrl.replace(/\/graphql\/?$/i, '');
  }

  throw new Error(
    'Set VITE_GRAPHQL_URL or VITE_API_BASE_URL in your .env file.',
  );
}
