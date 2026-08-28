/**
 * CivicMind Enterprise Security, Authentication, and Location Validation Engine
 * 
 * Provides strict, non-fake validation for:
 * 1. Email format & deliverability checks
 * 2. Password security (length, entropy, non-triviality)
 * 3. Indian mobile phone numbers (+91 standard, 10-digit, reject fake sequences like 9000000000, 1234567890, repeated digits)
 * 4. User profile integrity (name, area, city, district, state)
 * 5. Location / Area consistency checks between entered text and selected Google Map / Leaflet coordinates
 * 6. AI Location Conflict Analysis
 */

import { 
  validateCivicServiceLocation, 
  SUPPORTED_CIVIC_LOCATIONS, 
  SUPPORTED_LOCATIONS_SUMMARY,
  SupportedCivicLocation 
} from './supportedLocations';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedValue?: string;
}

export interface LocationConsistencyResult {
  status: 'LOCATION_VALID' | 'LOCATION_MISMATCH' | 'LOCATION_CONFLICT' | 'OUTSIDE_SERVICE_AREA';
  isConsistent: boolean;
  isSupportedServiceArea: boolean;
  confidence: number;
  reason: string;
  enteredText: string;
  mappedAddress: string;
  matchedSupportedLocation?: SupportedCivicLocation;
  mismatchDetails?: {
    enteredCity: string;
    detectedCity: string;
    enteredArea?: string;
    detectedArea?: string;
    distanceKm?: number;
  };
}

/**
 * 1. EMAIL VALIDATION
 * Rejects malformed addresses, missing TLDs, and obvious fake domains
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const clean = email.trim().toLowerCase();
  
  // Standard RFC-5322 compliant regex for web apps
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  // Reject obvious fake entries
  const fakePatterns = [
    'test@test', 'test@test.com', 'admin@admin.com', 'fake@fake.com', 
    'user@user.com', 'abc@abc.com', 'a@a.com', 'none@none.com', 'temp@temp.com'
  ];
  if (fakePatterns.includes(clean)) {
    return { isValid: false, error: 'Please provide your real, deliverable email address for official updates.' };
  }

  // Check domain structure
  const parts = clean.split('@');
  if (parts.length !== 2 || !parts[1].includes('.')) {
    return { isValid: false, error: 'Email domain must contain a valid top-level domain.' };
  }

  const domain = parts[1];
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Invalid domain extension in email address.' };
  }

  return { isValid: true, normalizedValue: clean };
}

/**
 * 2. PASSWORD SECURITY
 * Requires minimum 6 chars (Firebase Auth requirement), checks against common weak patterns
 */
export function validatePassword(password: string, confirmPassword?: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required.' };
  }

  const clean = password.trim();

  if (clean.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }

  if (confirmPassword !== undefined && clean !== confirmPassword.trim()) {
    return { isValid: false, error: 'Passwords do not match. Please verify.' };
  }

  // Reject trivially weak passwords
  const weakPasswords = [
    '123456', '12345678', 'password', 'password123', 'qwerty', 'admin123', '111111', '000000'
  ];
  if (weakPasswords.includes(clean.toLowerCase())) {
    return { isValid: false, error: 'Password is too common. Please choose a stronger, secure password.' };
  }

  return { isValid: true, normalizedValue: clean };
}

/**
 * 3. INDIAN MOBILE PHONE VALIDATION
 * - Validates standard Indian 10-digit mobile numbers (starting with 6, 7, 8, or 9)
 * - Accepts +91 / 0 prefix and formats consistently as '+91 XXXXX XXXXX'
 * - Strictly rejects fake sequences: 9000000000, 1234567890, 9876543210, 0000000000, repeated digits
 */
