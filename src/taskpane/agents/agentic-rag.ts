import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { Annotation, StateGraph, START, END } from "@langchain/langgraph/web";
import { createRetrieverTool } from "langchain/tools/retriever";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
// import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
const groqModule = require('@langchain/groq');
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { IChunk } from './ichunk';
import * as Chunks from '../../api_documentation/api-doc-split-chunks.json';
// import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";

// export const AgenticRAG = "HI am agent";
const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  })
})

const getRetriever = async () => {
    const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    apiKey: "AIzaSyBUQ7qNn8wc5NAdpL-j1MblLYykxwpVTns" // or pass directly as a string
    });
  
    // Convert Chunks to an array if it's not already
    const splittedDocs: IChunk[] = Array.isArray(Chunks) 
        ? Chunks as IChunk[] 
        : Object.values(Chunks) as IChunk[];
    // Filter out invalid docs (missing or non-string pageContent)
    const validDocs = splittedDocs.filter(
        doc => typeof doc.pageContent === 'string' && doc.pageContent.trim().length > 0
    );
    const vectorStore = new MemoryVectorStore(embeddings); //await HNSWLib.fromDocuments([], embeddings);
    await vectorStore.addDocuments(validDocs);
    let retriever = vectorStore.asRetriever();
    
    // Save the vector store to a directory
    // const HNSWLib = await import('@langchain/community/vectorstores/hnswlib');
    // const directory = "../../api_documentation/";
    // await vectorStore.save(directory);

    // Load the vector store from the same directory
    // const loadedVectorStore = await HNSWLib.load(directory, embeddings);
    // let retriever = loadedVectorStore.asRetriever();
    const tool = createRetrieverTool(
    retriever,
    {
    name: "retrieve_excel_docs",
    description:
        "Search and return information about javascript excel api. Use this to find relevant documents to answer the users question",
    },
    );
    return tool;
};

let toolNode: ToolNode<typeof GraphState.State>;
let tools: any[] = [];

async function initializeTools() {
  const tool = await getRetriever();
  tools = [tool];
  toolNode = new ToolNode<typeof GraphState.State>(tools);
}

/**
 * Decides whether the agent should retrieve more information or end the process.
 * This function checks the last message in the state for a function call. If a tool call is
 * present, the process continues to retrieve information. Otherwise, it ends the process.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {string} - A decision to either "continue" the retrieval process or "end" it.
 */
function shouldRetrieve(state: typeof GraphState.State):string {
  const { messages } = state;
  console.log("---DECIDE TO RETRIEVE---");
  const lastMessage = messages[messages.length - 1];

  if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length) {
    console.log("---DECISION: RETRIEVE---");
    return "retrieve";
  }
  // If there are no tool calls then we finish.
  return END;
    //  console.log(state);
    //  return "Done";
}

/**
 * Determines whether the Agent should continue based on the relevance of retrieved documents.
 * This function checks if the last message in the conversation is of type FunctionMessage, indicating
 * that document retrieval has been performed. It then evaluates the relevance of these documents to the user's
 * initial question using a predefined model and output parser. If the documents are relevant, the conversation
 * is considered complete. Otherwise, the retrieval process is continued.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */
