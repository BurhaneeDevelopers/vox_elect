'use client';

/**
 * User Menu Component
 * Displays user info and logout button
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, FileText, Shield } from 'lucide-react';
import Link from 'next/link';
import { use_auth } from '@/hooks/use_auth';

export function UserMenu() {
  const { user, logout, is_logging_out } = use_auth();
  const [is_open, set_is_open] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => set_is_open(!is_open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="User menu"
        aria-expanded={is_open}
      >
        <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-xs font-medium text-white">
            {user.full_name || 'User'}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/60 transition-transform ${
            is_open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {is_open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => set_is_open(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-[#E7E0D0] z-20 overflow-hidden"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-[#E7E0D0]">
                <p className="text-sm font-medium text-[#1C1917]">
                  {user.full_name || 'User'}
                </p>
                <p className="text-xs text-[#78716c] mt-0.5">{user.email}</p>
              </div>

              {/* Legal Links */}
              <div className="py-1 border-b border-[#E7E0D0]">
                <Link
                  href="/terms-and-conditions"
                  className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-[#F5F0E8] transition-colors"
                  onClick={() => set_is_open(false)}
                >
                  <FileText className="w-4 h-4 text-[#78716c]" />
                  <span className="text-sm font-medium text-[#57534e]">Terms & Conditions</span>
                </Link>
                <Link
                  href="/privacy-policy"
                  className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-[#F5F0E8] transition-colors"
                  onClick={() => set_is_open(false)}
                >
                  <Shield className="w-4 h-4 text-[#78716c]" />
                  <span className="text-sm font-medium text-[#57534e]">Privacy Policy</span>
                </Link>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  set_is_open(false);
                }}
                disabled={is_logging_out}
                className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-[#F5F0E8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  {is_logging_out ? 'Logging out...' : 'Logout'}
                </span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
