'use client';

/**
 * User Menu Component
 * Displays user info and logout button
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown } from 'lucide-react';
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F5F0E8] transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#2D5016] flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-[#1C1917]">
            {user.full_name || 'User'}
          </p>
          <p className="text-xs text-[#78716c]">{user.email}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#78716c] transition-transform ${
            is_open ? 'rotate-180' : ''
          }`}
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
