// Need to integrate it with excel add in. It should run the first time user installs the add in
// for development run this script from the excel_bot folder using node. Make sure the chrma db server is running, 
// running it using python.
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { docIds, splitDocsCleaned } from "./split_docs";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: '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'
});
const vectorStore = new Chroma(embeddings, {
  collectionName: "excel-api-docs"
});

for (let batch_index = 0; batch_index < docIds.length; batch_index += 1000) {
    console.log(`Adding documents ${batch_index} to ${Math.min(batch_index + 1000, docIds.length)}`);
    await vectorStore.addDocuments(splitDocsCleaned.slice(batch_index, batch_index + 1000),
        { ids: docIds.slice(batch_index, batch_index + 1000) });
    console.log('batch added');
}
// check if the retrieval is working
// const loadedVectorStore = await Chroma.fromExistingCollection(embeddings, {
//   collectionName: "excel-api-docs"
// });
// console.log("vector store loaded");
// const retriever = loadedVectorStore.asRetriever({
//   // Optional filter
//   k: 2,
// });
// const response = await retriever.invoke("Pivot tables");
// console.log(response);