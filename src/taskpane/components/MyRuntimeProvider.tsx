"use client";
import * as React from "react";
import type { ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { respondToUserQuery } from "../taskpane";
import { ApprovalTool, ApprovalToolUI } from "./ApprovalTool";

let chatMessageHistory: { role: string; content: string }[] = [];
let userMessageNeedsExecution = false;
let toolCallCounter = 0;
function createApprovalToolPayload(extractedCode: string, toolCallId: string): {
  content: (
    | { type: "text"; text: string }
    | {
        type: "tool-call";
        toolCallId: string;
        toolName: "approvalTool";
        args: { code: string};
        argsText: string;
      }
  )[];
} {
  return {
    content: [
      {
        type: "text",
        text: `\`\`\`typescript\n${extractedCode}\n\`\`\``,
      },
      {
        type: "tool-call",
        toolCallId: toolCallId,
        toolName: "approvalTool",
        args: { code: extractedCode },
        argsText: "extractedCode",
      },
    ],
  };
}


const MyModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    let textMessages = messages.map((m) => {
    const textPart = m.content.find((c) => c.type === "text");
    return {
      role: m.role,
      content: textPart && 'text' in textPart ? textPart.text : "",
    };
    });

    if (userMessageNeedsExecution){
      userMessageNeedsExecution = false;
      chatMessageHistory.push(textMessages[textMessages.length - 1]);
      const extractedCode = textMessages[textMessages.length - 1].content;
      toolCallCounter += 1;
      yield createApprovalToolPayload(extractedCode, toolCallCounter.toString());
      return;
    }
    chatMessageHistory.push(textMessages[textMessages.length - 1]);
    const responseFromAgent = await respondToUserQuery(chatMessageHistory, abortSignal);
    console.log(abortSignal);
    let text = "";
    for await (const part of responseFromAgent) {
      text += part;
      yield {
        content: [{ type: "text", text }],
      };
    }

    const extractedCode = extractGeneratedCode(text);
    chatMessageHistory.push({role:"assistant",
      content: extractedCode});
    toolCallCounter += 1;
    yield createApprovalToolPayload(extractedCode, toolCallCounter.toString());
  },
};

function extractGeneratedCode(input: string): string {
  const marker = "Generated code- \n";
  const index = input.indexOf(marker);
  if (index === -1) return ""; // Marker not found
  return input.slice(index + marker.length);
}

export async function resumeWithApproval(result: { approved: boolean}, 
  code: string) {
  if (result.approved) {
    console.log("User approved the suggestion.");
    const createdFn = new Function(code);
    const llmCreatedFn = createdFn(); 
    try {
        await llmCreatedFn();
        chatMessageHistory.push({role:"system",
          content: "Code executed successfully."});
         console.log("Code executed successfully.");
        return {response : "Code executed successfully.", codeButtonText: "Run code"};
      }
      catch (error) { 
        console.log("Error in dynamic function: " + error);
          chatMessageHistory.push({role:"system",
            content: "Error encountered \n" + error.toString()});
        return {response : "Error encountered \n" + error.toString(), codeButtonText: "Run code"};
      }
  }
  else {
    if (userMessageNeedsExecution){
      userMessageNeedsExecution = false;
      return {response : "AI Agent mode: Enter instruction", codeButtonText: "Run code"};
    }
    else {
      userMessageNeedsExecution = true;
      return {response : "Code execution mode: Enter your code to execute", codeButtonText: "AI Agent"};      
    }
  }
}

const tools = [
  {
    type: "function",
    function: {
      name: "approvalTool",
      description: "Ask the user to approve or reject the suggestion",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "code to be presented to user and then exectued",
          },
        },
        required: ["code"],
      },
    },
  },
];

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {

  const runtime = useLocalRuntime(MyModelAdapter, {
  // Tools are passed via context
  context: { tools }
  } as any);
  
          
  return (
    <AssistantRuntimeProvider runtime={runtime} >
      <button onClick={() => {
        runtime.thread.reset();
        chatMessageHistory = [];
      }} 
      style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "999px",
              border: "1px solid #ccc",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
              fontWeight: 300,
              transition: "background-color 0.2s ease",
              height: "40px",
            }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
      >Reset chat</button>
      <ApprovalTool/>
      <ApprovalToolUI/>
      {children}      
    </AssistantRuntimeProvider>
  );
}