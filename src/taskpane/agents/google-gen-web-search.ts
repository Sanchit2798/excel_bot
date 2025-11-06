import { getGoogleAi } from "./google-gen-ai";

export async function googleWebSearch(query:string){
    // Define the grounding tool
    const groundingTool = {
    googleSearch: {},
    };

    // Configure generation settings
    const config = {
    tools: [groundingTool],
    };

    // Make the request
    const responseGemini = await getGoogleAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config,
    });
   return responseGemini.text;
} 