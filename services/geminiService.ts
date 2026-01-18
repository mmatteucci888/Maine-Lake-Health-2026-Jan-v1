
import { GoogleGenAI, Type } from "@google/genai";

export const getLakeHealthInsights = async (prompt: string) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return { 
      text: "Connection Error: API Key not found. If you are on mobile, please ensure the environment is correctly configured or use a desktop browser.", 
      discoveredLakes: [], 
      sources: [] 
    };
  }

  // Always create a new instance right before use to ensure the most up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are the Lead Limnologist for Maine's Great Ponds. 
  Your primary objective is to provide a specific ecological audit for a lake requested by the user. 
  Use Google Search to locate the absolute latest data for that specific basin.
  
  Format your response STRICTLY as a JSON object:
  {
    "answer": "A 2-3 sentence technical ecological summary.",
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
        "history": []
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
  } catch (error: any) {
    console.error("Gemini Health Error:", error);
    let errorMessage = "Analysis interrupted.";
    if (error.message?.includes('403')) errorMessage = "API Access Forbidden (403). Check project permissions.";
    if (error.message?.includes('404')) errorMessage = "Model or Resource not found (404).";
    
    return { 
      text: `${errorMessage} Technical details: ${error.message || 'Unknown error'}`, 
      discoveredLakes: [], 
      sources: [] 
    };
  }
};

export const getLakeNews = async (lakeName: string, town: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { articles: [], sources: [] };

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Search for recent environmental news related to ${lakeName} in ${town}, Maine for 2024.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Aggregator of regional lake news.",
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
    return { articles: [], sources: [] };
  }
};
