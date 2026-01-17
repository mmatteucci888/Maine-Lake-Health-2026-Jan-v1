
import { GoogleGenAI, Type } from "@google/genai";

export const getLakeHealthInsights = async (prompt: string) => {
  // Always create a new instance right before use to ensure the most up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are the Lead Limnologist for Maine's Great Ponds. 
  Your primary objective is to provide a specific ecological audit for a lake requested by the user. 
  Use Google Search to locate the absolute latest data for that specific basin.
  
  If the user asks about a new lake, find its specific coordinates, town, and current water metrics.
  
  Note: Many Maine lakes (Auburn, China, Great Pond, etc.) utilize Imaging Flow Cytometry (FlowCam) for phytoplankton biovolume tracking. If you find biovolume data (um3/mL) or specific taxa counts, include them in the answer.
  
  Format your response STRICTLY as a JSON object:
  {
    "answer": "A 2-3 sentence technical ecological summary focused on the lake being searched. Mention FlowCam monitoring if relevant.",
    "discoveredLakes": [
      {
        "name": "Full Proper Lake Name",
        "town": "Town Name",
        "lat": 44.x,
        "lng": -70.x,
        "quality": "Excellent/Good/Fair/Poor",
        "secchi": 5.0,
        "phosphorus": 10.0,
        "chlorophyll": 2.0,
        "history": [
           {"year": 2020, "secchi": 4.5, "phosphorus": 12.0},
           {"year": 2024, "secchi": 5.5, "phosphorus": 8.0}
        ]
      }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri,
    })).filter((s: any) => s.uri) || [];

    const text = response.text || "{}";
    // Sanitize in case the model wraps in markdown blocks despite MimeType
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return {
      text: data.answer || "Audit complete.",
      discoveredLakes: data.discoveredLakes?.map((l: any) => ({
        ...l,
        id: l.name.toLowerCase().replace(/\s+/g, '-'),
        lastUpdated: '2024',
        lastSecchiDiskReading: l.secchi || 5.0,
        phosphorusLevel: l.phosphorus || 10.0,
        chlorophyllLevel: l.chlorophyll || 2.0,
        waterQuality: l.quality || 'Good',
        coordinates: { lat: l.lat || 44.2, lng: l.lng || -70.5 },
        historicalData: l.history || [],
        zipCode: "00000",
        invasiveSpeciesStatus: "None detected"
      })) || [],
      sources: sources.slice(0, 3)
    };
  } catch (error) {
    console.error("Gemini Health Error:", error);
    return { 
      text: "Analysis interrupted. Check API key or connection.", 
      discoveredLakes: [], 
      sources: [] 
    };
  }
};

/**
 * Fetches recent news regarding a specific lake using Google Search grounding.
 */
export const getLakeNews = async (lakeName: string, town: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Search for recent environmental news, public health notices, water quality alerts, or community events related to ${lakeName} in ${town}, Maine for 2024. Summarize the top items.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a regional environmental news aggregator. Provide a brief summary of relevant articles.",
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri,
    })).filter((s: any) => s.uri) || [];

    const text = response.text || "";
    const articles = text.split(/\n\d\.\s+/).filter(a => a.trim().length > 0);

    return {
      articles: articles.map(content => ({ content })),
      sources: sources.slice(0, 3)
    };
  } catch (error) {
    console.error("Gemini News Error:", error);
    return { articles: [], sources: [] };
  }
};
