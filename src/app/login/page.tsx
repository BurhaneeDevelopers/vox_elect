/**
 * Login page for Elora (Server Component)
 * Allows users to sign in with email and password
 */

import { AuthPageLayout } from '@/components/auth/auth_page_layout';
import { AuthLogo } from '@/components/auth/auth_logo';
import { LoginForm } from '@/components/auth/login_form';

export default function LoginPage() {
  return (
    <AuthPageLayout footer_text="By signing in, you agree to our Terms of Service and Privacy Policy">
      <AuthLogo
        title="Welcome Back"
        subtitle="Sign in to continue your civic journey with Elora"
      />
      <LoginForm />
    </AuthPageLayout>
  );
}
