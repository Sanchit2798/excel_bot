/* global Excel console */
// import * as groqModule from '@langchain/groq';
const groqModule = require('@langchain/groq');
import { GoogleGenAI } from "@google/genai";
import { code_generation_system_prompt, code_extract_prompt } from './prompts';
import { TavilySearchAgent } from './agents/tavily-search';
import { AgenticRAG } from './agents/agentic-rag';
import {googleWebSearch} from './agents/google-gen-web-search';
const agenticRAG = new AgenticRAG();
// Configure the client
const googleAi = new GoogleGenAI({apiKey:'AIzaSyBUQ7qNn8wc5NAdpL-j1MblLYykxwpVTns'});

export async function insertText(text: string) {
  let chat_json = {"chat_history": []};
  const userInput_ = text;
  console.log("input value:", userInput_);
  chat_json = await addChatHistoryEntry(chat_json, "user", userInput_);

  let numberOfattemps = 0;
  const maxAttempts = 2;
  let executedResonposeSucessfully = false;

  while ((numberOfattemps < maxAttempts) && 
  (!executedResonposeSucessfully)){
    numberOfattemps += 1;

    // const searchAgent = new TavilySearchAgent()
    // const searchResult = await searchAgent.run("How to do this using excel javascript excel addin?" + 
    //                                       userInput_)
    
    let searchResult = await googleWebSearch("How to do this using excel javascript excel addin?" + 
                                          userInput_);
    chat_json = await addChatHistoryEntry(chat_json, "WebSearchAgent", searchResult);
    console.log(searchResult);
    
    if (!agenticRAG.initialised)
    {
      await agenticRAG.init();
    }
    const ragResponse = await agenticRAG.run("Users wants to generate code to do this using excel javascript excel addin. User query -" + 
                                          userInput_ +
                                          "Some reteived info from web search included this:"+
                                          searchResult);
    chat_json = await addChatHistoryEntry(chat_json, "RagAIAgent", ragResponse);
    console.log("RAG response:", ragResponse)
    // const llm = new groqModule.ChatGroq({
    //     model: "llama-3.1-8b-instant", // or any other supported model
    //     temperature: 0.0,
    //     apiKey:'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' // or pass directly as a string
    //     });

    const response = await googleAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents:chat_json.chat_history.map(entry => `${entry.role}: ${entry.response}`).join("\n"),
      config: {systemInstruction:code_generation_system_prompt}
    });
    // await llm.generate([
    //       { role: "system", content: code_generation_system_prompt },
    //       { role: "user", content: chat_json.chat_history.map(entry => `${entry.role}: ${entry.response}`).join("\n") },
    //     ]);

    if (response) {
      let extractedCode = await googleAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents:response.text,
      config: {systemInstruction:code_extract_prompt}
    });
      // await llm.invoke([
      //     { role: "system", content: code_extract_prompt},
      //     { role: "user", content: response.content }]);
      // let code = 'return ' + extractedCode.content.split("<code>")[1];
      const match = extractedCode.text.match(/<code>([\s\S]*?)<\/code>/);
      
      let code = "async function llm_action(){console.log('');}";
      if (match) {
        code = "return " + match[1].trimStart();
        console.log(code);
      } else {
        console.log("No <code> block found.");
      }

      chat_json = await addChatHistoryEntry(chat_json, "You", code);
      console.log(code);

      const createdFn = new Function(code);
      const llmCreatedFn = createdFn();
      
      try {
        await llmCreatedFn(); 
        executedResonposeSucessfully = true;
      }
      catch (error) {
        console.log("Error in dynamic function: " + error);
        chat_json = addChatHistoryEntry(chat_json, "user", "encountering following error while executing your suggested code:" + error.message);
      }
    }};
    
    // await Excel.run(async (context) => {
    // const sheet = context.workbook.worksheets.getActiveWorksheet();
    // const range = sheet.getRange("A1");
    // range.values = [[text]];
    // range.format.autofitColumns();
    // await context.sync();
    // }); 
  }

function addChatHistoryEntry(chat_json, role, response) {
  chat_json.chat_history.push({
    id: chat_json.chat_history.length + 1,
    timestamp: new Date().toISOString(),
    role: role,
    response: response
  });
  return chat_json;
}