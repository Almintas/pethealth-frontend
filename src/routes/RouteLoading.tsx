import { MainLayout } from '../layouts/MainLayout';

export function RouteLoading() {
  return (
    <MainLayout>
      <p className="app__loading">Loading…</p>
    </MainLayout>
  );
}
