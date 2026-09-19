/**
 * Owner Portal UX flags — veterinary data is clinic-managed in the future Vet System.
 * Backend authorization should align before production.
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
