import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

const apiDocumentationPath = "api_documentation/";
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
export const splitDocs = await textSplitter.splitDocuments(directoryDocs);
//only keep pageContent and metadata
export const splitDocsCleaned = splitDocs.map(doc => ({
  pageContent: doc.pageContent, metadata: {
    source: `excel javascript documentation 
                                                from microsofts side : 
                                                https://learn.microsoft.com/en-us/office/dev/add-ins/reference/overview/excel-add-ins-reference-overview` }
}));
export const docIds = splitDocs.map((doc, index) => `${index}`);
