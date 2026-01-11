
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

export const getLakeHealthInsights = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    You are the Maine Lake Intelligence Agent. You analyze ecological data for Maine lakes.
    
    TASK:
    1. Answer user questions about Maine lakes using Google Search grounding.
    2. If the user asks about a specific lake, ALWAYS attempt to find its:
       - Precise coordinates (lat/lng)
       - Town name
       - Recent Secchi Disk Reading (clarity in meters)
       - Phosphorus level (in ppb)
       - General water quality status (Excellent, Good, Fair, Poor)
    
    OUTPUT STRUCTURE:
    You must return a JSON object. The 'discoveredLake' field is CRITICAL for updating the dashboard.
    If no specific lake is identified, set 'discoveredLake' to null.
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
            answer: { type: Type.STRING, description: "Detailed scientific answer or commentary about the lake's health." },
            discoveredLake: {
              type: Type.OBJECT,
              nullable: true,
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
              },
              required: ["id", "name", "town", "lat", "lng", "quality", "secchi", "phosphorus"]
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
      text: "I'm having trouble analyzing the data for that lake right now. Please try again.",
      discoveredLake: null,
      sources: []
    };
  }
};
