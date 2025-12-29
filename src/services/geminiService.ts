
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GameData, Source, Difficulty, CustomItem, ImposterStrategy } from "../types";

export async function generateGameData(
  category: string, 
  difficulty: Difficulty, 
  strategy: ImposterStrategy,
  customItems?: CustomItem[]
): Promise<GameData> {
  // Use process.env for Vercel Backend / Serverless
  // Use import.meta.env for Vite Frontend (Not recommended for Secret Keys)
  const apiKey = process.env.VITE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    console.warn("AI API Key missing, using fallback data.");
    return { 
      word: "Solar Eclipse", 
      hint: "A rare cosmic alignment", 
      strategy: ImposterStrategy.HINT 
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Choose the prompt based on strategy
  const strategyContext = {
    [ImposterStrategy.HINT]: "Generate a 'word' and a 'hint' (for the imposter).",
    [ImposterStrategy.WRONG_WORD]: "Generate a 'word' (for civilians) and an 'imposterWord' (similar to the word).",
    [ImposterStrategy.BLIND]: "Generate only the 'word'."
  };

  const difficultyContext = {
    [Difficulty.EASY]: "Common, simple words.",
    [Difficulty.AVERAGE]: "Standard concepts.",
    [Difficulty.ADVANCED]: "Niche/technical concepts.",
    [Difficulty.EXPERT]: "Obscure/rare concepts."
  };

  const blacklist = "Bible tropes, Toilet Paper, Banana, Lion, Dog";

  let prompt = `
    Role: Imposter Game Engine.
    Category: "${category}"
    Difficulty: "${difficulty}" (${difficultyContext[difficulty]})
    Mode: "${strategy}" (${strategyContext[strategy]})

    Rules:
    1. Do not use: ${blacklist}.
    2. Brevity: Hints MUST be under 8 words.
    3. JSON Format: You must return valid JSON matching the requested mode.
  `;

  if (customItems && customItems.length > 0) {
    prompt += `\nCustom Items to pick from: ${JSON.stringify(customItems)}`;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // Optional: enforce response schema if using higher SDK versions
    });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.9, // Slightly lower for more consistent JSON
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    const data = JSON.parse(text || "{}");

    // Ensure the returned object matches the GameData interface
    return {
      word: data.word || "Default Word",
      hint: data.hint || undefined,
      imposterWord: data.imposterWord || undefined,
      strategy: strategy,
      sources: [] // Gemini 1.5 doesn't provide citations via API like this
    };

  } catch (error) {
    console.error("GenAI Error:", error);
    return { 
      word: "Solar Eclipse", 
      hint: "A rare cosmic alignment", 
      strategy: ImposterStrategy.HINT 
    };
  }
}
