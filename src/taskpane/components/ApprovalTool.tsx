"use client";
import { makeAssistantTool, makeAssistantToolUI, tool } from "@assistant-ui/react";
import * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { resumeWithApproval } from "./MyRuntimeProvider";


export const approvalTool = tool({
  description: "Ask the user to approve or reject the suggestion",
  parameters: z.object({
    code: z.string()
  }),
  async execute({ code }) {
    return {
      content: [
        {
          type: "tool-ui",
          toolName: "approvalToolUI",
          args: { code: code},
          argsText: "code"
        },
      ],
    };
  },
});export const ApprovalTool = makeAssistantTool({
  ...approvalTool,
  toolName: "approvalTool",
});

export const ApprovalToolUI = makeAssistantToolUI<
  { message: string; },
  { approved: boolean; }
>({
  toolName: "approvalTool",
  render: ({ args }) => {
    const [response, setResponse] = useState<string | null>(null);
    const [runMyCodeButtonText, setrunMyCodeButtonText] = useState<string | null>("Run code");
    const handleApproval = async (approved: boolean) => {
      const result = await resumeWithApproval(
        { approved: approved},
        args.code as string
      );
      setResponse(result.response);
      setrunMyCodeButtonText(result.codeButtonText);
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
            Execute
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
            {runMyCodeButtonText}
          </button>
        </div>

        {/* Display the response below */}
        {response && (
          <div style={{ marginTop: "1rem", background: "#f9f9f9", padding: "1rem", borderRadius: "6px" }}>
            <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}><strong>{response}</strong></pre>
          </div>
        )}
      </div>
    );
  },
});