async function gradeDocuments(state: typeof GraphState.State){
  console.log("---GET RELEVANCE---");

  const { messages } = state;
  const tool = {
    name: "give_relevance_score",
    description: "Give a relevance score to the retrieved documents.",
    schema: z.object({
      binaryScore: z.string().describe("Relevance score 'yes' or 'no'"),
    })
  }

  const ResponseFormatter = z.object({
    binaryScore: z.string().describe("Relevance score 'yes' or 'no'")
  })

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a grader assessing relevance of retrieved docs to a user question.
  Here are the retrieved docs:
  \n ------- \n
  {context} 
  \n ------- \n
  Here is the user question: {question}
  If the content of the docs are relevant to the users question, score them as relevant.
  Give a binary score 'yes' or 'no' score to indicate whether the docs are relevant to the question.
  Yes: The docs are relevant to the question.
  No: The docs are not relevant to the question.`,
  );

  const model =  new groqModule.ChatGroq({
    model: "llama-3.1-8b-instant", // or any other supported model
    temperature: 0.2,
    apiKey:'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'
  }).withStructuredOutput(ResponseFormatter);
  //.bindTools([tool]);

  const chain = prompt.pipe(model);

  const lastMessage = messages[messages.length - 1];

  const score = await chain.invoke({
    question: messages[0].content as string,
    context: lastMessage.content as string,
  });

  return {
    messages: [score]
  };
}

/**
 * Check the relevance of the previous LLM tool call.
 *
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {string} - A directive to either "yes" or "no" based on the relevance of the documents.
 */
function checkRelevance(state: typeof GraphState.State): string {
  console.log("---CHECK RELEVANCE---");

  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  // if (!("tool_calls" in lastMessage)) {
  //   throw new Error("The 'checkRelevance' node requires the most recent message to contain tool calls.")
  // }
  // const toolCalls = (lastMessage as AIMessage).tool_calls;
  // if (!toolCalls || !toolCalls.length) {
  //   throw new Error("Last message was not a function message");
  // }

  // Safely extract binaryScore from lastMessage.content if it exists
  let score = (lastMessage as { binaryScore?: string }).binaryScore;

  if (score === "yes"){ //toolCalls[0].args.binaryScore === "yes") {
  console.log("---DECISION: DOCS RELEVANT---");
  return "yes";
  }
  console.log("---DECISION: DOCS NOT RELEVANT---");
  return "no";
}

// Nodes

/**
 * Invokes the agent model to generate a response based on the current state.
 * This function calls the agent model to generate a response to the current conversation state.
 * The response is added to the state's messages.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */
async function agent(state: typeof GraphState.State){
  console.log("---CALL AGENT---");

  const { messages } = state;
  // Find the AIMessage which contains the `give_relevance_score` tool call,
  // and remove it if it exists. This is because the agent does not need to know
  // the relevance score.
  const filteredMessages = messages.filter((message) => {
    // if ("tool_calls" in message && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
    //   return message.tool_calls[0].name !== "give_relevance_score";
    // }
    if ("binaryScore" in message) {
      return false;
    }
    return true;
  });
// //   const model = new ChatOpenAI({
// //     model: "gpt-4o",
// //     temperature: 0,
// //     streaming: true,
// //     apiKey: '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'
// //   }).bindTools(tools);
  const model = new groqModule.ChatGroq({
    model: "llama-3.1-8b-instant", // or any other supported model
    temperature: 0.2,
    apiKey:'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',
    streaming: true,
  }).bindTools(tools);

  const response = await model.invoke(filteredMessages);
  return {
    messages: [response],
  };
}

/**
 * Transform the query to produce a better question.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */
async function rewrite(state: typeof GraphState.State) {
  console.log("---TRANSFORM QUERY---");

  const { messages } = state;
  const question = messages[0].content as string;
  const prompt = ChatPromptTemplate.fromTemplate(
    `Look at the input and try to reason about the underlying semantic intent / meaning. \n 
Here is the initial question:
\n ------- \n
{question} 
\n ------- \n
Formulate an improved question:`,
  );

  // Grader
  const model = new groqModule.ChatGroq({
    model: "llama-3.1-8b-instant", // or any other supported model
    temperature: 0.2,
    apiKey:'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'
  });
  const response = await prompt.pipe(model).invoke({ question });
  return {
    messages: [response],
  };
}

/**
 * Generate answer
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */
async function generate(state: typeof GraphState.State) {
  console.log("---GENERATE---");

  const { messages } = state;
  const question = messages[0].content as string;
  // Extract the most recent ToolMessage
  const lastToolMessage = messages.slice().reverse().find((msg) => ('getType' in msg) && (msg.getType() === "tool"));
  if (!lastToolMessage) {
    throw new Error("No tool message found in the conversation history");
  }

  const docs = lastToolMessage.content as string;

  const prompt = ChatPromptTemplate.fromTemplate(
  `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. \n 
  If you don't know the answer, just say that you don't know. \n 
  Use three sentences maximum and keep the answer concise.\n 
    Question: {question}
    Context: {context}
    Answer:`);

  const llm = new groqModule.ChatGroq({
    model: "llama-3.1-8b-instant", // or any other supported model
    temperature: 0.2,
    apiKey:'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'
  });

  const ragChain = prompt.pipe(llm);

  const response = await ragChain.invoke({
    context: docs,
    question,
  });

  return {
    messages: [response],
  };
}

// Define the graph
function createWorkflow() {
  const workflow = new StateGraph(GraphState)
    .addNode("agent", agent)
    .addNode("retrieve", toolNode)
    .addNode("gradeDocuments", gradeDocuments)
    .addNode("rewrite", rewrite)
    .addNode("generate", generate);

  workflow.addEdge(START, "agent");
  workflow.addConditionalEdges("agent", shouldRetrieve);
  workflow.addEdge("retrieve", "gradeDocuments");
  workflow.addConditionalEdges("gradeDocuments", checkRelevance, {
    yes: "generate",
    no: "rewrite",
  });
  workflow.addEdge("generate", END);
  workflow.addEdge("rewrite", "agent");

  return workflow;
}

// Compile
export class AgenticRAG {
  app: any;
  initialised=false;
  constructor() {
    // app will be initialized after tools are ready
  }

  public async init() {
    await initializeTools();
    const workflow = createWorkflow();
    this.app = workflow.compile();
    this.initialised = true;
  }

  public async run(
    humanInput: string
  ) {
    if (!this.app) {
      throw new Error("AgenticRAG not initialized. Call init() before run().");
    }
    const finalState = await this.app.invoke({
      messages: [new HumanMessage(humanInput)],
    });
    return finalState.messages[finalState.messages.length - 1].content;
  }
}

export const agenticRAG = new AgenticRAG();
// agenticRAG.init().then(() => {agenticRAG.run("How to create pivot table using javascript excel api?").then(response => {
//     console.log("Final response:", response);
// })});

// END..............................................................................................

// const app = workflow.compile();

// const inputs = {
//   messages: [
//     new HumanMessage(
//       "How to create pivot table using javascript excel api?",
//     ),
//   ],
// };
// let finalState;
// for await (const output of await app.stream(inputs)) {
//   for (const [key, value] of Object.entries(output)) {
//     const lastMsg = output[key].messages[output[key].messages.length - 1];
//     console.log(`Output from node: '${key}'`);
//     console.dir({
//       type: lastMsg._getType(),
//       content: lastMsg.content,
//       tool_calls: lastMsg.tool_calls,
//     }, { depth: null });
//     console.log("---\n");
//     finalState = value;
//   }
// }

// console.log(JSON.stringify(finalState, null, 2));