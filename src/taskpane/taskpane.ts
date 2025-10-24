/* global Excel console */
const groqModule = require('@langchain/groq');
import { GoogleGenAI } from "@google/genai";
import { code_generation_system_prompt, code_extract_prompt } from './prompts';
import { AgenticRAG } from './agents/agentic-rag';
import {googleWebSearch} from './agents/google-gen-web-search';
const agenticRAG = new AgenticRAG();
// Configure the client
const googleAi = new GoogleGenAI({apiKey:'AIzaSyBUQ7qNn8wc5NAdpL-j1MblLYykxwpVTns'});

async function* checkAbortSignal(abortSignal: AbortSignal){
  if (abortSignal.aborted){
    yield "Request aborted immediately";
    return;
  }
}

export async function* respondToUserQuery(messages : { role: string; content: string }[], abortSignal: AbortSignal) : AsyncGenerator<string> {
  
  yield "Processing your input...\n";
  await checkAbortSignal(abortSignal);

  const userMessages = messages.filter((m) => m.role === "user");
  const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : undefined;
  console.log("input value:", lastUserMessage);

  if (lastUserMessage === undefined){
    yield "No user message found.\n";
    return messages;
  }

  yield "Making web search ...\n";
  let searchResult = await googleWebSearch("How to do this using excel javascript excel addin?" + 
                                            lastUserMessage);
  messages.push(createChatEntry("assistant web search agent", searchResult));
  
  if (!agenticRAG.initialised){
    await checkAbortSignal(abortSignal);
    await agenticRAG.init();
  }
  
  await checkAbortSignal(abortSignal);
  yield "Searching add in docs...\n";
  const ragResponse = await agenticRAG.run("Users wants to generate code to do this using excel javascript excel addin. User query -" + 
                                          lastUserMessage +
                                          "Some reteived info from web search included this:"+
                                          searchResult);
  messages.push(createChatEntry("assistant rag agent", ragResponse));
    
  checkAbortSignal(abortSignal);
  yield "Coding...\n";
  const codeResponse = await googleAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createInputForCodingLLm(lastUserMessage, messages),
      config: {systemInstruction:code_generation_system_prompt}
  });

  checkAbortSignal(abortSignal);
  yield "Finalisign code ...\n";
  let extractedCode = await googleAi.models.generateContent({
                                            model: "gemini-2.5-flash",
                                            contents:codeResponse.text,
                                            config: {systemInstruction:code_extract_prompt}
                                          });
  const match = extractedCode.text.match(/<code>([\s\S]*?)<\/code>/);
  let code = "async function llm_action(){console.log('');}";
  if (match) {
    code = "return " + match[1].trimStart();
    console.log(code);
  } else {
    console.log("No <code> block found.");
  }

  checkAbortSignal(abortSignal);
  yield "Running code ...\n" + "Generated code- \n" + code + "\n";
  messages.push(createChatEntry("assistant code agent", code));
  return messages;  
};

function createInputForCodingLLm(lastUserMessage: string, messages: { role: string; content: string; }[]) {
  return "User wants to do this in excel: "
    + lastUserMessage
    + "\n .Write excel javascript add in code to accomplish this. Use this info to gnerate code: \n"
    + messages.filter((m) => m.role != "user").map((m) => "role : " + m.role + "\n" +
      "content : " + m.content + "\n" +
      "\n .......................................................................... \n").join(" \n");
}

function createChatEntry(role, content) {
  return { role:role,
    content: content
  }
}