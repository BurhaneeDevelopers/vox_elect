/**
 * Application-wide constants
 * Centralized configuration values
 */

// Rate Limiting
export const RATE_LIMIT_MAX_REQUESTS = 60;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Input Validation
export const MAX_INPUT_LENGTH = 2000;
export const MAX_MESSAGE_HISTORY = 20;
export const MAX_CHAT_CONVERSATIONS = 50;
export const MAX_SEARCH_RESULTS = 5;

// Payment Limits (in paise)
export const MIN_DONATION_AMOUNT = 100; // ₹1
export const MAX_DONATION_AMOUNT = 10000000; // ₹100,000

// API Timeouts (in milliseconds)
export const API_TIMEOUT_DEFAULT = 30000; // 30 seconds
export const API_TIMEOUT_STREAMING = 120000; // 2 minutes

// Gemini Configuration
export const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
export const GEMINI_TEMPERATURE = 0.7;
export const GEMINI_MAX_OUTPUT_TOKENS = 2048;

// UI Constants
export const QUICK_PROMPTS = [
  'How do I register to vote?',
  'What is the Electoral College?',
  'How are mail-in ballots counted?',
  'When is the next election in my area?',
] as const;

export const AI_STATUS_MESSAGES = [
  'Analyzing your question...',
  'Searching civic databases...',
  'Gathering election information...',
  'Verifying details...',
  'Consulting voter resources...',
  'Preparing response...',
  'Cross-referencing data...',
  'Reviewing election guidelines...',
] as const;

// Cache TTL (in seconds)
export const CACHE_TTL_ELECTION_DATA = 300; // 5 minutes
export const CACHE_TTL_REPRESENTATIVES = 3600; // 1 hour