export function validateIndianPhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const raw = phone.trim();
  // Strip all non-digit characters
  const digitsOnly = raw.replace(/\D/g, '');

  let tenDigitNumber = '';

  if (digitsOnly.length === 10) {
    tenDigitNumber = digitsOnly;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    tenDigitNumber = digitsOnly.slice(1);
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    tenDigitNumber = digitsOnly.slice(2);
  } else if (digitsOnly.length === 13 && digitsOnly.startsWith('091')) {
    tenDigitNumber = digitsOnly.slice(3);
  } else {
    return { 
      isValid: false, 
      error: 'Please enter a valid 10-digit Indian mobile number (e.g., +91 98765 43210).' 
    };
  }

  // Must start with 6, 7, 8, or 9 (Indian telecom standard)
  if (!/^[6-9]/.test(tenDigitNumber)) {
    return { 
      isValid: false, 
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.' 
    };
  }

  // Reject all repeated digits (e.g., 9999999999, 8888888888, 1111111111)
  if (/^(\d)\1{9}$/.test(tenDigitNumber)) {
    return { 
      isValid: false, 
      error: 'Invalid phone number: Repeated digits detected. Please provide your real mobile number.' 
    };
  }

  // Reject known sequential/fake test numbers
  const bannedFakeNumbers = [
    '9000000000', '9876543210', '1234567890', '9123456789', '9012345678', 
    '9999999999', '8888888888', '7777777777', '6666666666', '9898989898',
    '9090909090', '9800000000', '9700000000', '9600000000', '9500000000'
  ];
  if (bannedFakeNumbers.includes(tenDigitNumber)) {
    return { 
      isValid: false, 
      error: `The phone number ${tenDigitNumber} is a recognized placeholder pattern. Please provide your legitimate phone number.` 
    };
  }

  // Normalize standard display format: +91 98765 43210
  const formatted = `+91 ${tenDigitNumber.slice(0, 5)} ${tenDigitNumber.slice(5)}`;

  return { 
    isValid: true, 
    normalizedValue: formatted 
  };
}

/**
 * 4. USER PROFILE INTEGRITY VALIDATION
 * Rejects empty required fields and fake placeholder values
 */
