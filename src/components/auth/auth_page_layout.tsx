/**
 * Shared layout wrapper for auth pages (login/register)
 */

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AuthPageLayoutProps {
  children: ReactNode;
  footer_text?: string;
}

export function AuthPageLayout({
  children,
  footer_text = 'By continuing, you agree to our Terms of Service and Privacy Policy',
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#FDFAF4] to-[#F5F0E8] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {children}
        <p className="text-center text-xs text-[#a8a29e] mt-6">{footer_text}</p>
      </motion.div>
    </div>
  );
}
