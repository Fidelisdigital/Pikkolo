import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const model = "gemini-3-flash-preview";
export const imageModel = "gemini-2.5-flash-image";

export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log("Generating image with prompt:", prompt);
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [{ text: prompt }],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini Image API");
    }

    const candidate = response.candidates[0];
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      throw new Error(`Image generation failed with reason: ${candidate.finishReason}`);
    }

    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response parts");
  } catch (error: any) {
    console.error("Gemini Image API Error Details:", {
      message: error.message,
      stack: error.stack,
      prompt
    });
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
