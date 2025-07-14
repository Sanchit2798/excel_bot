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
  showLoader()
  try {
    await Excel.run(async (context) => {
      let userInput = document.getElementById("userInput").value;
      console.log("input value : ", userInput);
      chat_json = addChatHistoryEntry(chat_json, "user", userInput);
      chat_json = makeLlmCall(chat_json);
      await context.sync();
    });
  } catch (error) {
    console.error(error);
    location.reload();
  }
  hideLoader();
}