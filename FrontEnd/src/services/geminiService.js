import { GoogleGenAI } from "@google/genai";

export const getStudyAdvice = async (userProfile) => {
    // In Vite, environment variables must be prefixed with VITE_
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
        console.warn("VITE_API_KEY is not set. Returning mock data. Create a .env file in the root directory and add VITE_API_KEY=your_key_here");
        return new Promise(resolve => setTimeout(() => resolve("This is mock study advice because the API key is missing. For Web Dev and ML, focus on project-based learning. Since you prefer practical and night-time study, try building a small full-stack app in the evenings."), 1000));
    }
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const prompt = `Based on the following student profile, provide some personalized, actionable, and encouraging study advice. Format the output as plain text, with clear paragraphs. **Student Profile:** - **Name:** ${userProfile.name} - **Interested Domains:** ${userProfile.domains.join(', ')} - **Learning Style:** ${userProfile.learningStyle} - **Preferred Study Time:** ${userProfile.studyTime} - **Team/Solo Preference:** ${userProfile.teamPref}`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to generate advice from AI.");
    }
};
