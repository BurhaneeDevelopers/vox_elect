/**
 * Razorpay payment integration - Standard Checkout
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function load_razorpay_script(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function create_razorpay_order(amount: number, currency = 'INR') {
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
}

export async function verify_razorpay_payment(
  order_id: string,
  payment_id: string,
  signature: string
) {
  const response = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: order_id,
      razorpay_payment_id: payment_id,
      razorpay_signature: signature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment verification failed');
  }

  return response.json();
}

export async function open_razorpay_checkout(
  amount: number,
  user_name?: string,
  user_email?: string
): Promise<RazorpayResponse> {
  const loaded = await load_razorpay_script();

  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  // Step 1: Create order
  const order = await create_razorpay_order(amount);

  // Step 2: Open checkout modal
  return new Promise((resolve, reject) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency,
      name: 'Elora Civic Guide',
      description: 'Support free civic information for all',
      order_id: order.order_id,
      prefill: {
        name: user_name || '',
        email: user_email || '',
      },
      theme: {
        color: '#2D5016',
      },
      handler: async (response: RazorpayResponse) => {
        try {
          // Step 3: Verify signature
          await verify_razorpay_payment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          resolve(response);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      reject(new Error(response.error.description || 'Payment failed'));
    });
    razorpay.open();
  });
}
