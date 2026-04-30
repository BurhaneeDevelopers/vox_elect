/**
 * Reusable Elora logo/brand component for auth pages
 */

'use client';

import { motion } from 'framer-motion';

interface AuthLogoProps {
  title: string;
  subtitle: string;
}

export function AuthLogo({ title, subtitle }: AuthLogoProps) {
  return (
    <div className="text-center mb-8">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 mx-auto rounded-full bg-linear-to-br from-[#2D5016] to-[#3d6b1f] flex items-center justify-center shadow-lg mb-4"
      >
        <span className="text-3xl font-serif font-bold text-white">E</span>
      </motion.div>
      <h1 className="font-serif text-3xl font-bold text-[#2D5016] mb-2">
        {title}
      </h1>
      <p className="text-[#57534e] text-sm">{subtitle}</p>
    </div>
  );
}
