import { GoogleGenAI } from "@google/genai";

export async function googleWebSearch(query:string){
    // Configure the client
    const ai = new GoogleGenAI({apiKey:'AIzaSyBUQ7qNn8wc5NAdpL-j1MblLYykxwpVTns'});

    // Define the grounding tool
    const groundingTool = {
    googleSearch: {},
    };

    // Configure generation settings
    const config = {
    tools: [groundingTool],
    };

    // Make the request
    const responseGemini = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config,
    });
   return responseGemini.text;
} 