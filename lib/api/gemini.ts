import { GeminiIntentResponse } from '@/lib/types';
import axios from 'axios';

/**
 * Analyzes the intent of a search query using the Gemini API
 */
export async function analyzeQueryIntent(query: string) {
  try {
    const response = await axios.post<GeminiIntentResponse>('/api/gemini/intent', { query });
    return response.data;
  } catch (error) {
    console.error('Error analyzing query intent:', error);
    throw new Error('Failed to analyze query intent');
  }
}