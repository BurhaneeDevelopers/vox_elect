/**
 * POST /api/razorpay/create-order
 * Create Razorpay order
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: 'Payment service not configured' },
      { status: 503 }
    );
  }

  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  try {
    const { amount, currency = 'INR' } = await req.json();

    // Validate amount (min 100 paise = ₹1, max ₹100,000)
    if (!amount || typeof amount !== 'number' || amount < 100 || amount > 10000000) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be between ₹1 and ₹100,000' },
        { status: 400 }
      );
    }

    // Validate currency
    if (currency !== 'INR') {
      return NextResponse.json(
        { error: 'Only INR currency supported' },
        { status: 400 }
      );
    }

    const options = {
      amount: amount, // in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    const error_message = error instanceof Error ? error.message : 'Failed to create order';
    if (process.env.NODE_ENV === 'development') {
      console.error('[create-order] Error:', error_message);
    }
    return NextResponse.json(
      { error: 'Unable to create payment order' },
      { status: 500 }
    );
  }
}
