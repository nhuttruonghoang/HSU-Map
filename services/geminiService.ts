import { GoogleGenAI } from "@google/genai";
import { SearchResponse, GeoLocation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchLocation = async (
  query: string,
  userLocation?: GeoLocation
): Promise<SearchResponse> => {
  try {
    const toolConfig = userLocation
      ? {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            },
          },
        }
      : undefined;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: toolConfig,
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("No response generated.");
    }

    const text = response.text || "Không tìm thấy thông tin.";
    
    // Extract grounding metadata safely
    // @ts-ignore - The SDK types might lag slightly behind the raw response structure for deep nested props depending on version
    const groundingMetadata = candidate.groundingMetadata as any;

    return {
      text,
      groundingMetadata: groundingMetadata,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
