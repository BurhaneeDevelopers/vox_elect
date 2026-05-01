/**
 * Location context provider — exposes user location to entire app.
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserLocation, type UserLocation } from '@/hooks/use_user_location';

interface LocationContextValue {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const location_data = useUserLocation();

  return (
    <LocationContext.Provider value={location_data}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
