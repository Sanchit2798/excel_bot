/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Excel, Office */
// const GroqModule = require('@langchain/groq');

import { addChatHistoryEntry } from './utilities/add_chat_history_entry.js';
import { systemPrompt } from './agents/prompts.js';
import { showLoader, hideLoader } from './utilities/loaders.js';
import { ChatGroq } from "@langchain/groq";
import {agentComment} from './agents/agent.ts';
// import * as GroqModule from '@langchain/groq';
// console.log(GroqModule);
console.log("Loading taskpane.js...");
console.log(agentComment);
let chatJson = {"chatHistory": []};

Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  showLoader();
  const userInput_ = String(document.getElementById("userInput").value);
  console.log("input value:", userInput_);
  try {
    chatJson = await addChatHistoryEntry(chatJson, "user", userInput_);
    } catch (error) {
    console.error("Error adding user input to chat history:", error);
    }

    // let numberOfattemps = 0;
    // const maxAttempts = 2;
    // let executedResonposeSucessfully = false;

    // while ((numberOfattemps < maxAttempts) && 
    // (!executedResonposeSucessfully)){
    //   numberOfattemps+=1;
      
    //   if (typeof systemPrompt !== "string") {
    //   console.log("system_prompt is not a string:", systemPrompt);}

    //   if (typeof userInput_ !== "string") {
    //   console.log("system_prompt is not a string:", userInput_);}

    //   const llm = new GroqModule.ChatGroq({
    //   model: "llama-3.1-8b-instant", // or any other supported model
    //   temperature: 0.2,
    //   apiKey:'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' // or pass directly as a string
    //   });

    //   const response = await llm.invoke([
    //     { role: "system", content: systemPrompt },
    //     { role: "user", content: chatJson.chatHistory.map(entry => `${entry.role}: ${entry.response}`).join("\n") },
    //   ]);

    //   if (response){
    //     let code = response.content.replace(/```javascript|```/g, '').trim();
    //     console.log("Generated code:", code);
    //     chatJson = await addChatHistoryEntry(chatJson, "llm", code);

    //     const createFn = new Function(code);
    //     const llmAction = createFn();
      
    //     try {
    //       await llmAction(); 
    //       executedResonposeSucessfully = true;
    //     }
    //     catch (error) {
    //       console.log("Error in dynamic function: " + error);
    //       chatJson = addChatHistoryEntry(chatJson, "user", "encountering following error while executing your suggested code:" + error.message);
    //     }
    //   }
    //   else{
    //     console.error("Error from API:", response.statusText);
    //   }
    // }

  hideLoader();
  location.reload();
}

