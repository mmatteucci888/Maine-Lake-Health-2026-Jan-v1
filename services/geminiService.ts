
import { GoogleGenAI, Type } from "@google/genai";
import { LAKES_DATA, TARGET_ZIP } from "../constants";

const API_KEY = process.env.API_KEY;

export const getLakeHealthInsights = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    You are the Maine Lake Intelligence Agent. You have access to the health records of ALL Maine lakes.
    Your job is twofold:
    1. Answer questions using Google Search grounding for latest Secchi depth and phosphorus data.
    2. Whenever a user mentions a specific Maine lake, ALWAYS try to extract its current health metrics and coordinates.
    
    Coordinates must be precise (lat/lng) for the center of the lake basin in Maine.
    Water Quality must be one of: Excellent, Good, Fair, Poor.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING, description: "Detailed scientific answer to the user's question." },
            discoveredLake: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                town: { type: Type.STRING },
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                quality: { type: Type.STRING },
                secchi: { type: Type.NUMBER },
                phosphorus: { type: Type.NUMBER },
                status: { type: Type.STRING }
              }
            }
          }
        }
      },
    });

    const data = JSON.parse(response.text);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri,
    })).filter((s: any) => s.uri) || [];

    return {
      text: data.answer,
      discoveredLake: data.discoveredLake,
      sources: sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "I'm having trouble retrieving real-time Maine lake data. Please try again.",
      discoveredLake: null,
      sources: []
    };
  }
};
