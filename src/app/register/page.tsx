'use client';

/**
 * Registration page for VoxElect
 * Allows new users to create an account
 */

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { use_auth } from '@/hooks/use_auth';

export default function RegisterPage() {
  const [full_name, set_full_name] = useState('');
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');
  const [validation_error, set_validation_error] = useState<string | null>(null);
  
  const { register, is_registering, register_error } = use_auth();

  const handle_submit = (e: FormEvent) => {
    e.preventDefault();
    set_validation_error(null);

    // Validation
    if (password.length < 6) {
      set_validation_error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirm_password) {
      set_validation_error('Passwords do not match');
      return;
    }

    register({ email, password, full_name });
  };

  const error_message = validation_error || (register_error instanceof Error ? register_error.message : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAF4] to-[#F5F0E8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#2D5016] to-[#3d6b1f] flex items-center justify-center shadow-lg mb-4"
          >
            <span className="text-3xl font-serif font-bold text-white">E</span>
          </motion.div>
          <h1 className="font-serif text-3xl font-bold text-[#2D5016] mb-2">
            Join VoxElect
          </h1>
          <p className="text-[#57534e] text-sm">
            Create your account and start your civic education journey
          </p>
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-[#E7E0D0]"
        >
          <form onSubmit={handle_submit} className="space-y-5">
            {/* Error Message */}
            {error_message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Registration Failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{error_message}</p>
                </div>
              </motion.div>
            )}

            {/* Full Name Field */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-[#2D5016] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716c]" />
                <input
                  id="full_name"
                  type="text"
                  value={full_name}
                  onChange={(e) => set_full_name(e.target.value)}
                  required
                  disabled={is_registering}
                  className="w-full pl-11 pr-4 py-3 border border-[#E7E0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2D5016] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716c]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  required
                  disabled={is_registering}
                  className="w-full pl-11 pr-4 py-3 border border-[#E7E0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2D5016] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716c]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  required
                  disabled={is_registering}
                  className="w-full pl-11 pr-4 py-3 border border-[#E7E0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <p className="text-xs text-[#78716c] mt-1">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-[#2D5016] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716c]" />
                <input
                  id="confirm_password"
                  type="password"
                  value={confirm_password}
                  onChange={(e) => set_confirm_password(e.target.value)}
                  required
                  disabled={is_registering}
                  className="w-full pl-11 pr-4 py-3 border border-[#E7E0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                {password && confirm_password && password === confirm_password && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={is_registering}
              className="w-full bg-[#2D5016] text-white py-3 rounded-lg font-medium hover:bg-[#3d6b1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {is_registering ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#57534e]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#2D5016] font-medium hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-[#a8a29e] mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
