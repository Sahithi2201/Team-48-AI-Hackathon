/**
 * CivicMind Supported Civic Service Locations Registry & Validation
 * 
 * CivicMind operates strictly in these 10 designated municipal service locations:
 * 1. Vijayawada
 * 2. Guntur
 * 3. Khammam
 * 4. Kothagudem
 * 5. Rajamahendravaram
 * 6. Tenali
 * 7. Bapatla
 * 8. Chirala
 * 9. Bhimavaram
 * 10. Aswaraopeta
 */

export interface SupportedCivicLocation {
  id: string;
  name: string;
  teluguName?: string;
  state: 'Andhra Pradesh' | 'Telangana';
  district: string;
  jurisdictionZone: string;
  center: {
    lat: number;
    lng: number;
  };
  maxRadiusKm: number;
  aliases: string[];
  popularAreas: string[];
  postalCodes: string[];
}

export const SUPPORTED_CIVIC_LOCATIONS: SupportedCivicLocation[] = [
  {
    id: 'vijayawada',
    name: 'Vijayawada',
    teluguName: 'విజయవాడ',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    jurisdictionZone: 'Vijayawada Municipal Corporation (VMC)',
    center: { lat: 16.5062, lng: 80.6480 },
    maxRadiusKm: 32,
    aliases: ['vijayawada', 'vijaywada', 'bezawada', 'ntr', 'krishna district', 'gunadala', 'bhavanipuram', 'labbipet', 'benz circle', 'governorpet', 'patamata', 'satyanarayanapuram', 'auto nagar vijayawada'],
    popularAreas: ['Benz Circle', 'Governorpet', 'Moghalrajpuram', 'Labbipet', 'One Town', 'Patamata', 'Gunadala', 'Bhavanipuram', 'Satyanarayanapuram', 'Auto Nagar'],
    postalCodes: ['520001', '520002', '520003', '520007', '520008', '520010', '520012']
  },
  {
    id: 'guntur',
    name: 'Guntur',
    teluguName: 'గుంటూరు',
    state: 'Andhra Pradesh',
    district: 'Guntur District',
    jurisdictionZone: 'Guntur Municipal Corporation (GMC)',
    center: { lat: 16.3067, lng: 80.4365 },
    maxRadiusKm: 30,
    aliases: ['guntur', 'gunturu', 'arundelpet', 'brodipet', 'pattabhipuram', 'lakshmipuram', 'kothapet guntur', 'nagarampalem', 'guvvalagutta', 'nallapadu'],
    popularAreas: ['Arundelpet', 'Brodipet', 'Pattabhipuram', 'Lakshmipuram', 'Kothapet', 'Nagarampalem', 'Syndicate Bank Colony', 'Nallapadu', 'Old Guntur'],
    postalCodes: ['522001', '522002', '522003', '522004', '522006', '522007']
  },
  {
    id: 'khammam',
    name: 'Khammam',
    teluguName: 'ఖమ్మం',
    state: 'Telangana',
    district: 'Khammam District',
    jurisdictionZone: 'Khammam Municipal Corporation (KMC)',
    center: { lat: 17.2473, lng: 80.1514 },
    maxRadiusKm: 30,
    aliases: ['khammam', 'khammam urban', 'khammam rural', 'wyra road', 'mamillagudem', 'rotary nagar', 'vdo colony', 'kothapet khammam', 'nst colony', 'gandhi nagar khammam', 'konijerla'],
    popularAreas: ['Wyra Road', 'Mamillagudem', 'Rotary Nagar', 'VDO Colony', 'Kothapet', 'NST Colony', 'Gandhi Nagar', 'Trunk Road', 'Bypass Road', 'Collectorate Zone'],
    postalCodes: ['507001', '507002', '507003', '507165']
  },
  {
    id: 'kothagudem',
    name: 'Kothagudem',
    teluguName: 'కొత్తగూడెం',
    state: 'Telangana',
    district: 'Bhadradri Kothagudem District',
    jurisdictionZone: 'Kothagudem Municipality & Singareni Urban Zone',
    center: { lat: 17.5529, lng: 80.6190 },
    maxRadiusKm: 28,
    aliases: ['kothagudem', 'bhadradri kothagudem', 'palwancha', 'singareni', 'rudrampur', 'chunchupally', 'sujathanagar', 'ramavaram'],
    popularAreas: ['MG Road', 'Rudrampur', 'Ramavaram', 'Chunchupally', 'Singareni Colliery Zone', 'Clock Tower Area', 'Sujatha Nagar', 'Vidyanagar'],
    postalCodes: ['507101', '507115', '507118', '507120']
  },
  {
    id: 'rajamahendravaram',
    name: 'Rajamahendravaram',
    teluguName: 'రాజమహేంద్రవరం',
    state: 'Andhra Pradesh',
    district: 'East Godavari District',
    jurisdictionZone: 'Rajamahendravaram Municipal Corporation (RMC)',
    center: { lat: 17.0005, lng: 81.8040 },
    maxRadiusKm: 30,
    aliases: ['rajamahendravaram', 'rajahmundry', 'rajamahendra varam', 'east godavari', 'danavaipeta', 'morampudi', 'kotipalli', 'kambala tank', 'innespeta', 'alcot gardens'],
    popularAreas: ['Danavaipeta', 'Morampudi', 'Kotipalli Bus Stand', 'Kambala Tank', 'Innespeta', 'Alcot Gardens', 'Prakash Nagar', 'Aryapuram', 'Godavari Bund Road'],
    postalCodes: ['533101', '533102', '533103', '533104', '533105', '533106']
  },
  {
    id: 'tenali',
    name: 'Tenali',
    teluguName: 'తెనాలి',
    state: 'Andhra Pradesh',
    district: 'Guntur District',
    jurisdictionZone: 'Tenali Special Grade Municipality',
    center: { lat: 16.2437, lng: 80.6400 },
    maxRadiusKm: 24,
    aliases: ['tenali', 'andhra paris', 'morampudi tenali', 'nandivelugu', 'chenchupet', 'kothapeta tenali', 'gandhinagar tenali', 'sultanabad'],
    popularAreas: ['Chenchupet', 'Kothapeta', 'Gandhinagar', 'Station Road', 'Bose Road', 'Nandivelugu Road', 'Sultanabad', 'Nazpet', 'Prakasam Road'],
    postalCodes: ['522201', '522202', '522211']
  },
  {
    id: 'bapatla',
    name: 'Bapatla',
    teluguName: 'బాపట్ల',
    state: 'Andhra Pradesh',
    district: 'Bapatla District',
    jurisdictionZone: 'Bapatla Municipal Council & Coast Division',
    center: { lat: 15.9042, lng: 80.4674 },
    maxRadiusKm: 25,
    aliases: ['bapatla', 'suryalanka', 'karlapalem', 'appikatla', 'bapatla beach', 'ag college road bapatla'],
    popularAreas: ['Ag College Road', 'Station Road', 'GBC Road', 'Suryalanka Beach Road', 'Vidyanagar', 'Salipet', 'Panchayat Area', 'Old Town Bapatla'],
    postalCodes: ['522101', '522102', '522104']
  },
  {
    id: 'chirala',
    name: 'Chirala',
    teluguName: 'చీరాల',
    state: 'Andhra Pradesh',
    district: 'Bapatla District',
    jurisdictionZone: 'Chirala Municipal Council',
    center: { lat: 15.8281, lng: 80.3524 },
    maxRadiusKm: 25,
    aliases: ['chirala', 'vetapalem', 'kothapet chirala', 'vodarevu', 'perala', 'ramnagar chirala', 'bapuji nagar chirala'],
    popularAreas: ['Perala', 'Kothapet', 'Ramnagar', 'Vodarevu Beach Road', 'Bapuji Nagar', 'Handloom Market Zone', 'Railway Station Road', 'Gantur Road'],
    postalCodes: ['523155', '523156', '523157', '523187']
  },
  {
    id: 'bhimavaram',
    name: 'Bhimavaram',
    teluguName: 'భీమవరం',
    state: 'Andhra Pradesh',
    district: 'West Godavari District',
    jurisdictionZone: 'Bhimavaram Municipal Council & Delta Zone',
    center: { lat: 16.5449, lng: 81.5212 },
    maxRadiusKm: 26,
    aliases: ['bhimavaram', 'west godavari', 'one town bhimavaram', 'two town bhimavaram', 'someshwaram', 'srkr road', 'mavullamma temple area', 'balusumoodi'],
    popularAreas: ['Balusumoodi', 'Someshwaram', 'SRKR Engineering College Zone', 'Mavullamma Temple Area', 'One Town', 'Two Town', 'Sunday Market Road', 'Penumantra Road'],
    postalCodes: ['534201', '534202', '534203', '534204']
  },
  {
    id: 'aswaraopeta',
    name: 'Aswaraopeta',
    teluguName: 'అశ్వారావుపేట',
    state: 'Telangana',
    district: 'Bhadradri Kothagudem District',
    jurisdictionZone: 'Aswaraopeta Major Gram Panchayat / Civic Zone',
    center: { lat: 17.2464, lng: 81.1309 },
    maxRadiusKm: 24,
    aliases: ['aswaraopeta', 'aswaraopet', 'ashwaraopet', 'aswaropet', 'asupaka', 'dammapeta road', 'vinayakapuram', 'gandhi nagar aswaraopeta'],
    popularAreas: ['Main Bazaar', 'Dammapeta Road', 'Agri College Campus Area', 'RTC Bus Stand Zone', 'Vinayakapuram', 'Gandhi Nagar', 'Police Station Road', 'Khammam Highway'],
    postalCodes: ['507301', '507302']
  }
];

