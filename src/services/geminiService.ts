
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GameData, Source, Difficulty, CustomItem, ImposterStrategy } from "../types";

export async function generateGameData(
  category: string, 
  difficulty: Difficulty, 
  strategy: ImposterStrategy,
  customItems?: CustomItem[]
): Promise<GameData> {
  const apiKey = import.meta.env.VITE_API_KEY || 'AIzaSyBi6WwnWWfEwbOtQ_srpt5OAQuUJ-ag148';
  
  if (!apiKey) {
    // Return fallback data if no API key
    return { 
      word: "Solar Eclipse", 
      hint: "A rare cosmic alignment", 
      strategy: ImposterStrategy.HINT 
    };
  }
  
  const ai = new GoogleGenerativeAI(apiKey);
  const randomSeed = Math.floor(Math.random() * 2147483647);
  
  let prompt = "";
  
  if (customItems && customItems.length > 0) {
    const itemsJson = JSON.stringify(customItems);
    prompt = `Custom Category: ${category}. Data: ${itemsJson}. Strategy: ${strategy}. 
    Pick ONE item. If strategy is WRONG_WORD, create a very similar word to the chosen one. 
    If strategy is HINT, provide a hint based on difficulty ${difficulty}. 
    CRITICAL: Hints MUST be punchy and strictly under 8 words. No long sentences.`;
  } else {
    const strategyContext = {
      [ImposterStrategy.HINT]: "Generate a 'Secret Word' and a 'Cryptic Hint' for the imposter.",
      [ImposterStrategy.WRONG_WORD]: "Generate a 'Secret Word' for Civilians and a 'Wrong Word' for the Imposter. The 'Wrong Word' must be in the same sub-category and very similar (e.g., if Word is 'Guitar', Wrong Word is 'Ukulele').",
      [ImposterStrategy.BLIND]: "Generate a 'Secret Word' only. The Imposter will receive '???'."
    };

    const difficultyContext = {
      [Difficulty.EASY]: "Use extremely common, universally known words. Hints must be very descriptive.",
      [Difficulty.AVERAGE]: "Standard concepts with clever hints.",
      [Difficulty.ADVANCED]: "Niche concepts.",
      [Difficulty.EXPERT]: "Obscure concepts."
    };

    const blacklist: Record<string, string> = {
      "Bible": "Noah's Ark, Jesus, Moses, Adam and Eve, David and Goliath, The Cross, Jonah",
      "Silly & Random": "Toilet Paper, Banana, Rubber Duck, Toothbrush",
      "Animals & Nature": "Lion, Elephant, Tiger, Dog, Cat, Rose"
    };

    prompt = `Imposter Game Engine:
    Category: "${category}"
    Difficulty: "${difficulty}" (${difficultyContext[difficulty]})
    Mode: "${strategy}" (${strategyContext[strategy]})
    
    ANTI-REPETITION RULES:
    - ABSOLUTELY DO NOT USE these common tropes: ${blacklist[category] || "any basic trope"}.
    - Think of 10 words in this category. Discard the most obvious 5. Pick one from the remaining 5.
    
    BREVITY RULE (MANDATORY):
    - The "hint" MUST be under 8 words. Be extremely concise. Use short phrases rather than full sentences.
    
    OUTPUT REQUIREMENTS:
    - If HINT mode: provide "word" and "hint".
    - If WRONG_WORD mode: provide "word" and "imposterWord".
    - If BLIND mode: provide "word".
    
    Return a valid JSON object.`;
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

    const response = result.response;
    const text = response.text();
    const data = JSON.parse(text || "{}");
    
    const sources: Source[] = [];
    // Note: The new API doesn't include sources in the same way
    // You can add source tracking here if needed

    return { ...data, strategy, sources: sources.length > 0 ? sources : undefined } as GameData;

  } catch (error) {
    console.error("GenAI Error:", error);
    return { word: "Solar Eclipse", hint: "A rare cosmic alignment", strategy: ImposterStrategy.HINT };
  }
}
