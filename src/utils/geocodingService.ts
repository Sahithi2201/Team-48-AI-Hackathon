import { 
  SUPPORTED_CIVIC_LOCATIONS, 
  validateCivicServiceLocation 
} from './supportedLocations';

/**
 * Geocoding and Location utility service supporting Google Maps Geocoder
 * and OpenStreetMap Nominatim / Photon reverse geocoding for real readable addresses.
 */

export interface GeocodedAddress {
  formattedAddress: string;
  city: string;
  area: string;
  colony: string;
  street: string;
  state?: string;
  country?: string;
  postalCode: string;
  landmark?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

/**
 * Reverse geocode latitude and longitude into a clean, human-readable address
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<GeocodedAddress> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const street = [addr.house_number, addr.road].filter(Boolean).join(' ') || addr.road || addr.suburb || '';
        const colony = addr.neighbourhood || addr.suburb || addr.residential || addr.village || addr.quarter || street || 'Civic Ward';
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || 'Vijayawada';
        const area = addr.suburb || addr.city_district || addr.county || colony || 'Central Zone';
        const state = addr.state || 'Andhra Pradesh';
        const postalCode = addr.postcode || '';
        const country = addr.country || 'India';

        // Build clean readable address string
        const addressParts = [
          street,
          colony !== street ? colony : '',
          area !== colony && area !== city ? area : '',
          city,
          state,
          country
        ].filter(Boolean);

        const cleanAddress = addressParts.join(', ') || data.display_name;

        return {
          formattedAddress: cleanAddress,
          city,
          area,
          colony,
          street,
          state,
          country,
          postalCode,
          landmark: addr.amenity || addr.building || '',
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          placeId: data.place_id ? String(data.place_id) : undefined,
        };
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding fetch error:', err);
  }

  // Fallback to closest supported city
  const serviceCheck = validateCivicServiceLocation({ lat, lng });
  const matched = serviceCheck.matchedLocation || SUPPORTED_CIVIC_LOCATIONS[0];

  return {
    formattedAddress: `Main Road, ${matched.popularAreas[0] || 'Civic Area'}, ${matched.name}, ${matched.state}, India`,
    city: matched.name,
    area: matched.popularAreas[0] || 'Central Zone',
    colony: `${matched.name} Locality`,
    street: 'Main Road',
    state: matched.state,
    country: 'India',
    postalCode: matched.postalCodes[0] || '520001',
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
  };
}

/**
 * Search locations by query string (e.g., "Vijayawada", "Guntur", "Khammam", "Tenali", "Bapatla")
 */
export async function searchLocationsByQuery(query: string): Promise<Array<{
  displayName: string;
  lat: number;
  lng: number;
  addressData: GeocodedAddress;
}>> {
  if (!query || query.trim().length < 2) return [];

  const lowerQuery = query.trim().toLowerCase();
  const localMatches: Array<{
    displayName: string;
    lat: number;
    lng: number;
    addressData: GeocodedAddress;
  }> = [];

  // 1. Instant match from local 10 supported cities and their popular areas
  for (const loc of SUPPORTED_CIVIC_LOCATIONS) {
    if (loc.name.toLowerCase().includes(lowerQuery) || loc.id.includes(lowerQuery) || loc.aliases.some(a => a.includes(lowerQuery))) {
      localMatches.push({
        displayName: `${loc.name}, ${loc.district}, ${loc.state} (${loc.jurisdictionZone})`,
        lat: loc.center.lat,
        lng: loc.center.lng,
        addressData: {
          formattedAddress: `${loc.name} Central, ${loc.district}, ${loc.state}, India`,
          city: loc.name,
          area: loc.popularAreas[0] || 'Central Zone',
          colony: `${loc.name} Civic Ward`,
          street: 'Main Road',
          state: loc.state,
          country: 'India',
          postalCode: loc.postalCodes[0] || '',
          landmark: loc.jurisdictionZone,
          lat: loc.center.lat,
          lng: loc.center.lng,
          placeId: `local-${loc.id}`
        }
      });
    }

    // Check popular areas within this supported city
    for (const pa of loc.popularAreas) {
      if (pa.toLowerCase().includes(lowerQuery)) {
        localMatches.push({
          displayName: `${pa}, ${loc.name}, ${loc.state}`,
          lat: loc.center.lat,
          lng: loc.center.lng,
          addressData: {
            formattedAddress: `${pa}, ${loc.name}, ${loc.district}, ${loc.state}, India`,
            city: loc.name,
            area: pa,
            colony: `${pa} Sector`,
            street: `${pa} Main Road`,
            state: loc.state,
            country: 'India',
            postalCode: loc.postalCodes[0] || '',
            landmark: `${pa} Landmark`,
            lat: loc.center.lat,
            lng: loc.center.lng,
            placeId: `local-${loc.id}-${pa.replace(/\s+/g, '-').toLowerCase()}`
          }
        });
      }
    }
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=6`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        const remoteResults = list.map(item => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const addr = item.address || {};

          const street = [addr.house_number, addr.road].filter(Boolean).join(' ') || addr.road || addr.suburb || '';
          const colony = addr.neighbourhood || addr.suburb || addr.residential || addr.village || addr.quarter || street || 'Civic Locality';
          const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || item.name || 'District';
          const area = addr.suburb || addr.city_district || addr.county || colony || 'Central Zone';
          const state = addr.state || '';
          const postalCode = addr.postcode || '';
          const country = addr.country || 'India';

          const addressParts = [
            item.name,
            street !== item.name ? street : '',
            colony !== item.name && colony !== street ? colony : '',
            city,
            state,
            country
          ].filter(Boolean);

          const formattedAddress = addressParts.join(', ') || item.display_name;

          return {
            displayName: item.display_name,
            lat,
            lng,
            addressData: {
              formattedAddress,
              city,
              area,
              colony,
              street,
              state,
              country,
              postalCode,
              landmark: item.name || addr.amenity || '',
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
              placeId: String(item.place_id)
            }
          };
        });

        // Combine local fast matches first, then remote results (deduped)
        const combined = [...localMatches];
        for (const rem of remoteResults) {
          if (!combined.some(c => Math.abs(c.lat - rem.lat) < 0.005 && Math.abs(c.lng - rem.lng) < 0.005)) {
            combined.push(rem);
          }
        }
        return combined.slice(0, 8);
      }
    }
  } catch (err) {
    console.warn('Place search error:', err);
  }

  return localMatches;
}
