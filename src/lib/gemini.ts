import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features might not work.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function estimatePrice(service: string, details: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert market analyst for Yemen professional services. 
      Provide a realistic price estimate range in Yemeni Rial (YER) and US Dollars (USD) for the following service request in Yemen.
      Service: ${service}
      Details: ${details}
      
      Respond in a JSON format: 
      {
        "range_yer": "string (e.g. 10,000 - 20,000 YER)",
        "range_usd": "string (e.g. $20 - $40 USD)",
        "confidence": "string (low/medium/high)",
        "notes": "brief explanation of why this range"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
