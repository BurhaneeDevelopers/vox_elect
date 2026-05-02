/**
 * Integration tests for Razorpay payment endpoints
 */

import { POST as createOrder } from '@/app/api/razorpay/create-order/route';
import { POST as verifyPayment } from '@/app/api/razorpay/verify-payment/route';
import { NextRequest } from 'next/server';

// Mock Razorpay SDK
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test123',
        amount: 10000,
        currency: 'INR',
      }),
    },
  }));
});

describe('/api/razorpay/create-order', () => {
  it('should reject amount below minimum', async () => {
    const req = new NextRequest('http://localhost/api/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 50 }),
    });

    const response = await createOrder(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid amount');
  });

  it('should reject amount above maximum', async () => {
    const req = new NextRequest('http://localhost/api/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 20000000 }),
    });

    const response = await createOrder(req);
    expect(response.status).toBe(400);
  });

  it('should reject non-INR currency', async () => {
    const req = new NextRequest('http://localhost/api/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 10000, currency: 'USD' }),
    });

    const response = await createOrder(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('INR');
  });

  it('should create order with valid amount', async () => {
    const req = new NextRequest('http://localhost/api/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 10000 }),
    });

    const response = await createOrder(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.order_id).toBe('order_test123');
  });
});

describe('/api/razorpay/verify-payment', () => {
  it('should reject missing fields', async () => {
    const req = new NextRequest('http://localhost/api/razorpay/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ razorpay_order_id: 'order_123' }),
    });

    const response = await verifyPayment(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Missing required fields');
  });

  it('should reject invalid field types', async () => {
    const req = new NextRequest('http://localhost/api/razorpay/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: 123,
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'sig_123',
      }),
    });

    const response = await verifyPayment(req);
    expect(response.status).toBe(400);
  });

  it('should reject excessively long fields', async () => {
    const req = new NextRequest('http://localhost/api/razorpay/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: 'a'.repeat(200),
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'sig_123',
      }),
    });

    const response = await verifyPayment(req);
    expect(response.status).toBe(400);
  });
});
