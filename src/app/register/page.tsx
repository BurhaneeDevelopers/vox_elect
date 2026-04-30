/**
 * Registration page for Elora (Server Component)
 * Allows new users to create an account
 */

import { AuthPageLayout } from '@/components/auth/auth_page_layout';
import { AuthLogo } from '@/components/auth/auth_logo';
import { RegisterForm } from '@/components/auth/register_form';

export default function RegisterPage() {
  return (
    <AuthPageLayout footer_text="By creating an account, you agree to our Terms of Service and Privacy Policy">
      <AuthLogo
        title="Join Elora"
        subtitle="Create your account and start your civic education journey"
      />
      <RegisterForm />
    </AuthPageLayout>
  );
}
