/**
 * Donate button with Razorpay Standard Checkout
 */

'use client';

import { useState } from 'react';
import { Heart, Loader2, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { open_razorpay_checkout } from '@/lib/razorpay_client';
import { use_auth } from '@/hooks/use_auth';
import { cn } from '@/lib/utils';

const PRESET_AMOUNTS = [
  { value: 100, label: '₹100' },
  { value: 500, label: '₹500', badge: 'Most Donated', is_popular: true },
  { value: 1000, label: '₹1000' },
  { value: 5000, label: '₹5000' },
];

export function DonateButton() {
  const { user } = use_auth();
  const [modal_open, set_modal_open] = useState(false);
  const [selected_amount, set_selected_amount] = useState(500);
  const [custom_amount, set_custom_amount] = useState('');
  const [loading, set_loading] = useState(false);

  const final_amount = custom_amount ? parseInt(custom_amount) : selected_amount;

  const handle_donate = async () => {
    if (final_amount < 100) {
      toast.error('Minimum donation amount is ₹100');
      return;
    }

    set_loading(true);

    try {
      const response = await open_razorpay_checkout(
        final_amount * 100, // Convert to paise
        user?.user_metadata?.full_name,
        user?.email
      );

      console.log('[Razorpay] Payment verified:', response);
      toast.success('Thank you for your donation! 🙏', {
        description: `₹${final_amount} received successfully`,
      });
      set_modal_open(false);
      set_custom_amount('');
      set_selected_amount(500);
    } catch (err: any) {
      console.error('[Razorpay] Error:', err);

      if (err.message === 'Payment cancelled by user') {
        toast.info('Payment cancelled');
      } else {
        toast.error('Payment failed', {
          description: err.message || 'Please try again',
        });
      }
    } finally {
      set_loading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => set_modal_open(true)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium',
          'bg-gradient-to-r from-[#C9A84C] to-[#d4b55e] text-white',
          'hover:from-[#b89740] hover:to-[#C9A84C] hover:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]'
        )}
        aria-label="Donate to support Elora"
      >
        <Heart size={14} className="fill-current" aria-hidden="true" />
        <span className="hidden sm:inline">Donate</span>
      </button>

      {/* Donation modal */}
      {modal_open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => set_modal_open(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => set_modal_open(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-gray-500" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={20} className="text-[#C9A84C] fill-current" />
                <h2 className="text-xl font-bold text-[#2D5016]">Support Elora</h2>
              </div>
              <p className="text-sm text-[#57534e]">
                Help us keep civic information free and accessible for everyone
              </p>
            </div>

            {/* Preset amounts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    set_selected_amount(preset.value);
                    set_custom_amount('');
                  }}
                  className={cn(
                    'relative p-4 rounded-xl border-2 transition-all text-center',
                    preset.is_popular
                      ? 'border-[#C9A84C] bg-gradient-to-br from-[#C9A84C]/10 to-[#d4b55e]/10'
                      : 'border-[#E7E0D0] hover:border-[#2D5016]/30',
                    selected_amount === preset.value && !custom_amount
                      ? preset.is_popular
                        ? 'ring-2 ring-[#C9A84C]'
                        : 'border-[#2D5016] bg-[#2D5016]/5'
                      : ''
                  )}
                >
                  {preset.badge && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#d4b55e] text-white text-[10px] font-medium shadow-md whitespace-nowrap">
                      <Sparkles size={10} />
                      {preset.badge}
                    </div>
                  )}
                  <div
                    className={cn(
                      'text-2xl font-bold',
                      preset.is_popular ? 'text-[#C9A84C]' : 'text-[#2D5016]'
                    )}
                  >
                    {preset.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2D5016] mb-2">
                Or enter custom amount (min ₹100)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534e] font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  value={custom_amount}
                  onChange={(e) => set_custom_amount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 border-2 border-[#E7E0D0] rounded-xl focus:border-[#2D5016] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Donate button */}
            <button
              onClick={handle_donate}
              disabled={loading || final_amount < 100}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-white transition-all',
                'bg-gradient-to-r from-[#2D5016] to-[#3d6b1f]',
                'hover:from-[#3d6b1f] hover:to-[#2D5016] hover:shadow-lg',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Donate ₹{final_amount}
                </>
              )}
            </button>

            <p className="text-xs text-center text-[#a8a29e] mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      )}
    </>
  );
}
