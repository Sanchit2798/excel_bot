"use client";
import * as React from "react";
import type { ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { respondToUserQuery } from "./taskpane";

const MyModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {
    // TODO replace with your own API
    let userMessages = messages.map((m) => ({
        role: m.role,
        content: m.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("\n"),
      }))  
    const responseFromAgent = await respondToUserQuery(userMessages[userMessages.length-1].content, abortSignal);
    console.log(abortSignal);
    // const result = await fetch("<YOUR_API_ENDPOINT>", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   // forward the messages in the chat to the API
    //   body: JSON.stringify({
    //     messages,
    //   }),
    //   // if the user hits the "cancel" button or escape keyboard key, cancel the request
    //   signal: abortSignal,
    // });
    
    const data = {text:responseFromAgent}//await result.json();
    return {
      content: [
        {
          type: "text",
          text: data.text,
        },
      ],
    };
  },
};

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const runtime = useLocalRuntime(MyModelAdapter);
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}