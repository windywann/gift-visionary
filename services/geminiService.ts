import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GiftRequest, AiKeywordResponse } from "../types";

// Initialize Gemini Client
// NOTE: process.env.API_KEY is handled by the build/runtime environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 5-8 specific product keywords suitable for e-commerce search (e.g., '乐高花束', '复古黑胶机').",
    },
    reasoning: {
      type: Type.STRING,
      description: "A short, warm, and healing sentence explaining why these gifts were chosen.",
    }
  },
  required: ["keywords", "reasoning"],
};

export const generateGiftKeywords = async (request: GiftRequest): Promise<AiKeywordResponse> => {
  try {
    const prompt = `
      Task: Act as a thoughtful gift-giving consultant.
      User Context:
      - Recipient: ${request.relation} (Nickname: ${request.nickname})
      - Gender: ${request.gender === 'male' ? 'Male' : request.gender === 'female' ? 'Female' : 'Unspecified'}
      - Occasion: ${request.occasion}
      - Budget: ${request.budgetMin} - ${request.budgetMax} RMB
      - Interests: ${request.interests.join(', ')}
      - Remarks: ${request.remarks}

      Goal: Analyze the profile and generate 5-8 specific, creative, and shoppable gift keywords. 
      Avoid generic terms like "Gift". Be specific like "YSL Little Gold Bar Lipstick" or "Logitech Mechanical Keyboard".
      Also provide a short, warm, healing message explaining the choice.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AiKeywordResponse;
    }
    
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Fallback if AI fails
    return {
      keywords: ["高档巧克力", "精美香薰", "定制马克杯", "拍立得", "乐高"],
      reasoning: "网络似乎有点拥堵，但我为您挑选了一些经典的通用好礼！"
    };
  }
};