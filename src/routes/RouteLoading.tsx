import { LoadingState } from '../components/feedback';
import { MainLayout } from '../layouts/MainLayout';

export function RouteLoading() {
  return (
    <MainLayout>
      <div className="ph-page route-loading" role="status" aria-label="Loading application">
        <LoadingState message="Checking your session…" skeleton />
      </div>
    </MainLayout>
  );
}
