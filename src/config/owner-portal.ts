/**
 * Owner Portal UX flags — veterinary data is clinic-managed by the future Vet System.
 * The API rejects owner mutations for vet health data; this flag controls UI affordances.
 */
export const isVeterinaryHealthDataReadOnly = true;

export const vetManagedSectionCopy = {
  medicalRecords: {
    emptyTitle: 'No medical records yet',
    emptyText:
      'Medical records added by your veterinary clinic will appear here.',
    sectionHint: 'Clinic-managed health history',
  },
  vaccinations: {
    emptyTitle: 'No vaccinations yet',
    emptyText:
      'Vaccination records from your veterinary clinic will appear here.',
    sectionHint: 'Clinic-managed immunization history',
  },
  medications: {
    emptyTitle: 'No medications yet',
    emptyText:
      'Prescriptions and treatment plans from your veterinary clinic will appear here.',
    sectionHint: 'Clinic-managed prescriptions',
  },
} as const;
