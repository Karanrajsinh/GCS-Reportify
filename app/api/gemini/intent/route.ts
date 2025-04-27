import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Missing Gemini API key');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Construct the prompt for Gemini
    const prompt = `
      Analyze the search intent for the following search query:
      "${query}"
      
      Provide your response in JSON format with the following fields:
      1. intent: A concise description of what the user is trying to find or do
      2. category: One of the following categories:
         - Informational
         - Navigational
         - Transactional
         - Commercial Investigation
    `;

    // Make request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 200,
        }
      }
    );

    // Extract JSON from the response
    const content = response.data.candidates?.[0]?.content;
    if (!content) {
      throw new Error('No response from Gemini API');
    }

    const textContent = content.parts?.[0]?.text;
    
    // Extract JSON from the text response
    let jsonMatch = textContent.match(/\{[\s\S]*\}/);
    let result;
    
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON from Gemini response');
        result = {
          intent: 'Unable to determine intent',
          category: 'Unknown'
        };
      }
    } else {
      result = {
        intent: 'Unable to determine intent',
        category: 'Unknown'
      };
    }

    return NextResponse.json({
      query,
      intent: result.intent,
      category: result.category
    });
  } catch (error: any) {
    console.error('Error analyzing query intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze query intent' },
      { status: 500 }
    );
  }
}