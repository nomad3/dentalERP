// Utility and presets to help map source CSV/PDF/JSON headers to canonical target fields
// for manual ingestion. Focuses on patients mapping for now.

export type IngestionTarget = 'patients'; // extend when backend supports more
export type SourceSystem = 'dentrix' | 'dentalintel' | 'adp' | 'eaglesoft';
export type Dataset = 'unknown' | 'patients' | 'appointments' | 'payroll';

// Canonical field sets per target
export const TARGET_FIELDS: Record<IngestionTarget, string[]> = {
  patients: [
    'externalId',
    'firstName',
    'lastName',
    'email',
    'phone',
    'dateOfBirth',
    'gender',
    'notes',
  ],
};

// Header synonyms per source system and dataset → canonical field → list of common header names
const SOURCE_SYNONYMS: Record<SourceSystem, Partial<Record<Dataset | 'patients', Record<string, string[]>>>> = {
  dentrix: {
    patients: {
      externalId: ['patient id', 'patientid', 'chart number', 'chartnumber', 'patnum', 'guarantor id'],
      firstName: ['first name', 'firstname', 'first', 'given name', 'fname'],
      lastName: ['last name', 'lastname', 'last', 'surname', 'lname'],
      email: ['email', 'e-mail', 'email address'],
      phone: ['phone', 'phone number', 'cell', 'cell phone', 'mobile', 'mobile phone', 'home phone', 'work phone'],
      dateOfBirth: ['dob', 'date of birth', 'birthdate', 'birth date'],
      gender: ['gender', 'sex'],
      notes: ['notes', 'comments', 'patient notes'],
    },
  },
  dentalintel: {
    patients: {
      externalId: ['patient id', 'patientid', 'pt id', 'di patient id'],
      firstName: ['first name', 'firstname', 'pt first name'],
      lastName: ['last name', 'lastname', 'pt last name'],
      email: ['email', 'email address'],
      phone: ['phone', 'cell phone', 'mobile', 'mobile phone', 'home phone'],
      dateOfBirth: ['dob', 'date of birth', 'birthdate'],
      gender: ['gender', 'sex'],
      notes: ['notes', 'comments'],
    },
  },
  eaglesoft: {
    patients: {
      externalId: ['patient id', 'patientid', 'chart number', 'account #', 'account number'],
      firstName: ['first name', 'firstname'],
      lastName: ['last name', 'lastname'],
      email: ['email', 'email address'],
      phone: ['phone', 'home phone', 'work phone', 'mobile phone', 'cell'],
      dateOfBirth: ['dob', 'date of birth', 'birthdate'],
      gender: ['gender', 'sex'],
      notes: ['notes', 'comments'],
    },
  },
  adp: {
    // ADP is typically payroll/staff; include a minimal patients mapping in case exports include staff-as-patient
    patients: {
      externalId: ['associate id', 'employee id', 'person id'],
      firstName: ['first name', 'firstname'],
      lastName: ['last name', 'lastname'],
      email: ['email', 'work email', 'personal email'],
      phone: ['phone', 'mobile', 'home phone'],
      dateOfBirth: ['date of birth', 'dob', 'birthdate'],
      gender: ['gender', 'sex'],
      notes: ['notes', 'comments'],
    },
  },
};

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Given available headers, suggest a fieldMap for a source/dataset/target
export function suggestFieldMap(
  headers: string[],
  sourceSystem: SourceSystem,
  dataset: Dataset,
  target: IngestionTarget = 'patients'
): Record<string, string> {
  const result: Record<string, string> = {};
  const canonical = TARGET_FIELDS[target];
  if (!headers || !headers.length) {
    canonical.forEach((f) => (result[f] = ''));
    return result;
  }

  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: normalize(h) }));

  const synonyms = (SOURCE_SYNONYMS[sourceSystem]?.[dataset] || SOURCE_SYNONYMS[sourceSystem]?.[target] || {}) as Record<
    string,
    string[]
  >;

  for (const field of canonical) {
    let mapped = '';

    // 1) Try synonyms first (exact normalized match)
    const syns = (synonyms[field] || []).map(normalize);
    for (const syn of syns) {
      const hit = normalizedHeaders.find((h) => h.norm === syn);
      if (hit) {
        mapped = hit.raw;
        break;
      }
    }

    // 2) Try contains/startsWith heuristics if not found
    if (!mapped) {
      const heuristics = [field, ...syns];
      const hit = normalizedHeaders.find((h) => heuristics.some((k) => h.norm.includes(k)));
      if (hit) mapped = hit.raw;
    }

    result[field] = mapped; // may be '' if not found
  }

  return result;
}

export function requiredFields(target: IngestionTarget = 'patients'): string[] {
  if (target === 'patients') return ['firstName', 'lastName'];
  return [];
}

export function isFieldMapComplete(fieldMap: Record<string, string>, target: IngestionTarget = 'patients') {
  const req = requiredFields(target);
  return req.every((k) => (fieldMap?.[k] || '').trim().length > 0);
}

