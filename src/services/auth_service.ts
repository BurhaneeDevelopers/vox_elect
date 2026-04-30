/**
 * Authentication service for Supabase
 * Handles login, registration, logout, and session management
 */

import { supabase_client } from '@/lib/supabase_client';
import type { auth_credentials, registration_data, user_profile } from '@/types/auth_types';

/**
 * Register a new user with email and password
 */
export async function register_user(data: registration_data): Promise<user_profile> {
  const { email, password, full_name } = data;

  // Create auth user
  const { data: auth_data, error: auth_error } = await supabase_client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (auth_error) {
    throw new Error(auth_error.message);
  }

  if (!auth_data.user) {
    throw new Error('Registration failed - no user returned');
  }

  // Return user profile
  return {
    id: auth_data.user.id,
    email: auth_data.user.email!,
    full_name: auth_data.user.user_metadata.full_name || null,
    created_at: auth_data.user.created_at,
    updated_at: auth_data.user.updated_at || auth_data.user.created_at,
  };
}

/**
 * Login user with email and password
 */
export async function login_user(credentials: auth_credentials): Promise<user_profile> {
  const { email, password } = credentials;

  const { data, error } = await supabase_client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Login failed - no user returned');
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    full_name: data.user.user_metadata.full_name || null,
    created_at: data.user.created_at,
    updated_at: data.user.updated_at || data.user.created_at,
  };
}

/**
 * Logout current user
 */
export async function logout_user(): Promise<void> {
  const { error } = await supabase_client.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get current authenticated user
 */
export async function get_current_user(): Promise<user_profile | null> {
  const { data: { user }, error } = await supabase_client.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata.full_name || null,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
  };
}

/**
 * Get current session
 */
export async function get_current_session() {
  const { data: { session }, error } = await supabase_client.auth.getSession();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return session;
}

/**
 * Check if user is authenticated
 */
export async function is_authenticated(): Promise<boolean> {
  const session = await get_current_session();
  return session !== null;
}
