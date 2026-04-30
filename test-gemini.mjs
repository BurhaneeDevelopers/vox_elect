/**
 * Quick diagnostic script to test Gemini API connectivity
 * Run with: node test-gemini.mjs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile } from 'fs/promises';

async function test_gemini() {
  console.log('🔍 Testing Gemini API connection...\n');

  // Load environment variables
  try {
    const env_content = await readFile('.env.local', 'utf-8');
    const api_key_match = env_content.match(/GEMINI_API_KEY=(.+)/);
    
    if (!api_key_match) {
      console.error('❌ GEMINI_API_KEY not found in .env.local');
      return;
    }

    const api_key = api_key_match[1].trim();
    console.log(`✓ API Key found: ${api_key.substring(0, 10)}...${api_key.substring(api_key.length - 4)}`);
    console.log(`✓ API Key length: ${api_key.length} characters\n`);

    // Test API connection
    console.log('📡 Attempting to connect to Gemini API...');
    const client = new GoogleGenerativeAI(api_key);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-pro' });

    console.log('✓ Client initialized\n');

    console.log('💬 Sending test message...');
    const result = await model.generateContent('Say "Hello, VoxElect!" in one sentence.');
    const response = result.response.text();

    console.log('✅ SUCCESS! Gemini API is working.\n');
    console.log('Response:', response);
    console.log('\n✨ Your Gemini API key is valid and working correctly.');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n🔑 The API key in .env.local is invalid.');
      console.error('   Please get a valid key from: https://aistudio.google.com/apikey');
    } else if (error.message.includes('quota')) {
      console.error('\n📊 API quota exceeded. Check your usage at: https://aistudio.google.com/');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.error('\n🌐 Network connectivity issue. Check your internet connection.');
    } else {
      console.error('\n🐛 Unexpected error. Full details:', error);
    }
  }
}

test_gemini();
