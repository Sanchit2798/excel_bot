/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Excel, Office */

console.log("Loading taskpane.js...");
import {makeLlmCall, addChatHistoryEntry} from "./llmconnector.js";

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

    await Excel.run(async (context) => {
      console.log("trying in taskpane");

      chat_json = addChatHistoryEntry(chat_json, "user", userInput);

      // Load the script and wait for llm_action to complete
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = './output.js';

        script.onload = async () => {
          try {
            await llm_action(context); // Wait for llm_action to complete
            resolve();
          } catch (error) {
            console.error("Error in llm_action:", error);
            reject(error);
          }
        };

        script.onerror = () => {
          console.error(`Failed to load script: ${script.src}`);
          reject(new Error(`Script load error: ${script.src}`));
        };

        document.head.appendChild(script);
      });

      console.log("llm_action executed successfully.");
      await context.sync();
      console.log("Excel context synced.");
    });

  } catch (error) {
    console.error("Error in run():", error);
    location.reload();
  }

  hideLoader();
}