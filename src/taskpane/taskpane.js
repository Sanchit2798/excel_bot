/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Excel, Office */
const vm = require('vm');

console.log("Loading taskpane.js...");

function showLoader() {
  document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

let chat_json = {"chat_history": []};

Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  showLoader();

  try {
    const userInput = document.getElementById("userInput").value;
    console.log("input value:", userInput);
    chat_json = await addChatHistoryEntry(chat_json, "user", userInput);
    } catch (error) {
    console.error("Error adding user input to chat history:", error);
    }

    let numberOfattemps = 0;
    const maxAttempts = 2;
    let executedResonposeSucessfully = false;
    while ((numberOfattemps < maxAttempts) && 
    (!executedResonposeSucessfully)){
      numberOfattemps+=1;
      const response = await fetch("http://127.0.0.1:5000/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chat_json),
      });
      
      if (response.ok){
        chat_json = await response.json();
        try {
          await Excel.run(async (context) => {
          console.log("Inside Excel.run in taskpane.js");
          // Load the script and wait for llm_action to complete
          // await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            // script.src = './output.js';
            script.type = "text/javascript";
            script.textContent = chat_json.chat_history[chat_json.chat_history.length - 1].response;
            document.head.appendChild(script);
            // script.onload = async () => {
            try {
              llm_action(context);
              context.sync(); // Wait for llm_action to complete
              executedResonposeSucessfully = true;
              // resolve();
              } catch (error) {
              console.error("Error in llm_action:", error);
              chat_json = addChatHistoryEntry(chat_json, "user", "encountering following error while executing your suggested code:" + error.message);
              // resolve()
              }
            // };
            script.onerror = () => {
            console.error(`Failed to load script: ${script.src}`);
            reject(new Error(`Script load error: ${script.src}`));
            };
           
          // });

          await context.sync(); 
          console.log("Excel context synced.");
          });
        }
        catch (error){
          console.error("Error in trying to run the generated code from llm:", error);
        }
      }
      else{
        console.error("Error from API:", response.statusText);
      }
    }

  hideLoader();
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