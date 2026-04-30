'use client';

/**
 * Client-side providers: TanStack React Query + query client.
 */

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { create_query_client } from '@/lib/query_client_config';

interface providers_props {
  children: React.ReactNode;
}

function Providers({ children }: providers_props) {
  const [query_client] = useState(() => create_query_client());
  return <QueryClientProvider client={query_client}>{children}</QueryClientProvider>;
}

export { Providers as providers };
