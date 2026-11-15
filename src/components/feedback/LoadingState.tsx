import './feedback.css';

type LoadingStateProps = {
  message: string;
  skeleton?: boolean;
  skeletonLines?: number;
};

export function LoadingState({
  message,
  skeleton = false,
  skeletonLines = 3,
}: LoadingStateProps) {
  return (
    <div className="ph-loading" role="status" aria-live="polite">
      <p className="ph-loading__message">{message}</p>
      {skeleton ? (
        <div className="ph-loading__skeleton" aria-hidden="true">
          {Array.from({ length: skeletonLines }).map((_, index) => (
            <div
              key={index}
              className={[
                'ph-loading__skeleton-line',
                index === skeletonLines - 1 ? 'ph-loading__skeleton-line--short' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
