import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const model = "gemini-3-flash-preview";

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
    if (error?.message?.includes("Requested entity was not found") || error?.status === "NOT_FOUND") {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        (window as any).aistudio.openSelectKey();
      }
    }
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
    if (error?.message?.includes("Requested entity was not found") || error?.status === "NOT_FOUND") {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        (window as any).aistudio.openSelectKey();
      }
    }
    throw error;
  }
}
