// Jest setup file
import '@testing-library/jest-dom';

// Mock Next.js Web APIs for API route tests
if (typeof global.Request === 'undefined') {
  global.Request = class Request {};
  global.Response = class Response {};
  global.Headers = class Headers {
    constructor() {
      this.map = new Map();
    }
    get(key) {
      return this.map.get(key);
    }
    set(key, value) {
      this.map.set(key, value);
    }
    has(key) {
      return this.map.has(key);
    }
  };
}

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test_key';
process.env.GEMINI_API_KEY = 'test_gemini_key';
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'test_razorpay_key';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret';
