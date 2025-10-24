"use client";
import * as React from "react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
  makeAssistantToolUI,
} from "@assistant-ui/react";
import { respondToUserQuery } from "./taskpane";
import { makeAssistantTool, tool } from "@assistant-ui/react";
import { z } from "zod";

let chatMessageHistory: { role: string; content: string }[] = [];
let userMessageNeedsExecution = false;

const MyModelAdapter: ChatModelAdapter = {

  async *run({ messages, abortSignal }) {
    // TODO replace with your own API
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
      yield {
        content: [
        {
          type: "text",
          text :  `\`\`\`typescript\n${extractedCode}\n\`\`\``,
        },

        { type: "tool-call" as const, 
          toolCallId:"1", 
          toolName:"approvalTool", 
          args:{suggestions:extractedCode},
          argsText:"abcd"
        }]
      };
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
    yield {
        content: [
        {
          type: "text",
          text : `\`\`\`typescript\n${extractedCode}\n\`\`\``,
        },

        { type: "tool-call" as const, 
          toolCallId:"1", 
          toolName:"approvalTool", 
          args:{suggestions:extractedCode},
          argsText:"abcd"
        }]
    };
  },
};

function extractGeneratedCode(input: string): string {
  const marker = "Generated code- \n";
  const index = input.indexOf(marker);
  if (index === -1) return ""; // Marker not found
  return input.slice(index + marker.length);
}

export const approvalTool = tool({
  
  description: "Ask the user to approve or reject the suggestion",
  parameters: z.object({
    suggestion: z.string(),
  }),
  async execute({ suggestion }) {
    return {
      content: [
        {type: "tool-ui", 
          toolName:"approvalToolUI", 
          args:{suggestions:suggestion},
          argsText:"abcd"
        },
      ],
    };
  },
});

// Create the component
export const ApprovalTool = makeAssistantTool({
  ...approvalTool,
  toolName: "approvalTool",
});

export const ApprovalToolUI = makeAssistantToolUI<
  { message: string },
  { approved: boolean }
>({
  toolName: "approvalTool",
  render: ({ args }) => {
      const [response, setResponse] = useState<string | null>(null);
      const handleApproval = async (approved: boolean) => {
      const result = await resumeWithApproval({ approved }, args.suggestions as string);
      setResponse(result); // assuming result is a string or JSX
      };

      return (
        <div className="confirmation-dialog" style={{ padding: "1rem", fontFamily: "sans-serif" }}>
        <p style={{ marginBottom: "1rem" }}>{args.message}</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="button"
            onClick={() => handleApproval(true)}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "999px",
              border: "1px solid #ccc",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
              fontWeight: 500,
              transition: "background-color 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
          >
            ✅ Execute
          </button>
          <button
            type="button"
            onClick={() => handleApproval(false)}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "999px",
              border: "1px solid #ccc",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
              fontWeight: 500,
              transition: "background-color 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
          >
            Run My Code
          </button>
        </div>

        {/* Display the response below */}
        {response && (
          <div style={{ marginTop: "1rem", background: "#f9f9f9", padding: "1rem", borderRadius: "6px" }}>
            <strong>Response:</strong>
            <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>{response}</pre>
          </div>
        )}
      </div>

      );
  },
});

async function resumeWithApproval(result: { approved: boolean }, code: string) {
  if (result.approved) {
    console.log("User approved the suggestion.");
    const createdFn = new Function(code);
    const llmCreatedFn = createdFn(); 
    try {
        await llmCreatedFn();
        chatMessageHistory.push({role:"system",
          content: "Code executed successfully."});
         console.log("Code executed successfully.");
        return "Code executed successfully.";
      }
      catch (error) { 
        console.log("Error in dynamic function: " + error);
          chatMessageHistory.push({role:"system",
            content: "Error encountered \n" + error.toString()});
        return "Error encountered \n" + error.toString();
      }
  }
  else {
    chatMessageHistory.push({role:"user",
      content: "Do not run the code."});
    userMessageNeedsExecution = true;
    return "Enter code to execute.";
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
          suggestions: {
            type: "string",
            description: "ABCD suggestions",
          },
        },
        required: ["suggestions"],
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
  context: { tools },
  } as any);
  
  return (
    <AssistantRuntimeProvider runtime={runtime} >
      <button onClick={() => {
        runtime.thread.reset();
        chatMessageHistory = [];
      }}>Reset chat</button>
      <ApprovalTool/>
      <ApprovalToolUI/>
      {children}      
    </AssistantRuntimeProvider>
  );
}