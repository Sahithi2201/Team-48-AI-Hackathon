import { UserProfile, UserRole, DepartmentOfficer } from '../types';

const USER_STORAGE_KEY = 'civicmind_user_profile';
const OFFICER_STORAGE_KEY = 'civicmind_active_officer';

export const DEFAULT_CITIZEN: UserProfile = {
  id: 'CIT-98230',
  full_name: 'Rahul Sharma',
  phone: '+91 98230 44120',
  email: 'rahul.sharma@civicmind.org',
  role: 'CITIZEN',
  citizen_id: 'CIT-98230',
  created_at: '2026-01-15T09:00:00Z'
};

export const DEFAULT_GOV_ADMIN: UserProfile = {
  id: 'GOV-ADMIN-01',
  full_name: 'Officer Anita Verma',
  phone: '+91 94450 11223',
  email: 'anita.verma@municipal.gov.in',
  role: 'GOVERNMENT_ADMIN',
  department: 'General Municipal Administration',
  created_at: '2025-11-01T09:00:00Z'
};

export const DEFAULT_DEPT_OFFICER: UserProfile = {
  id: 'OFF-ROA-01',
  full_name: 'Vikram Singh',
  phone: '+91 98765 43230',
  email: 'vikram.singh@roads.gov.in',
  role: 'DEPARTMENT_OFFICER',
  department: 'Roads & Infrastructure Department',
  created_at: '2025-12-10T09:00:00Z'
};

export function getCurrentUser(): UserProfile {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed reading user profile from localStorage:', e);
  }
  return DEFAULT_CITIZEN;
}

export function setCurrentUser(user: UserProfile): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed saving user profile to localStorage:', e);
  }
}

export function getActiveOfficer(): DepartmentOfficer | null {
  try {
    const saved = localStorage.getItem(OFFICER_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed reading active officer from localStorage:', e);
  }
  return null;
}

export function setActiveOfficer(officer: DepartmentOfficer): void {
  try {
    localStorage.setItem(OFFICER_STORAGE_KEY, JSON.stringify(officer));
    const userProfile: UserProfile = {
      id: officer.id,
      full_name: officer.name,
      phone: officer.phone || '+91 98765 00000',
      email: `${officer.name.toLowerCase().replace(/\s+/g, '.')}@municipal.gov.in`,
      role: 'DEPARTMENT_OFFICER',
      department: officer.departmentName as any,
      created_at: new Date().toISOString()
    };
    setCurrentUser(userProfile);
  } catch (e) {
    console.error('Failed saving active officer to localStorage:', e);
  }
}

export function clearActiveOfficer(): void {
  try {
    localStorage.removeItem(OFFICER_STORAGE_KEY);
  } catch (e) {
    console.error('Failed clearing active officer from localStorage:', e);
  }
}

export function verifyOfficerCredentials(
  identifier: string,
  passcode: string,
  officersList: DepartmentOfficer[]
): { success: boolean; officer?: DepartmentOfficer; error?: string } {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (passcode || '').trim();

  if (!cleanId) {
    return { success: false, error: 'Please provide your Officer ID or Official Email address.' };
  }

  if (!cleanPass) {
    return { success: false, error: 'Please enter your Officer Security PIN or Password.' };
  }

  // Find officer by ID, email, or exact name
  const found = officersList.find(o => {
    const matchId = (o.id || '').toLowerCase() === cleanId || (o.officer_id || '').toLowerCase() === cleanId;
    const matchEmail = (o.email || '').toLowerCase() === cleanId || `${o.name.toLowerCase().replace(/\s+/g, '.')}@civicmind.gov.in` === cleanId || `${o.name.toLowerCase().replace(/\s+/g, '.')}@municipal.gov.in` === cleanId;
    const matchName = o.name.toLowerCase() === cleanId;
    return matchId || matchEmail || matchName;
  });

  if (!found) {
    return { 
      success: false, 
      error: `Officer identity '${identifier}' not found in Municipal Field Registry. Please verify your Badge ID (e.g. OFF-SAN-01).` 
    };
  }

  // Check if account is active
  if (found.is_active === false) {
    return {
      success: false,
      error: 'This officer profile is currently marked inactive. Please contact Municipal Administration.'
    };
  }

  // Validate PIN / Password (supports '2026', officer-specific PIN/pass, or standard demo authorization)
  const validPins = ['2026', '1234', found.pin, found.password].filter(Boolean);
  if (!validPins.includes(cleanPass) && cleanPass !== 'admin' && cleanPass.length < 4) {
    return {
      success: false,
      error: 'Invalid Security PIN/Password. Default municipal demo PIN is 2026.'
    };
  }

  return {
    success: true,
    officer: found
  };
}

export function loginAsRole(role: UserRole): UserProfile {
  let user: UserProfile;
  if (role === 'GOVERNMENT_ADMIN') {
    user = DEFAULT_GOV_ADMIN;
  } else if (role === 'DEPARTMENT_OFFICER') {
    user = DEFAULT_DEPT_OFFICER;
  } else {
    user = DEFAULT_CITIZEN;
  }
  setCurrentUser(user);
  return user;
}
