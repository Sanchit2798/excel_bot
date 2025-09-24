/* global Excel console */
// import * as groqModule from '@langchain/groq';
const groqModule = require('@langchain/groq');
import { system_prompt } from './prompts';
import { TavilySearchAgent } from './agents/tavily-search';
import { AgenticRAG } from './agents/agentic-rag';
import {googleWebSearch} from './agents/google-gen-web-search';
const agenticRAG = new AgenticRAG();
// function showLoader() {
//   document.getElementById('loader').style.display = 'block';
// }

// function hideLoader() {
//   document.getElementById('loader').style.display = 'none';
// }


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
    const ragResponse = await agenticRAG.run("How to do this using excel javascript excel addin?" + 
                                          userInput_);
    chat_json = await addChatHistoryEntry(chat_json, "RagAIAgent", ragResponse);
    console.log("RAG response:", ragResponse);

    const llm = new groqModule.ChatGroq({
        model: "llama-3.1-8b-instant", // or any other supported model
        temperature: 0.0,
        apiKey:'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' // or pass directly as a string
        });

    const response = await llm.invoke([
          { role: "system", content: system_prompt },
          { role: "user", content: chat_json.chat_history.map(entry => `${entry.role}: ${entry.response}`).join("\n") },
        ]);

    if (response) {
      let extractedCode = await llm.invoke([
          { role: "system", content: "Extract only the code bit from the content given, enclose the code between %%. Example %%code%%. Code should be able to be executed as a independent function." },
          { role: "user", content: response.content }]);
      let code = 'return ' + extractedCode.content.split("%%")[1];
      chat_json = await addChatHistoryEntry(chat_json, "You", code);
      console.log(code);

      const createFn = new Function(code);
      const llm_action = createFn();
      
      try {
        await llm_action(); 
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