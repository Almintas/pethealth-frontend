import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MainLayout } from '../layouts/MainLayout';

export function RouteLoading() {
  return (
    <MainLayout>
      <div className="ph-page" role="status" aria-label="Loading application">
        <LoadingSkeleton lines={4} />
      </div>
    </MainLayout>
  );
}
