/**
 * Gemini 1.5 Pro client + streaming helper for Elora
 * All Gemini interactions route through this module — never call the SDK directly from components.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { gemini_chat_request } from '@/types/chat_types';
import { read_Elora_system_prompt } from './prompt_loader';

// Safety settings — balanced for civic education context
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

function get_gemini_client(): GoogleGenerativeAI {
  const api_key = process.env.GEMINI_API_KEY;
  if (!api_key) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenerativeAI(api_key);
}

/**
 * Convert our internal message format to Gemini SDK format.
 * Gemini uses 'model' instead of 'assistant'.
 */
function to_gemini_messages(
  messages: gemini_chat_request['messages']
): { role: 'user' | 'model'; parts: { text: string }[] }[] {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

/**
 * Stream a chat response from Gemini 1.5 Pro.
 * Returns a ReadableStream of text chunks.
 */
export async function stream_chat_response(request: gemini_chat_request): Promise<ReadableStream<string>> {
  const client = get_gemini_client();
  const system_prompt = await read_Elora_system_prompt();

  // Build location context appendix if available
  let location_appendix = '';
  if (request.location_context?.zip_code) {
    location_appendix = `\n\nCurrent user location context: ZIP code ${request.location_context.zip_code}${request.location_context.state ? `, ${request.location_context.state}` : ''}. Tailor any local election information to this location when relevant.`;
  }

  const model = client.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    systemInstruction: system_prompt + location_appendix,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: GENERATION_CONFIG,
  });

  const gemini_messages = to_gemini_messages(request.messages);

  // Last message is the current user turn; history is everything before it
  const history = gemini_messages.slice(0, -1);
  const last_message = gemini_messages[gemini_messages.length - 1];

  if (!last_message) {
    throw new Error('No user message provided.');
  }

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(last_message.parts);

  const readable_stream = new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(text);
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return readable_stream;
}

/**
 * Non-streaming single-turn generation — used for follow-up question extraction.
 */
export async function generate_text(prompt: string): Promise<string> {
  const client = get_gemini_client();
  const model = client.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    safetySettings: SAFETY_SETTINGS,
    generationConfig: { ...GENERATION_CONFIG, maxOutputTokens: 256 },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
