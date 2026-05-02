/**
 * Detect if user query needs live web search.
 * Uses Gemini to classify civic queries.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const CLASSIFICATION_PROMPT = `You are a classifier for a civic education chatbot. Determine if the user's query requires real-time or location-specific data.

Answer YES if the query needs:
- Upcoming elections or election dates
- Current candidates or candidate information
- Recent election results
- Polling place locations
- Current voter registration deadlines
- Live political events or news

Answer NO if the query is about:
- General civic education (how voting works, Electoral College, etc.)
- Historical information
- Voting processes or procedures
- Constitutional or legal concepts
- General "how to" questions

Reply with ONLY "YES" or "NO".

Query: {query}`;

export async function detect_search_intent(query: string): Promise<boolean> {
  try {
    const api_key = process.env.GEMINI_API_KEY;
    if (!api_key || !query || query.length > 500) return false;

    const client = new GoogleGenerativeAI(api_key);
    const model = client.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 10,
      },
    });

    const prompt = CLASSIFICATION_PROMPT.replace('{query}', query);
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();

    return response === 'YES';
  } catch {
    return false;
  }
}
