import { supabaseAdmin } from './supabase';

/**
 * Calls Gemini 1.5 Flash API to automatically generate rich marketing and review content
 * for e-commerce tools submitted to the directory.
 */
export async function generateToolDetailsWithAI(title: string, url: string, description: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not configured. Skipping AI enrichment.');
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an expert copywriter and e-commerce tech analyst. 
Your task is to analyze the following e-commerce AI tool and automatically write high-quality detailed content for its directory listing page.

Tool Title: ${title}
Website URL: ${url}
Short Description: ${description}

You must return a valid JSON object matching the following structure exactly. Do not wrap in markdown or any other tags.
{
  "detailed_overview": "A rich, compelling detailed overview paragraph of about 150-200 words. Describe what the tool is, how it solves specific pain points for online store merchants and D2C brands, and why it is a game changer. Keep the tone professional, persuasive, and globally appealing.",
  "key_features": ["Feature Name 1", "Feature Name 2", "Feature Name 3"],
  "key_features_descriptions": ["Detailed 1-2 sentence description of feature 1.", "Detailed 1-2 sentence description of feature 2.", "Detailed 1-2 sentence description of feature 3."],
  "rating": 4.8,
  "rating_count": 89,
  "customer_review": "A detailed 2-3 sentence positive, highly realistic review from an active e-commerce merchant who has used this tool. Include specific benefits they experienced.",
  "customer_review_author": "Full Name (e.g. John Doe), Founder of a D2C Brand / Store Owner",
  "customer_review_2": "Another detailed 2-3 sentence positive, highly realistic review from a store marketer or e-commerce operator praising a different aspect of the tool (e.g. ease of setup, analytics, ROI).",
  "customer_review_2_author": "Full Name, Store Marketer / E-commerce Director",
  "integration_guide_1_label": "Official Documentation",
  "integration_guide_1_url": "${url}"
}

Ensure:
1. Ratings are realistic numeric values between 4.6 and 4.9.
2. Rating count is a realistic integer between 15 and 250.
3. The content must be written in English.
4. All generated fields must be highly specific to this exact tool based on its name and short description. Avoid generic descriptions.`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Gemini API request failed:', errorText);
      return null;
    }

    const data = await res.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      console.error('❌ Empty response from Gemini API.');
      return null;
    }

    const parsed = JSON.parse(textResponse.trim());
    return parsed;

  } catch (err) {
    console.error('❌ generateToolDetailsWithAI exception:', err);
    return null;
  }
}
