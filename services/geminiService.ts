
import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return null;
};

export const getLakeHealthInsights = async (prompt: string) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return { 
      text: "Connection Error: API Key not found. Please ensure the environment is correctly configured.", 
      discoveredLakes: [], 
      sources: [] 
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are the Lead Limnologist for Maine's Great Ponds. 
  Your primary objective is to provide a specific ecological audit for a lake requested by the user. 
  Use Google Search to locate the absolute latest data for that specific basin from Maine DEP (Department of Environmental Protection) or VLMP (Volunteer Lake Monitoring Program).
  
  CRITICAL: If the user searches for a lake, you MUST return the lake details in the 'discoveredLakes' array.
  
  Format your response STRICTLY as a JSON object:
  {
    "answer": "A 2-3 sentence technical ecological summary focusing on recent findings.",
    "discoveredLakes": [
      {
        "name": "Full Proper Lake Name",
        "town": "Town Name",
        "lat": 44.2, 
        "lng": -70.5,
        "quality": "Excellent/Good/Fair/Poor",
        "secchi": 5.0,
        "phosphorus": 10.0,
        "chlorophyll": 2.0,
        "history": [
          {"year": 2021, "secchi": 5.2, "phosphorus": 9.8},
          {"year": 2022, "secchi": 5.0, "phosphorus": 10.2},
          {"year": 2023, "secchi": 5.1, "phosphorus": 10.0}
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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return {
      text: data.answer || "Audit complete.",
      discoveredLakes: data.discoveredLakes?.map((l: any) => ({
        id: l.name.toLowerCase().replace(/\s+/g, '-'),
        name: l.name,
        town: l.town || 'Maine',
        zipCode: "00000",
        coordinates: { 
          lat: l.lat || 44.2139, 
          lng: l.lng || -70.5281 
        },
        waterQuality: l.quality || 'Good',
        lastSecchiDiskReading: l.secchi || 5.0,
        phosphorusLevel: l.phosphorus || 10.0,
        chlorophyllLevel: l.chlorophyll || 2.0,
        invasiveSpeciesStatus: "None detected",
        lastUpdated: '2024',
        historicalData: l.history || [],
        advancedMetrics: {
          imperviousSurface: 10,
          flushingRate: 1.2,
          catchmentRatio: 8.5,
          anoxiaDepth: 5.0,
          hodRate: 0.05,
          internalLoadingRisk: 'Low',
          shorelineNaturalization: 75,
          macrophyteDiversity: 5,
          benthicHealth: 'Optimal'
        }
      })) || [],
      sources: sources.slice(0, 3)
    };
  } catch (error: any) {
    console.error("Gemini Health Error:", error);
    return { 
      text: `Analysis encountered an error: ${error.message || 'Unknown error'}`, 
      discoveredLakes: [], 
      sources: [] 
    };
  }
};

export const getLakeNews = async (lakeName: string, town: string) => {
  const apiKey = getApiKey();
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

    return {
      articles: (response.text || "").split(/\n\d\.\s+/).filter(a => a.trim().length > 0).map(content => ({ content })),
      sources: sources.slice(0, 3)
    };
  } catch (error) {
    return { articles: [], sources: [] };
  }
};
