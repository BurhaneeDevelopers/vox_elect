/**
 * Authentication and user types for Elora
 */

export interface user_profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface auth_credentials {
  email: string;
  password: string;
}

export interface registration_data extends auth_credentials {
  full_name: string;
}

export interface auth_session {
  user: user_profile | null;
  is_authenticated: boolean;
  is_loading: boolean;
}

export interface auth_error {
  message: string;
  code?: string;
}
