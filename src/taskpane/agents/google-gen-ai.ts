import { GoogleGenAI } from "@google/genai";
import { getFromLocalStorage } from "../../addin-storage";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

export function getGoogleAi() { return new GoogleGenAI({ apiKey: getFromLocalStorage("GOOGLE_AI_API_KEY") });}

export function getGoogleLlm() { return new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: getFromLocalStorage("GOOGLE_AI_API_KEY")});
}

export function getGoogleEmbeddings() { return new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: getFromLocalStorage("GOOGLE_AI_API_KEY"),
});
}
