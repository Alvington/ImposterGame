
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GameData, Source, Difficulty, CustomItem, ImposterStrategy } from "../types";

/**
 * Fallback data registry to keep the game running without an API key.
 * You can expand this with more categories.
 */
const CATEGORY_FALLBACKS: Record<string, Partial<GameData>> = {
  "Animals & Nature": { word: "Elephant", hint: "A gray giant with a memory", imposterWord: "Rhino" },
  "Food": { word: "Sushi", hint: "Raw fish and vinegared rice", imposterWord: "Sashimi" },
  "Movies": { word: "Inception", hint: "Dreams within dreams", imposterWord: "Interstellar" },
  "Sports": { word: "Cricket", hint: "Played with a bat and a red ball", imposterWord: "Baseball" },
  "Science": { word: "Photosynthesis", hint: "Plants making food from light", imposterWord: "Respiration" },
  "Bible": { word: "Noah", hint: "Built a massive wooden ship", imposterWord: "Moses" },
  "Silly & Random": { word: "Pogo Stick", hint: "Spring-loaded bouncing toy", imposterWord: "Trampoline" },
};

/**
 * Helper to select fallback data based on category and strategy
 */
function getFallbackData(category: string, strategy: ImposterStrategy): GameData {
  const base = CATEGORY_FALLBACKS[category] || { 
    word: "Solar Eclipse", 
    hint: "A rare cosmic alignment", 
    imposterWord: "Lunar Eclipse" 
  };

  return {
    word: base.word!,
    hint: strategy === ImposterStrategy.HINT ? base.hint : undefined,
    imposterWord: strategy === ImposterStrategy.WRONG_WORD ? base.imposterWord : undefined,
    strategy: strategy,
  };
}

export async function generateGameData(
  category: string, 
  difficulty: Difficulty, 
  strategy: ImposterStrategy,
  customItems?: CustomItem[]
): Promise<GameData> {
  // Use Vercel environment variables (process.env)
  const apiKey = process.env.VITE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // 1. Return category backup immediately if API key is missing
  if (!apiKey) {
    console.warn(`Missing API Key: Using fallback for ${category}`);
    return getFallbackData(category, strategy);
  }

  const ai = new GoogleGenerativeAI(apiKey);
  
  let prompt = "";
  if (customItems && customItems.length > 0) {
    prompt = `Category: ${category}. Data: ${JSON.stringify(customItems)}. Strategy: ${strategy}. Pick one item. JSON output only.`;
  } else {
    prompt = `Role: Imposter Game Engine.
    Category: "${category}" | Difficulty: "${difficulty}" | Mode: "${strategy}"
    Requirements:
    - If HINT: Provide "word" and a cryptic "hint" (< 8 words).
    - If WRONG_WORD: Provide "word" and a similar "imposterWord".
    - If BLIND: Provide only "word".
    Return valid JSON only.`;
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 1.0,
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(result.response.text() || "{}");
    
    return { 
      ...data, 
      strategy, 
      sources: undefined 
    } as GameData;

  } catch (error) {
    console.error("GenAI Error, falling back:", error);
    // 2. Return category backup if the API call fails
    return getFallbackData(category, strategy);
  }
}
