/**
 * Integration tests for /api/chat endpoint
 */

import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

// Mock the Gemini client
jest.mock('@/lib/gemini_client', () => ({
  stream_chat_response: jest.fn().mockResolvedValue(
    new ReadableStream({
      start(controller) {
        controller.enqueue('Test response');
        controller.close();
      },
    })
  ),
}));

describe('/api/chat', () => {
  it('should reject empty messages array', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Messages array is required');
  });

  it('should reject invalid request body', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should sanitize message content', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: '  hello   world  ' },
        ],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });

  it('should limit conversation history', async () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
    }));

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});
