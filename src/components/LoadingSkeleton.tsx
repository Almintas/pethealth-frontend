import { useTranslation } from 'react-i18next';
import './loading-skeleton.css';

type LoadingSkeletonProps = {
  lines?: number;
  label?: string;
};

export function LoadingSkeleton({
  lines = 3,
  label,
}: LoadingSkeletonProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('common.loadingContent');

  return (
    <div className="loading-skeleton" role="status" aria-label={resolvedLabel}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="loading-skeleton__line"
          style={{ width: `${88 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
