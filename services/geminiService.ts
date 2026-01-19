
import { GoogleGenAI, Type } from "@google/genai";

const CACHE_KEY_PREFIX = "lake_audit_cache_";
const CACHE_TTL = 60 * 60 * 1000; // 1 Hour cache for narratives

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return null;
};

const getCachedNarrative = (lakeId: string) => {
  const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${lakeId}`);
  if (!cached) return null;
  const { timestamp, data } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL) return null;
  return data;
};

const setCachedNarrative = (lakeId: string, data: any) => {
  localStorage.setItem(`${CACHE_KEY_PREFIX}${lakeId}`, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
};

export const getLakeHealthInsights = async (prompt: string, lakeId?: string) => {
  // 1. Check Cache First
  if (lakeId) {
    const cached = getCachedNarrative(lakeId);
    if (cached) return cached;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key Missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are the Lead Limnologist for Maine's Great Ponds. 
  Your objective is to provide a unique, site-specific ecological audit.
  
  DIVERSITY REQUIREMENT: 
  Each narrative MUST be unique. Cross-reference results from:
  1. Maine DEP reports.
  2. LSM volunteer observations.
  3. Regional news (blooms, dam repairs, conservation).

  Format your response STRICTLY as a JSON object:
  {
    "answer": "A robust, 4-6 sentence unique narrative combining accessible and technical insights.",
    "discoveredLakes": []
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

    const result = {
      text: data.answer || "Audit complete.",
      discoveredLakes: data.discoveredLakes?.map((l: any) => ({
        id: l.name.toLowerCase().replace(/\s+/g, '-'),
        name: l.name,
        town: l.town || 'Maine',
        zipCode: "00000",
        coordinates: { lat: l.lat || 44.2, lng: l.lng || -70.5 },
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

    // Store in cache for next time
    if (lakeId) setCachedNarrative(lakeId, result);
    
    return result;
  } catch (error: any) {
    // If rate limited, throw a specific error that the UI can catch to show a local fallback
    if (error.message?.includes("429") || error.message?.includes("busy")) {
       throw new Error("RATE_LIMIT_REACHED");
    }
    throw error;
  }
};

export const getLakeNews = async (lakeName: string, town: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return { articles: [], sources: [] };

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Provide recent specific news for ${lakeName} in ${town}, Maine.`;

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
