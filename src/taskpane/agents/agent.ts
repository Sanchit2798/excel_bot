// const GroqModule = require('@langchain/groq');
// import { VertexAIEmbeddings } from "@langchain/google-vertexai";

// import { Document } from "@langchain/core/documents"; // Uncomment if Document is used as a value
// import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
console.log("modules loaded");

export const agentComment = "I am agent";
 // Define the tools for the agent to use
// const tools = [new TavilySearch({ maxResults: 3,
//     tavilyApiKey:'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'
//  })];
// const toolNode = new ToolNode(tools);

// // Create a model and give it access to the tools
// const model = new GroqModule.ChatGroq({
//       model: "llama-3.1-8b-instant", // or any other supported model
//       temperature: 0.2,
//       apiKey:'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' // or pass directly as a string
//       }).bindTools(tools);

// // Define the function that determines whether to continue or not
// function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
//   const lastMessage = messages[messages.length - 1] as AIMessage;

//   // If the LLM makes a tool call, then we route to the "tools" node
//   if (lastMessage.tool_calls?.length) {
//     return "tools";
//   }
//   // Otherwise, we stop (reply to the user) using the special "__end__" node
//   return "__end__";
// }

// // Define the function that calls the model
// async function callModel(state: typeof MessagesAnnotation.State) {
//   const response = await model.invoke(state.messages);

//   // We return a list, because this will get added to the existing list
//   return { messages: [response] };
// }

// // Define a new graph
// const workflow = new StateGraph(MessagesAnnotation)
//   .addNode("agent", callModel)
//   .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
//   .addNode("tools", toolNode)
//   .addEdge("tools", "agent")
//   .addConditionalEdges("agent", shouldContinue);

// // Finally, we compile it into a LangChain Runnable.
// const app = workflow.compile();

// // Use the agent
// const finalState = await app.invoke({
//   messages: [new HumanMessage("what is the weather in sf")],
// });
// console.log(finalState.messages[finalState.messages.length - 1].content);

// const nextState = await app.invoke({
//   // Including the messages from the previous run gives the LLM context.
//   // This way it knows we're asking about the weather in NY
//   messages: [...finalState.messages, new HumanMessage("what about ny")],
// });
// console.log(nextState.messages[nextState.messages.length - 1].content);












// console.log(splitDocs[0]);



// const embeddings = new GoogleGenerativeAIEmbeddings({
//   model: "text-embedding-004", // 768 dimensions
//   taskType: TaskType.RETRIEVAL_DOCUMENT,
//   title: "Document title",
//   apiKey: "AIzaSyBUQ7qNn8wc5NAdpL-j1MblLYykxwpVTns",
// });




// const document1 = {
//   pageContent: "The powerhouse of the cell is the mitochondria",
//   metadata: { source: "https://example.com" }
// };

// const document2 = {
//   pageContent: "Buildings are made out of brick",
//   metadata: { source: "https://example.com" }
// };

// const document3 = {
//   pageContent: "Mitochondria are made out of lipids",
//   metadata: { source: "https://example.com" }
// };

// const document4 = {
//   pageContent: "The 2024 Olympics are in Paris",
//   metadata: { source: "https://example.com" }
// }
// const documents = [document1, document2, document3, document4];

// await vectorStore.addDocuments(documents, { ids: ["1", "2", "3", "4"] });



// const client = new ChromaClient();
// const collections = await client.listCollections()
// const collection = await client.getOrCreateCollection({
//   name: "my-collection",
//   embeddingFunction: null,
// });
// await collection.add({
//     ids: ["id1", "id2", "id3"],
//     embeddings: [[1.1, 2.3, 3.2], [4.5, 6.9, 4.4], [1.1, 2.3, 3.2]],
//     documents: ["lorem ipsum...", "doc2", "doc3"],
//     metadatas: [{"chapter": 3, "verse": 16}, {"chapter": 3, "verse": 5}, {"chapter": 29, "verse": 11}],
// });
// // collection.add({ids:docIds, documents:splitDocs});
// console.log("Chroma DB created with embedded documents");

// const loadedVectorStore = await client.getCollection({name:"my-collection"});

// const retriever = loadedVectorStore.retriever();
// const relevantDocs = await retriever.invoke("highlight text in excel");

// console.log(relevantDocs);

//  const tools = [new TavilySearch({
//   maxResults: 3,
//   apiKey: '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',
//   topic: "general",
//   // includeAnswer: false,
//   // includeRawContent: false,
//   // includeImages: false,
//   // includeImageDescriptions: false,
//   // searchDepth: "basic",
//   // timeRange: "day",
//   // includeDomains: [],
//   // excludeDomains: [],
// })];
// const toolNode = new ToolNode(tools);

// export function agentRun(userInput){
 
// }
