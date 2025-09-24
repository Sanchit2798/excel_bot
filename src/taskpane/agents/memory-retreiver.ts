import { IChunk } from './IChunk';
import * as Chunks from '../../api_documentation/api-doc-split-chunks.json';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: "AIzaSyBUQ7qNn8wc5NAdpL-j1MblLYykxwpVTns" // or pass directly as a string
});
// // Assume you have a MemoryVectorStore instance
const vectorStore = new MemoryVectorStore(embeddings);
export async function getRetriever() {
    
    // Convert Chunks to an array if it's not already
    const splittedDocs: IChunk[] = Array.isArray(Chunks) 
        ? Chunks as IChunk[] 
        : Object.values(Chunks) as IChunk[];

    // Filter out invalid docs (missing or non-string pageContent)
    const validDocs = splittedDocs.filter(
        doc => typeof doc.pageContent === 'string' && doc.pageContent.trim().length > 0
    );
    console.log('Loaded valid chunks', validDocs);
    await vectorStore.addDocuments(validDocs);
    
    // Use as retriever
    const retriever = vectorStore.asRetriever();
    // const results = await retriever.invoke("Which polymer is biodegradable?");
    // console.log(results);
    return retriever;
}

// getRetriever();

// // Serialize documents
// const serialized = vectorStore.memoryVectors.map(doc => ({
//   pageContent: doc.pageContent,
//   metadata: doc.metadata,
//   embedding: doc.embedding
// }));

// fs.writeFileSync('vector_memory.json', JSON.stringify(serialized, null, 2));

// const raw = fs.readFileSync('vector_memory.json');
// const storedDocs = JSON.parse(raw);

// // Recreate MemoryVectorStore
// const rehydratedStore = new MemoryVectorStore(embeddings);

// // Add stored documents back
// await rehydratedStore.addDocuments(storedDocs);

// // Use as retriever
// const retriever = rehydratedStore.asRetriever();
// const results = await retriever.invoke("Which polymer is biodegradable?");
// console.log(results);
