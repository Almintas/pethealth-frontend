import { useApolloClient } from '@apollo/client/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorAlert } from '../../../components/feedback';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { EXPORT_MY_DATA_QUERY } from '../account-data.graphql';

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Downloads everything PetHealth holds about the owner as a JSON file. */
export function DataExportCard() {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);
    try {
      const { data } = await client.query<{ exportMyData: string }>({
        query: EXPORT_MY_DATA_QUERY,
        fetchPolicy: 'network-only',
      });
      if (!data?.exportMyData) {
        throw new Error(t('settings.exportFailed'));
      }
      const blob = new Blob([data.exportMyData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pethealth-data-${todayStamp()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(getUserFacingErrorMessage(exportError, 'generic-load'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-export-heading">
      <div className="account-card__header">
        <h2 id="settings-export-heading" className="account-card__title">
          {t('settings.exportTitle')}
        </h2>
        <p className="account-card__hint">{t('settings.exportHint')}</p>
      </div>
      {error ? <ErrorAlert message={error} compact /> : null}
      <div>
        <button
          type="button"
          className="ph-btn ph-btn--secondary"
          onClick={() => void handleExport()}
          disabled={isExporting}
        >
          {isExporting ? t('settings.exporting') : t('settings.exportAction')}
        </button>
      </div>
    </section>
  );
}
