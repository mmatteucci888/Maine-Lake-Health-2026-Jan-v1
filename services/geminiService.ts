import { GoogleGenAI } from "@google/genai";

const CACHE_KEY_PREFIX = "lake_audit_pro_v6_";
const CACHE_TTL = 24 * 60 * 60 * 1000;

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
  if (lakeId && retryCount === 0) {
    const cached = getCachedNarrative(lakeId);
    if (cached) return { ...cached, isFromCache: true };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a Senior Limnological Consultant for Maine's Environmental Registry. 
  Your task is to provide objective, site-specific ecological health audits.
  
  MANDATORY GUIDELINES:
  1. Use ONLY third-person, clinical, and authoritative language.
  2. For any lake requested, retrieve specific water quality metrics: Secchi Disk (m), Total Phosphorus (ppb), AND Phytoplankton imaging data (FlowCam biovolume, concentration, dominant taxa).
  3. Search specifically for FlowCam reports from the Lake Stewards of Maine or Maine DEP.
  4. Synthesize the findings into a professional report.
  5. If phytoplankton/FlowCam data is available, mention biovolume or concentration (particles/mL) explicitly.
  
  Format: Professional scientific narrative. Cite URLs from MDEP, Lake Stewards of Maine, or LSM ESM Lab.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri,
    })).filter((s: any) => s.uri) || [];

    const text = response.text || "";
    
    // Improved extraction logic for classic metrics + FlowCam
    const phosMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ppb|ug\/L|phosphorus)/i);
    const secchiMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:meters|m|clarity|secchi)/i);
    const flowCamConcMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:particles\/mL|concentration|biovolume)/i);

    const result = {
      text,
      sources: sources.slice(0, 5),
      extractedMetrics: {
        phosphorus: phosMatch ? parseFloat(phosMatch[1]) : null,
        secchi: secchiMatch ? parseFloat(secchiMatch[1]) : null,
        flowCamConc: flowCamConcMatch ? parseFloat(flowCamConcMatch[1]) : null
      },
      timestamp: Date.now()
    };

    if (lakeId) setCachedNarrative(lakeId, result);
    return result;

  } catch (error: any) {
    const isRateLimit = error.message?.includes("429") || error.message?.includes("quota");
    if (isRateLimit && retryCount < 1) {
      if (onRetry) onRetry(5);
      await sleep(5000);
      return getLakeHealthInsights(prompt, lakeId, retryCount + 1, onRetry);
    }
    throw error;
  }
};