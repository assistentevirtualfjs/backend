import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs";

const VECTOR_STORE_PATH = "Documents.index";

export const setupVectorStore = async (docs: string[]): Promise<HNSWLib> => {
    let vectorStore: HNSWLib;

    console.log("Checking for existing vector store...");
    if (fs.existsSync(VECTOR_STORE_PATH)) {
        console.log("Loading existing vector store...");
        vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
        console.log("Vector store loaded.");
    } else {
        console.log("Creating new vector store...");
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
        const splitDocs = await textSplitter.createDocuments(docs);

        vectorStore = await HNSWLib.fromDocuments(splitDocs, new OpenAIEmbeddings());
        await vectorStore.save(VECTOR_STORE_PATH);

        console.log("Vector store created.");
    }

    return vectorStore;
};
