'use client';

/**
 * Auth Guard Component
 * Protects routes by checking authentication status
 * Redirects to login if user is not authenticated
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { use_auth } from '@/hooks/use_auth';

interface auth_guard_props {
  children: React.ReactNode;
}

export function AuthGuard({ children }: auth_guard_props) {
  const { user, is_loading } = use_auth();
  const router = useRouter();

  useEffect(() => {
    if (!is_loading && !user) {
      router.push('/login');
    }
  }, [user, is_loading, router]);

  // Show loading state while checking authentication
  if (is_loading) {
    return (
      <div className="min-h-screen bg-[#FDFAF4] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-[#2D5016] animate-spin mx-auto mb-4" />
          <p className="text-[#57534e] font-medium">Verifying authentication...</p>
        </motion.div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
