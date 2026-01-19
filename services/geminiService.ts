
import { GoogleGenAI, Type } from "@google/genai";

const CACHE_KEY_PREFIX = "lake_audit_pro_v3_";
const CACHE_TTL = 24 * 60 * 60 * 1000;

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return null;
};

const getCachedNarrative = (lakeId: string) => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${lakeId}`);
    if (!cached) return null;
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) return data;
    return null;
  } catch (e) {
    return null;
  }
};

const setCachedNarrative = (lakeId: string, data: any) => {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${lakeId}`, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (e) {
    console.warn("Storage full.");
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getLakeHealthInsights = async (
  prompt: string, 
  lakeId?: string, 
  retryCount = 0,
  onRetry?: (seconds: number) => void
): Promise<any> => {
  if (lakeId && retryCount === 0) {
    const cached = getCachedNarrative(lakeId);
    if (cached) return { ...cached, isFromCache: true };
  }

  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `You are the Lead Limnologist for Maine's Great Ponds. 
  Your objective is to provide a unique, site-specific ecological audit.
  Diversity: Each narrative must be site-specific using Google Search for news/quality.
  Response Format: JSON { "answer": string, "discoveredLakes": [] }`;

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
    const data = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);

    const result = {
      text: data.answer || "Audit synchronized.",
      discoveredLakes: data.discoveredLakes || [],
      sources: sources.slice(0, 3),
      timestamp: Date.now()
    };

    if (lakeId) setCachedNarrative(lakeId, result);
    return result;

  } catch (error: any) {
    const isRateLimit = error.message?.includes("429") || error.message?.includes("busy") || error.message?.includes("limit");
    
    if (isRateLimit && retryCount < 2) {
      const waitTime = (Math.pow(2, retryCount + 1) * 3000) + (Math.random() * 2000);
      if (onRetry) onRetry(Math.ceil(waitTime / 1000));
      await sleep(waitTime);
      return getLakeHealthInsights(prompt, lakeId, retryCount + 1, onRetry);
    }
    throw error;
  }
};

export const getLakeNews = async (lakeName: string, town: string): Promise<any> => {
  const apiKey = getApiKey();
  if (!apiKey) return { articles: [], sources: [] };
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Recent news for ${lakeName}, ${town}, Maine.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return {
      articles: (response.text || "").split('\n').filter(a => a.trim().length > 10).map(content => ({ content })),
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({ title: c.web?.title, uri: c.web?.uri })).filter((s: any) => s.uri) || []
    };
  } catch {
    return { articles: [], sources: [] };
  }
};
