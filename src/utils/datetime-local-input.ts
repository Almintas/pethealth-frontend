/** Format an ISO instant for `<input type="datetime-local" />` in local wall time. */
export function isoToDatetimeLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse a datetime-local value (local wall time) to an ISO UTC string for the API. */
export function datetimeLocalInputToIso(localValue: string): string {
  return new Date(localValue).toISOString();
}
