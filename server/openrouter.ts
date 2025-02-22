import { type OpenRouterRequest, type OpenRouterResponse } from "@shared/schema";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateResponse(characterName: string, personality: string, userMessage: string): Promise<string> {
  const systemPrompt = `You are ${characterName}, a character with the following personality: ${personality}. 
Respond to the user's message while staying in character.`;

  const body: OpenRouterRequest = {
    model: "qwen/qwen2.5-vl-72b-instruct:free",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userMessage
      }
    ]
  };

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://replit.com",
        "X-Title": "Anime Character Chat"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate AI response");
  }
}
