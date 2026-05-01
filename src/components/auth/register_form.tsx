/**
 * Registration form component
 */

'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, CheckCircle, UserX } from 'lucide-react';
import Link from 'next/link';
import { use_auth } from '@/hooks/use_auth';

export function RegisterForm() {
  const [full_name, set_full_name] = useState('');
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');
  const [validation_error, set_validation_error] = useState<string | null>(null);

  const { register, sign_in_anonymously, is_registering, is_signing_in_anonymously, register_error, anonymous_signin_error } = use_auth();

  const handle_submit = (e: FormEvent) => {
    e.preventDefault();
    set_validation_error(null);

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

  const handle_anonymous_signin = () => {
    sign_in_anonymously();
  };

  const error_message =
    validation_error || (register_error instanceof Error ? register_error.message : null) || (anonymous_signin_error instanceof Error ? anonymous_signin_error.message : null);

  return (
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
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
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
              disabled={is_registering || is_signing_in_anonymously}
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
              disabled={is_registering || is_signing_in_anonymously}
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
              disabled={is_registering || is_signing_in_anonymously}
              className="w-full pl-11 pr-4 py-3 border border-[#E7E0D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <p className="text-xs text-[#78716c] mt-1">Minimum 6 characters</p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirm_password"
            className="block text-sm font-medium text-[#2D5016] mb-2"
          >
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
              disabled={is_registering || is_signing_in_anonymously}
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
          disabled={is_registering || is_signing_in_anonymously}
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

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E7E0D0]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-[#78716c]">or</span>
        </div>
      </div>

      {/* Anonymous Sign-in Button */}
      <button
        type="button"
        onClick={handle_anonymous_signin}
        disabled={is_registering || is_signing_in_anonymously}
        className="w-full bg-[#78716c] text-white py-3 rounded-lg font-medium hover:bg-[#57534e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {is_signing_in_anonymously ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Entering...</span>
          </>
        ) : (
          <>
            <UserX className="w-5 h-5" />
            <span>Explore Anonymously</span>
          </>
        )}
      </button>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-[#57534e]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2D5016] font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
