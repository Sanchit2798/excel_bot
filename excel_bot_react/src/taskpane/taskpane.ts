/* global Excel console */
// import * as groqModule from '@langchain/groq';
const groqModule = require('@langchain/groq');
import { system_prompt } from './prompts';

// function showLoader() {
//   document.getElementById('loader').style.display = 'block';
// }

// function hideLoader() {
//   document.getElementById('loader').style.display = 'none';
// }

let chat_json = {"chat_history": []};

export async function insertText(text: string) {
  // showLoader();
  const userInput_ = text;
  console.log("input value:", userInput_);
  chat_json = await addChatHistoryEntry(chat_json, "user", userInput_);

  let numberOfattemps = 0;
  const maxAttempts = 2;
  let executedResonposeSucessfully = false;

  while ((numberOfattemps < maxAttempts) && 
  (!executedResonposeSucessfully)){
    numberOfattemps += 1;

    const llm = new groqModule.ChatGroq({
        model: "llama-3.1-8b-instant", // or any other supported model
        temperature: 0.1,
        apiKey:'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' // or pass directly as a string
        });

    const response = await llm.invoke([
          { role: "system", content: system_prompt },
          { role: "user", content: chat_json.chat_history.map(entry => `${entry.role}: ${entry.response}`).join("\n") },
        ]);

    if (response) {
      let code = typeof response.content === "string"
        ? response.content.replace(/```javascript|```/g, '').trim()
        : Array.isArray(response.content)
          ? response.content.map((c: any) => typeof c === "string" ? c : c.text || "").join("\n").replace(/```javascript|```/g, '').trim()
          : "";
      
      chat_json = await addChatHistoryEntry(chat_json, "you", code);

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
    
    await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const range = sheet.getRange("A1");
    range.values = [[text]];
    range.format.autofitColumns();
    await context.sync();

    });
    
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