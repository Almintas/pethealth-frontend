import { getApiBaseUrl } from '../../config/api-base-url';
import { getAccessToken } from '../auth/token-storage';
import type { MedicalRecordAttachment } from './types';

export function formatFileSize(bytes: number, language: string): string {
  const locale = language === 'lt' ? 'lt-LT' : 'en-US';
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(kb)} KB`;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(kb / 1024)} MB`;
}

/**
 * Downloads a file a clinic attached to one of the owner's records. The API
 * needs the Bearer token, so the file is fetched and saved as a blob.
 */
export async function downloadAttachment(
  recordId: string,
  attachment: Pick<MedicalRecordAttachment, 'id' | 'fileName'>,
): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(
    `${getApiBaseUrl()}/medical-records/${encodeURIComponent(recordId)}/attachments/${encodeURIComponent(attachment.id)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  if (!response.ok) {
    throw new Error(`Download failed with HTTP ${response.status}`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
