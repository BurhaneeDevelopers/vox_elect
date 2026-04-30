/**
 * TanStack React Query v5 client configuration for VoxElect.
 * Centralises caching, retry, and stale-time defaults.
 */

import { QueryClient } from '@tanstack/react-query';

export function create_query_client(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Election data is relatively stable; cache for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Only retry once on failure — civic APIs can be flaky
        retry: 1,
        retryDelay: (attempt_index) => Math.min(1000 * 2 ** attempt_index, 10000),
        // Don't refetch on window focus for civic data (saves API quota)
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
