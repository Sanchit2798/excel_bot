/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Excel, Office */

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

    // const numberOfattemps = 0;
    // const maxAttempts = 2;
    // while (numberOfattemps < maxAttempts) {
    // }

    // const response = await fetch("http://127.0.0.1:5000/api", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(chat_json),
    // });

    // if (response.ok) {
    //   let response_json = await response.json();
    //   chat_json = await addChatHistoryEntry(chat_json, "LLM", response_json);
    // }
    // else {
    //   console.error("Error from API:", response.statusText);
    //   throw new Error("Could not fetch from API");
    // }

    await Excel.run(async (context) => {
      console.log("Inside Excel.run in taskpane.js");
      // Load the script and wait for llm_action to complete
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = './output.js';

        script.onload = async () => {
          try {
            await llm_action(context);
            await context.sync(); // Wait for llm_action to complete
            resolve();
          } catch (error) {
            console.error("Error in llm_action:", error);
          }
        };

        script.onerror = () => {
          console.error(`Failed to load script: ${script.src}`);
          reject(new Error(`Script load error: ${script.src}`));
        };

        document.head.appendChild(script);
      });
      await context.sync(); 
      console.log("Excel context synced.");
    });

  } catch (error) {
    console.error(error);
    location.reload();
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