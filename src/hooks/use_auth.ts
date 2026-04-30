'use client';

/**
 * Authentication hook using TanStack React Query
 * Manages user authentication state and operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  get_current_user,
  login_user,
  logout_user,
  register_user,
} from '@/services/auth_service';
import { supabase_client } from '@/lib/supabase_client';
import type { auth_credentials, registration_data, user_profile } from '@/types/auth_types';

const AUTH_QUERY_KEY = ['auth', 'user'];

/**
 * Hook to get current authenticated user
 */
export function use_current_user() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: get_current_user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Hook for user login
 */
export function use_login() {
  const query_client = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: auth_credentials) => login_user(credentials),
    onSuccess: (user: user_profile) => {
      // Update cache with user data
      query_client.setQueryData(AUTH_QUERY_KEY, user);
      // Redirect to chat
      router.push('/chat');
    },
  });
}

/**
 * Hook for user registration
 */
export function use_register() {
  const query_client = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: registration_data) => register_user(data),
    onSuccess: (user: user_profile) => {
      // Update cache with user data
      query_client.setQueryData(AUTH_QUERY_KEY, user);
      // Redirect to chat
      router.push('/chat');
    },
  });
}

/**
 * Hook for user logout
 */
export function use_logout() {
  const query_client = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout_user,
    onSuccess: () => {
      // Clear user from cache
      query_client.setQueryData(AUTH_QUERY_KEY, null);
      // Redirect to login
      router.push('/login');
    },
  });
}

/**
 * Hook to listen to auth state changes
 */
export function use_auth_listener() {
  const query_client = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase_client.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Update cache when user signs in
          const user: user_profile = {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata.full_name || null,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          };
          query_client.setQueryData(AUTH_QUERY_KEY, user);
        } else if (event === 'SIGNED_OUT') {
          // Clear cache when user signs out
          query_client.setQueryData(AUTH_QUERY_KEY, null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [query_client]);
}

/**
 * Main auth hook - combines user data and auth operations
 */
export function use_auth() {
  const { data: user, isLoading, error } = use_current_user();
  const login_mutation = use_login();
  const register_mutation = use_register();
  const logout_mutation = use_logout();

  // Listen to auth state changes
  use_auth_listener();

  return {
    user,
    is_authenticated: !!user,
    is_loading: isLoading,
    error,
    login: login_mutation.mutate,
    register: register_mutation.mutate,
    logout: logout_mutation.mutate,
    is_logging_in: login_mutation.isPending,
    is_registering: register_mutation.isPending,
    is_logging_out: logout_mutation.isPending,
    login_error: login_mutation.error,
    register_error: register_mutation.error,
  };
}
