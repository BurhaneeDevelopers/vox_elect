/**
 * POST /api/razorpay/verify-payment
 * Verify Razorpay payment signature
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate field types and format
    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string' ||
      razorpay_order_id.length > 100 ||
      razorpay_payment_id.length > 100 ||
      razorpay_signature.length > 200
    ) {
      return NextResponse.json(
        { error: 'Invalid field format' },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json(
        { error: 'Payment verification unavailable' },
        { status: 503 }
      );
    }

    // Generate signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Use timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(generated_signature), Buffer.from(razorpay_signature))) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Signature valid - payment verified
    return NextResponse.json({
      success: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
  } catch (error: unknown) {
    const error_message = error instanceof Error ? error.message : 'Verification failed';
    if (process.env.NODE_ENV === 'development') {
      console.error('[verify-payment] Error:', error_message);
    }
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
