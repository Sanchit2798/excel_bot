import * as fs from "fs/promises";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { IChunk } from "./ichunk";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

// Save to JSON
async function saveChunksToFile(data: IChunk[], filePath: string) {
  const json = JSON.stringify(data, null, 2); // Pretty print
  await fs.writeFile(filePath, json, "utf-8");
  console.log("✅ Chunks saved to JSON.");
}

async function splitDocs(){
  const apiDocumentationPath = "./src/api_documentation/doc/";
  /* Load all PDFs within the specified directory */
  const directoryLoader = new DirectoryLoader(apiDocumentationPath, {
    ".pdf": (path) => new PDFLoader(path),
  });
  const directoryDocs = await directoryLoader.load();
  console.log('sample doc', directoryDocs[0]);
  // split the documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splittedDocs = await textSplitter.splitDocuments(directoryDocs);
  //only keep pageContent and metadata
  const splitDocsCleaned = splittedDocs.map(doc => ({
    pageContent: doc.pageContent, metadata: {
      source: `excel javascript documentation 
                                                  from microsofts side : 
                                                  https://learn.microsoft.com/en-us/office/dev/add-ins/reference/overview/excel-add-ins-reference-overview` }
  }));

  // File path
  const filePath = "./src/api_documentation/api-doc-split-chunks.json";
  await saveChunksToFile(splitDocsCleaned, filePath);
}

splitDocs();