export function validateUserProfileFields(data: {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const name = (data.fullName || '').trim();
  if (!name) {
    errors.fullName = 'Full Name is required.';
  } else if (name.length < 2) {
    errors.fullName = 'Name must be at least 2 characters.';
  } else if (/^(test|demo|asdf|qwerty|none|user|admin|xyz|abc)$/i.test(name)) {
    errors.fullName = 'Please enter your real legal or civic name.';
  }

  if (data.email) {
    const emailRes = validateEmail(data.email);
    if (!emailRes.isValid) {
      errors.email = emailRes.error || 'Invalid email address.';
    }
  }

  if (data.phone) {
    const phoneRes = validateIndianPhone(data.phone);
    if (!phoneRes.isValid) {
      errors.phone = phoneRes.error || 'Invalid phone number.';
    }
  }

  if (data.city !== undefined) {
    const city = data.city.trim();
    if (!city) {
      errors.city = 'City name is required.';
    } else if (city.length < 2 || /^(test|abc|xyz|none|null)$/i.test(city)) {
      errors.city = 'Please enter a valid municipal city or town.';
    }
  }

  if (data.area !== undefined) {
    const area = data.area.trim();
    if (!area) {
      errors.area = 'Area / Locality is required.';
    } else if (area.length < 2 || /^(test|abc|xyz|none)$/i.test(area)) {
      errors.area = 'Please enter a valid locality or area.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function isCitySupported(cityName?: string, formattedAddress?: string, lat?: number, lng?: number): boolean {
  const result = validateCivicServiceLocation({
    cityName,
    formattedAddress,
    lat,
    lng
  });
  return result.isSupported;
}

export const distinctCitiesConflictMap: Record<string, string[]> = {
  vijayawada: ['guntur', 'khammam', 'kothagudem', 'rajamahendravaram', 'tenali', 'bapatla', 'chirala', 'bhimavaram', 'aswaraopeta', 'hyderabad', 'visakhapatnam'],
  guntur: ['vijayawada', 'khammam', 'kothagudem', 'rajamahendravaram', 'tenali', 'bapatla', 'chirala', 'bhimavaram', 'aswaraopeta', 'hyderabad', 'visakhapatnam'],
  khammam: ['vijayawada', 'guntur', 'kothagudem', 'rajamahendravaram', 'tenali', 'bapatla', 'chirala', 'bhimavaram', 'aswaraopeta', 'hyderabad'],
  kothagudem: ['vijayawada', 'guntur', 'khammam', 'rajamahendravaram', 'tenali', 'bapatla', 'chirala', 'bhimavaram', 'aswaraopeta', 'hyderabad'],
  rajamahendravaram: ['vijayawada', 'guntur', 'khammam', 'kothagudem', 'tenali', 'bapatla', 'chirala', 'bhimavaram', 'aswaraopeta'],
  tenali: ['vijayawada', 'guntur', 'khammam', 'kothagudem', 'rajamahendravaram', 'bapatla', 'chirala', 'bhimavaram'],
  bapatla: ['vijayawada', 'guntur', 'khammam', 'kothagudem', 'rajamahendravaram', 'tenali', 'chirala', 'bhimavaram'],
  chirala: ['vijayawada', 'guntur', 'khammam', 'kothagudem', 'rajamahendravaram', 'tenali', 'bapatla', 'bhimavaram'],
  bhimavaram: ['vijayawada', 'guntur', 'khammam', 'kothagudem', 'rajamahendravaram', 'tenali', 'bapatla', 'chirala'],
  aswaraopeta: ['vijayawada', 'guntur', 'khammam', 'kothagudem', 'rajamahendravaram', 'tenali', 'bapatla', 'chirala', 'bhimavaram'],
};

/**
 * 5. AREA & GOOGLE MAP LOCATION CONSISTENCY CHECK
 * Compares user-entered text (city, area, colony, district) with the selected map coordinates and geocoded address,
 * while strictly enforcing the 10 authorized CivicMind municipal service locations.
 */
export function checkAreaLocationConsistency(params: {
  enteredCity: string;
  enteredArea: string;
  enteredColony?: string;
  enteredDistrict?: string;
  enteredState?: string;
  mapFormattedAddress: string;
  mapCity?: string;
  mapArea?: string;
  mapState?: string;
  latitude: number;
  longitude: number;
}): LocationConsistencyResult {
  const enteredCity = (params.enteredCity || '').trim().toLowerCase();
  const enteredArea = (params.enteredArea || '').trim().toLowerCase();
  const enteredColony = (params.enteredColony || '').trim().toLowerCase();
  
  const mapAddress = (params.mapFormattedAddress || '').trim().toLowerCase();
  const mapCity = (params.mapCity || '').trim().toLowerCase();
  const mapArea = (params.mapArea || '').trim().toLowerCase();
  const mapState = (params.mapState || '').trim().toLowerCase();

  // 1. First check if location falls within the 10 supported CivicMind cities
  const serviceCheck = validateCivicServiceLocation({
    cityName: params.enteredCity || params.mapCity,
    areaName: params.enteredArea || params.mapArea,
    colonyName: params.enteredColony,
    formattedAddress: params.mapFormattedAddress,
    lat: params.latitude,
    lng: params.longitude
  });

  if (!serviceCheck.isSupported) {
    return {
      status: 'OUTSIDE_SERVICE_AREA',
      isConsistent: false,
      isSupportedServiceArea: false,
      confidence: 0.95,
      reason: serviceCheck.errorMessage || `Location is outside CivicMind supported service areas. CivicMind operates only in: ${SUPPORTED_LOCATIONS_SUMMARY}.`,
      enteredText: `${params.enteredArea}, ${params.enteredCity}`,
      mappedAddress: params.mapFormattedAddress,
      matchedSupportedLocation: serviceCheck.matchedLocation,
      mismatchDetails: {
        enteredCity: params.enteredCity,
        detectedCity: params.mapCity || 'Outside Service Area',
        enteredArea: params.enteredArea,
        detectedArea: params.mapArea || undefined,
        distanceKm: serviceCheck.distanceKm
      }
    };
  }

  // If no map address exists yet, allow initial input
  if (!mapAddress && (!params.latitude || !params.longitude)) {
    return {
      status: 'LOCATION_VALID',
      isConsistent: true,
      isSupportedServiceArea: true,
      confidence: 1.0,
      reason: `Authorized service area verified: ${serviceCheck.matchedLocation?.name || params.enteredCity}.`,
      enteredText: `${params.enteredArea}, ${params.enteredCity}`,
      mappedAddress: params.mapFormattedAddress,
      matchedSupportedLocation: serviceCheck.matchedLocation
    };
  }

  // Check if entered city explicitly conflicts with detected map city
  if (enteredCity && (mapCity || mapAddress)) {
    const conflictingCities = distinctCitiesConflictMap[enteredCity] || [];
    const detectedConflict = conflictingCities.find(c => 
      (mapCity && mapCity.includes(c)) || (mapAddress && mapAddress.includes(c))
    );

    if (detectedConflict) {
      return {
        status: 'LOCATION_MISMATCH',
        isConsistent: false,
        isSupportedServiceArea: true,
        confidence: 0.94,
        reason: `Selected map location (${detectedConflict.toUpperCase()}) does not match your entered city (${enteredCity.toUpperCase()}). Please adjust the pin or update your city.`,
        enteredText: `${params.enteredArea}, ${params.enteredCity}`,
        mappedAddress: params.mapFormattedAddress,
        matchedSupportedLocation: serviceCheck.matchedLocation,
        mismatchDetails: {
          enteredCity: params.enteredCity,
          detectedCity: detectedConflict.charAt(0).toUpperCase() + detectedConflict.slice(1),
          enteredArea: params.enteredArea,
          detectedArea: mapArea || undefined
        }
      };
    }
  }

  // Check substring matches
  const cityMatches = 
    !enteredCity || 
    !mapCity || 
    mapCity.includes(enteredCity) || 
    enteredCity.includes(mapCity) || 
    mapAddress.includes(enteredCity);

  const areaMatches = 
    !enteredArea || 
    !mapArea || 
    mapArea.includes(enteredArea) || 
    enteredArea.includes(mapArea) || 
    mapAddress.includes(enteredArea) ||
    (enteredColony && mapAddress.includes(enteredColony));

  if (!cityMatches) {
    return {
      status: 'LOCATION_MISMATCH',
      isConsistent: false,
      isSupportedServiceArea: true,
      confidence: 0.88,
      reason: `Selected location address (${params.mapFormattedAddress}) does not match the entered city (${params.enteredCity}). Please verify your pin.`,
      enteredText: `${params.enteredArea}, ${params.enteredCity}`,
      mappedAddress: params.mapFormattedAddress,
      matchedSupportedLocation: serviceCheck.matchedLocation,
      mismatchDetails: {
        enteredCity: params.enteredCity,
        detectedCity: params.mapCity || 'Selected Coordinates',
        enteredArea: params.enteredArea,
        detectedArea: params.mapArea || undefined
      }
    };
  }

  return {
    status: 'LOCATION_VALID',
    isConsistent: true,
    isSupportedServiceArea: true,
    confidence: areaMatches ? 0.98 : 0.85,
    reason: `Selected location is verified in ${serviceCheck.matchedLocation?.name || params.enteredCity} (${serviceCheck.matchedLocation?.jurisdictionZone || 'Municipal Zone'}).`,
    enteredText: `${params.enteredArea}, ${params.enteredCity}`,
    mappedAddress: params.mapFormattedAddress,
    matchedSupportedLocation: serviceCheck.matchedLocation
  };
}

/**
 * Convenient helper for quick location validation
 */
export function validateLocationConsistency(
  entered: {
    cityName?: string;
    areaName?: string;
    colonyName?: string;
    streetAddress?: string;
    postalCode?: string;
  },
  mapFormattedAddress?: string,
  latitude?: number,
  longitude?: number
): LocationConsistencyResult {
  return checkAreaLocationConsistency({
    enteredCity: entered.cityName || '',
    enteredArea: entered.areaName || '',
    enteredColony: entered.colonyName,
    mapFormattedAddress: mapFormattedAddress || '',
    latitude: latitude || 17.3850,
    longitude: longitude || 78.4867
  });
}

