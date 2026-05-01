'use client';

/**
 * Client-side providers: TanStack React Query + query client + Location.
 */

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { create_query_client } from '@/lib/query_client_config';
import { LocationProvider } from '@/context/location_context';

interface providers_props {
  children: React.ReactNode;
}

function Providers({ children }: providers_props) {
  const [query_client] = useState(() => create_query_client());
  return (
    <QueryClientProvider client={query_client}>
      <LocationProvider>
        <Toaster position="top-center" richColors />
        {children}
      </LocationProvider>
    </QueryClientProvider>
  );
}

export { Providers as providers };
