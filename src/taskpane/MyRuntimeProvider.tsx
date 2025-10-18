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
import { Chat } from "@google/genai";

let chatMessages = [];
let userMessageNeedsExecution = false;

const MyModelAdapter: ChatModelAdapter = {

  async *run({ messages, abortSignal }) {
    // TODO replace with your own API
    let userMessages = messages.map((m) => ({
        role: m.role,
        content: m.content
          .filter((c) => c.type === "text"),
      }))  

    if (userMessageNeedsExecution){
      userMessageNeedsExecution = false;
      chatMessages.push(userMessages[userMessages.length - 1]);
      const extractedCode = userMessages[userMessages.length - 1].content[0] as any;
      yield {
        content: [
        {
          type: "text",
          text :  `\`\`\`typescript ${extractedCode.text} `,
        },

        { type: "tool-call" as const, 
          toolCallId:"1", 
          toolName:"approvalTool", 
          args:{suggestions:extractedCode.text},
          argsText:"abcd"
        }]
      };
      return;
    }
    chatMessages.push(userMessages[userMessages.length - 1]);
    const responseFromAgent = await respondToUserQuery(chatMessages, abortSignal);
    console.log(abortSignal);
    let text = "";
    for await (const part of responseFromAgent) {
      text += part;
      yield {
        content: [{ type: "text", text }],
      };
    }

    const extractedCode = extractGeneratedCode(text);
    chatMessages.push({role:"assistant",
      content: [{text : extractedCode}]});
    yield {
        content: [
        {
          type: "text",
          text :  `\`\`\`typescript ${extractedCode}`,
        },

        { type: "tool-call" as const, 
          toolCallId:"1", 
          toolName:"approvalTool", 
          args:{suggestions:extractedCode},
          argsText:"abcd"
        }]
    };

//     yield {
//       content: [
//         {
//           type: "text",
//           text: `\`\`\`typescript
// function greet(name: string) {
//   return "Hello, " + name;
// }

// console.log(greet("${name}"));
// \`\`\``
//         },
//       ],
//     };
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
  render: ({ args, resume }) => {
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
      resume({ approved: false }); // Default to rejection if UI is dismissed
  },
});

async function resumeWithApproval(result: { approved: boolean }, code: string) {
  if (result.approved) {
    console.log("User approved the suggestion.");
    const createdFn = new Function(code);
    const llmCreatedFn = createdFn(); 
    try {
        await llmCreatedFn();
        chatMessages.push({role:"system",
          content: [{type:"text", 
            text: "Code executed successfully."}]});
         console.log("Code executed successfully.");
        return "Code executed successfully.";
      }
      catch (error) { 
        console.log("Error in dynamic function: " + error);
          chatMessages.push({role:"system",
            content: [{type:"text", 
              text: "Error encountered \n" + error.toString()}]});
        return "Error encountered \n" + error.toString();
      }
  }
  else {
    chatMessages.push({role:"user",
      content: [{type:"text", 
        text: "Do not run the code."}]});
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
        chatMessages = [];
      }}>Reset chat</button>
      <ApprovalTool/>
      <ApprovalToolUI/>
      {children}      
    </AssistantRuntimeProvider>
  );
}