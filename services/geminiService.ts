
import { GoogleGenAI } from "@google/genai";

const CACHE_KEY_PREFIX = "lake_audit_pro_v3_";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
    console.warn("Storage quota exceeded locally.");
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getLakeHealthInsights = async (
  prompt: string, 
  lakeId?: string, 
  retryCount = 0,
  onRetry?: (seconds: number) => void
): Promise<any> => {
  // 1. Check Cache First
  if (lakeId && retryCount === 0) {
    const cached = getCachedNarrative(lakeId);
    if (cached) return { ...cached, isFromCache: true };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `You are the Lead Limnologist for Maine's Great Ponds. 
  Provide a site-specific ecological audit. Use Google Search for recent news.
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
    // 2. Handle Quota/Rate Limits
    const isRateLimit = error.message?.includes("429") || 
                        error.message?.includes("quota") || 
                        error.message?.includes("limit");
    
    if (isRateLimit && retryCount < 1) {
      const waitTime = 5000; // 5 second cool-off
      if (onRetry) onRetry(5);
      await sleep(waitTime);
      return getLakeHealthInsights(prompt, lakeId, retryCount + 1, onRetry);
    }
    
    // If we still fail, throw so App.tsx can use local fallback
    throw error;
  }
};
