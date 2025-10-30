
import { GoogleGenAI } from "@google/genai";

export const summarizeArticle = async (articleContent: string): Promise<string> => {
    // API Key must be set in environment variables
    if (!process.env.API_KEY) {
        return "API_KEY environment variable not set. Please configure it to use the AI summarizer.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please summarize the following news article in three concise bullet points:\n\n---\n\n${articleContent}`,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error summarizing article with Gemini API:", error);
        return "Sorry, I couldn't summarize the article at this time. Please try again later.";
    }
};
