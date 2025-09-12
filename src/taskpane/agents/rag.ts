import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
  apiKey: "AIzaSyBUQ7qNn8wc5NAdpL-j1MblLYykxwpVTns" // or pass directly as a string
});

const main = async () => {
    console.log("RAG agent setup file");
    const newVectorStore = await FaissStore.load(
    "faiss_index", embeddings
    )
    const retriever = newVectorStore.asRetriever();
    console.log(await retriever.invoke("pivot tables"));
}

main();