import { NextResponse } from 'next/server';
import { AIChatSession } from '../AI-Modal';

interface IntentData {
  query: string;
  intent: string;
  category: string;
}

export async function POST(request: Request) {
  try {
    console.log('[Intent Route] Received request');
    const { queries } = await request.json();
    console.log('[Intent Route] Queries to analyze:', queries);
    
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      console.error('[Intent Route] Invalid queries array');
      return NextResponse.json(
        { error: 'Queries array is required' },
        { status: 400 }
      );
    }

    // Construct the prompt for all queries at once
    const prompt = `
      You are a search intent analyzer. Analyze these search queries and provide the user's intent and category for each.
      
      Search Queries:
      ${queries.map((q, i) => `${i + 1}. "${q}"`).join('\n')}
      
      For each query, respond with a JSON array of objects containing:
      1. query: The original search query
      2. intent: A clear, concise description of what the user is trying to find or accomplish
      3. category: Exactly one of these categories:
         - Informational (seeking information or answers)
         - Navigational (looking for a specific website or page)
         - Transactional (intending to complete an action or purchase)
         - Commercial Investigation (researching products or services before purchase)
      
      Focus on accuracy and brevity in intent descriptions.
      Respond with ONLY the JSON array, no other text.
    `;

    try {
      // Get AI response for all queries at once
      const result = await AIChatSession.sendMessage(prompt);
      const textContent = result.response.text();
      console.log('[Intent Route] Raw AI response:', textContent);
      
      // Try parsing the response in different ways
      let parsedData: IntentData | IntentData[] | null = null;
      try {
        // First try parsing the raw response
        parsedData = JSON.parse(textContent.trim());
      } catch (e) {
        console.log('[Intent Route] Failed to parse raw response, trying to extract JSON');
        // Try to find JSON-like content in the response
        const jsonMatch = textContent.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0].trim());
          } catch (e2) {
            console.error('[Intent Route] Failed to parse extracted JSON:', e2);
            // Don't throw, we'll handle this in the next section
          }
        }
      }

      // Ensure we have an array and map results
      const finalResults = queries.map((query, index) => {
        let intentData = { intent: 'Unable to determine intent', category: 'Unknown' };
        
        if (parsedData) {
          if (Array.isArray(parsedData) && parsedData[index]) {
            // If we have an array result, use the matching index
            intentData = {
              intent: parsedData[index].intent || 'Unable to determine intent',
              category: parsedData[index].category || 'Unknown'
            };
          } else if (!Array.isArray(parsedData) && index === 0) {
            // If we have a single object result, use it for the first query
            intentData = {
              intent: (parsedData as IntentData).intent || 'Unable to determine intent',
              category: (parsedData as IntentData).category || 'Unknown'
            };
          }
        }

        return {
          query,
          ...intentData
        };
      });

      console.log('[Intent Route] Final response:', finalResults);
      return NextResponse.json(finalResults);
    } catch (error) {
      console.error('[Intent Route] Error in AI processing:', error);
      // Return basic intent analysis for all queries
      const fallbackResults = queries.map(query => ({
        query,
        intent: 'Unable to determine intent',
        category: 'Unknown'
      }));
      return NextResponse.json(fallbackResults);
    }
  } catch (error: any) {
    console.error('Error analyzing query intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze query intent' },
      { status: 500 }
    );
  }
}
