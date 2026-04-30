'use client';

/**
 * Login page for Elora
 * Allows users to sign in with email and password
 */

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use_auth } from '@/hooks/use_auth';

export default function LoginPage() {
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const { login, is_logging_in, login_error } = use_auth();

  const handle_submit = (e: FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

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
            Welcome Back
          </h1>
          <p className="text-[#57534e] text-sm">
            Sign in to continue your civic journey with Elora
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-[#E7E0D0]"
        >
          <form onSubmit={handle_submit} className="space-y-5">
            {/* Error Message */}
            {login_error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Login Failed</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {login_error instanceof Error ? login_error.message : 'Invalid credentials'}
                  </p>
                </div>
              </motion.div>
            )}

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
                  disabled={is_logging_in}
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
                  disabled={is_logging_in}
                  className="w-full pl-11 pr-4 py-3 border border-[#E7E0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={is_logging_in}
              className="w-full bg-[#2D5016] text-white py-3 rounded-lg font-medium hover:bg-[#3d6b1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {is_logging_in ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#57534e]">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-[#2D5016] font-medium hover:underline"
              >
                Create one here
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-[#a8a29e] mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
