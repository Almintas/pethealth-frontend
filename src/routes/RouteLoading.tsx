import { useTranslation } from 'react-i18next';
import { LoadingState } from '../components/feedback';
import { MainLayout } from '../layouts/MainLayout';

export function RouteLoading() {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="ph-page route-loading" role="status" aria-label={t('common.loading')}>
        <LoadingState message={t('common.loading')} skeleton />
      </div>
    </MainLayout>
  );
}