export const SUPPORTED_LOCATION_NAMES = SUPPORTED_CIVIC_LOCATIONS.map(l => l.name);

export const SUPPORTED_LOCATIONS_SUMMARY = 
  'Vijayawada, Guntur, Khammam, Kothagudem, Rajamahendravaram, Tenali, Bapatla, Chirala, Bhimavaram, and Aswaraopeta';

/**
 * Calculates Great-circle distance between two coordinate pairs using Haversine formula in KM.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export interface LocationValidationOutcome {
  isSupported: boolean;
  matchedLocation?: SupportedCivicLocation;
  distanceKm?: number;
  confidence: number;
  reason: string;
  errorMessage?: string;
  suggestedAction?: string;
}

/**
 * Validates whether a given city name, formatted address, or geographic coordinate set
 * is strictly within one of the 10 allowed CivicMind municipal service locations.
 */
export function validateCivicServiceLocation(params: {
  cityName?: string;
  areaName?: string;
  colonyName?: string;
  formattedAddress?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}): LocationValidationOutcome {
  const cleanCity = (params.cityName || '').trim().toLowerCase();
  const cleanArea = (params.areaName || '').trim().toLowerCase();
  const cleanColony = (params.colonyName || '').trim().toLowerCase();
  const cleanAddr = (params.formattedAddress || '').trim().toLowerCase();
  const cleanPostal = (params.postalCode || '').trim();
  const lat = params.lat;
  const lng = params.lng;

  // 1. Textual Exact or Substring Match against City / Aliases / Popular Areas
  for (const loc of SUPPORTED_CIVIC_LOCATIONS) {
    const locNameLower = loc.name.toLowerCase();
    const locId = loc.id.toLowerCase();

    // Check direct city name matches
    if (
      cleanCity === locNameLower ||
      cleanCity === locId ||
      cleanCity.includes(locNameLower) ||
      locNameLower.includes(cleanCity)
    ) {
      return {
        isSupported: true,
        matchedLocation: loc,
        confidence: 0.99,
        reason: `Matched supported service location: ${loc.name} (${loc.jurisdictionZone}).`
      };
    }

    // Check aliases
    const matchedAlias = loc.aliases.some(alias => 
      cleanCity.includes(alias) || 
      cleanArea.includes(alias) || 
      cleanColony.includes(alias) || 
      cleanAddr.includes(alias)
    );
    if (matchedAlias) {
      return {
        isSupported: true,
        matchedLocation: loc,
        confidence: 0.96,
        reason: `Matched jurisdiction area for ${loc.name} (${loc.jurisdictionZone}).`
      };
    }

    // Check popular areas
    const matchedArea = loc.popularAreas.some(pa => {
      const paLower = pa.toLowerCase();
      return cleanArea.includes(paLower) || cleanColony.includes(paLower) || cleanAddr.includes(paLower);
    });
    if (matchedArea) {
      return {
        isSupported: true,
        matchedLocation: loc,
        confidence: 0.95,
        reason: `Matched recognized civic locality in ${loc.name}.`
      };
    }

    // Check postal codes
    if (cleanPostal && loc.postalCodes.includes(cleanPostal)) {
      return {
        isSupported: true,
        matchedLocation: loc,
        confidence: 0.98,
        reason: `Postal code ${cleanPostal} verified in ${loc.name} jurisdiction.`
      };
    }
  }

  // 2. Coordinate-Based Proximity Radius Validation
  if (lat && lng && (lat !== 0 || lng !== 0)) {
    let closestLocation: SupportedCivicLocation | undefined;
    let minDistance = Infinity;

    for (const loc of SUPPORTED_CIVIC_LOCATIONS) {
      const dist = calculateHaversineDistanceKm(lat, lng, loc.center.lat, loc.center.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestLocation = loc;
      }
    }

    if (closestLocation && minDistance <= closestLocation.maxRadiusKm) {
      return {
        isSupported: true,
        matchedLocation: closestLocation,
        distanceKm: minDistance,
        confidence: 0.95,
        reason: `Coordinates (${lat}, ${lng}) lie within ${minDistance}km of ${closestLocation.name} service center.`
      };
    } else if (closestLocation) {
      return {
        isSupported: false,
        matchedLocation: closestLocation,
        distanceKm: minDistance,
        confidence: 0.95,
        reason: `Selected coordinates (${lat}, ${lng}) are ${minDistance}km away from nearest supported center (${closestLocation.name}), exceeding the ${closestLocation.maxRadiusKm}km operational boundary.`,
        errorMessage: `Selected location is outside CivicMind supported service areas. CivicMind operates strictly in: ${SUPPORTED_LOCATIONS_SUMMARY}.`,
        suggestedAction: `Please choose a location within ${closestLocation.name} or one of the other 9 supported cities.`
      };
    }
  }

  // 3. Fallback: Not matched
  return {
    isSupported: false,
    confidence: 0.90,
    reason: `Location "${params.cityName || params.formattedAddress || 'Unknown'}" is not within the 10 authorized CivicMind municipal service locations.`,
    errorMessage: `Selected location is outside CivicMind supported service areas. CivicMind operates only in: ${SUPPORTED_LOCATIONS_SUMMARY}.`,
    suggestedAction: 'Please select one of the 10 supported civic service cities to report your grievance.'
  };
}

/**
 * Finds the nearest supported civic service city for any given latitude / longitude.
 */
export function getNearestSupportedCivicLocation(
  lat: number,
  lng: number
): { location: SupportedCivicLocation; distanceKm: number } {
  let nearest = SUPPORTED_CIVIC_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of SUPPORTED_CIVIC_LOCATIONS) {
    const dist = calculateHaversineDistanceKm(lat, lng, loc.center.lat, loc.center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }
  }

  return { location: nearest, distanceKm: minDistance };
}
