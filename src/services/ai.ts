import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const model = "gemini-3-flash-preview";

export async function generateImage(prompt: string, type: 'kids' | 'coloring' | 'cover' = 'kids'): Promise<string> {
  try {
    let finalPrompt = prompt;
    
    if (type === 'kids') {
      finalPrompt = `${prompt}, colorful child friendly cartoon style`;
    } else if (type === 'coloring') {
      finalPrompt = `${prompt}, black and white line art coloring page no color simple outlines`;
    }

    // Encode the prompt for the URL
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&nofeed=true`;
    
    return imageUrl;
  } catch (error: any) {
    console.error("Pollinations AI Error:", error);
    throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
  }
}

export async function generateContent(prompt: string, systemInstruction?: string) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateJSON<T>(prompt: string, schema: any, systemInstruction?: string): Promise<T> {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text || "{}") as T;
  } catch (error: any) {
    console.error("Gemini API Error (JSON):", error);
    throw error;
  }
}
