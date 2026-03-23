import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const model = "gemini-3-flash-preview";

export async function generateImage(prompt: string, isColoringBook: boolean = false): Promise<string> {
  try {
    console.log("Generating image with Pollinations AI for prompt:", prompt);
    
    let finalPrompt = prompt;
    if (isColoringBook) {
      finalPrompt = `${prompt}, coloring book black and white line art`;
    }

    // Encode the prompt for the URL
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true`;
    
    // We return the URL directly. Pollinations generates the image on request.
    // To "handle loading states properly", we can pre-fetch the image or just let the browser handle it.
    // The current UI expects this to be an async call that completes when the image is "ready".
    // We'll do a quick fetch to ensure the URL is valid/triggered, though it's not strictly necessary for Pollinations.
    // Actually, to satisfy the "handle loading states" requirement in the UI, we should wait for the image to load.
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(imageUrl);
      img.onerror = () => reject(new Error("Failed to load image from Pollinations AI"));
      img.src = imageUrl;
    });
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
