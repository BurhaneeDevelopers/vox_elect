/**
 * Auto-detect and cache user location via browser geolocation + reverse geocoding.
 */

import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  zip_code: string;
  state: string;
  country: string;
  country_code: string;
  lat: number;
  lon: number;
  fetched_at: number;
}

const STORAGE_KEY = 'elora_user_location';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function reverse_geocode(lat: number, lon: number): Promise<Partial<UserLocation> | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'User-Agent': 'Elora Civic App',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address || {};

    return {
      zip_code: address.postcode || '',
      state: address.state || '',
      country: address.country || '',
      country_code: address.country_code?.toUpperCase() || '',
      lat,
      lon,
      fetched_at: Date.now(),
    };
  } catch (err) {
    console.error('[reverse_geocode] Error:', err);
    return null;
  }
}

export function useUserLocation() {
  const [location, set_location] = useState<UserLocation | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  const fetch_location = useCallback(async (force_refresh = false) => {
    set_loading(true);
    set_error(null);

    // Check cache first (unless force refresh)
    if (!force_refresh) {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed: UserLocation = JSON.parse(cached);
          const age = Date.now() - parsed.fetched_at;
          
          if (age < CACHE_DURATION_MS) {
            set_location(parsed);
            set_loading(false);
            return;
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }

    // Request geolocation
    if (!navigator.geolocation) {
      set_error('Geolocation not supported');
      set_loading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geo_data = await reverse_geocode(latitude, longitude);

        if (geo_data && geo_data.zip_code) {
          const full_location = geo_data as UserLocation;
          set_location(full_location);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(full_location));
        } else {
          set_error('Could not determine location');
        }
        set_loading(false);
      },
      (err) => {
        set_error(err.message || 'Location access denied');
        set_loading(false);
      },
      {
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    fetch_location();
  }, [fetch_location]);

  const refresh_location = useCallback(() => {
    fetch_location(true);
  }, [fetch_location]);

  return { location, loading, error, refresh_location };
}
