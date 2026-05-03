/**
 * Application-wide constants
 * Centralized configuration values
 */

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

/** Maximum number of requests allowed per time window */
export const RATE_LIMIT_MAX_REQUESTS = 60;

/** Time window for rate limiting in milliseconds (1 minute) */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// ============================================================================
// Input Validation Limits
// ============================================================================

/** Maximum character length for user input messages */
export const MAX_INPUT_LENGTH = 2000;

/** Maximum number of messages to keep in chat history */
export const MAX_MESSAGE_HISTORY = 20;

/** Maximum number of chat conversations per user */
export const MAX_CHAT_CONVERSATIONS = 50;

/** Maximum number of search results to return */
export const MAX_SEARCH_RESULTS = 5;

// ============================================================================
// Payment Configuration (Razorpay)
// ============================================================================

/** Minimum donation amount in paise (₹1) */
export const MIN_DONATION_AMOUNT = 100;

/** Maximum donation amount in paise (₹100,000) */
export const MAX_DONATION_AMOUNT = 10000000;

/** Currency code for payments */
export const PAYMENT_CURRENCY = 'INR';

// ============================================================================
// API Timeout Configuration
// ============================================================================

/** Default API timeout in milliseconds (30 seconds) */
export const API_TIMEOUT_DEFAULT = 30000;

/** Streaming API timeout in milliseconds (2 minutes) */
export const API_TIMEOUT_STREAMING = 120000;

// ============================================================================
// Gemini AI Configuration
// ============================================================================

/** Gemini model identifier */
export const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';

/** Temperature for AI responses (0.0 = deterministic, 1.0 = creative) */
export const GEMINI_TEMPERATURE = 0.7;

/** Maximum tokens in AI response */
export const GEMINI_MAX_OUTPUT_TOKENS = 2048;

// ============================================================================
// UI Constants
// ============================================================================

/** Predefined quick prompt suggestions for users */
export const QUICK_PROMPTS = [
  'How do I register to vote?',
  'What is the Electoral College?',
  'How are mail-in ballots counted?',
  'When is the next election in my area?',
] as const;

/** Loading status messages shown during AI processing */
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

// ============================================================================
// Cache TTL Configuration
// ============================================================================

/** Cache time-to-live for election data in seconds (5 minutes) */
export const CACHE_TTL_ELECTION_DATA = 300;

/** Cache time-to-live for representatives data in seconds (1 hour) */
export const CACHE_TTL_REPRESENTATIVES = 3600;

// ============================================================================
// Google Services Configuration
// ============================================================================

/** Google Analytics measurement ID */
export const GOOGLE_ANALYTICS_ID = 'G-QDVL5BBZNM';

/** Google OAuth redirect path after authentication */
export const GOOGLE_OAUTH_REDIRECT_PATH = '/chat';
