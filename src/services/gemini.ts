import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAIExplanation(concept: string, question: string, userAnswer: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Explain the following aptitude question and concept visually. 
      Concept: ${concept}
      Question: ${question}
      User's Answer: ${userAnswer}
      
      Provide a step-by-step breakdown that can be easily visualized.`,
      config: {
        systemInstruction: "You are an expert aptitude trainer who explains concepts using simple visual analogies and step-by-step logic.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate AI explanation at this time.";
  }
}

export async function getPersonalizedFeedback(userProgress: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze this student's progress and identify weak areas: ${JSON.stringify(userProgress)}. 
      Suggest 3 specific topics to focus on and why.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weakAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return { weakAreas: [] };
  }
}
