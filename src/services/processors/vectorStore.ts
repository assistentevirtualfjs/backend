import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "langchain/document";

interface IDocument {
  pageContent: string | string[];
}

export const loadAndNormalizeDocuments = async (): Promise<string[]> => {
  const loader = new DirectoryLoader("./documents", {
    ".pdf": (path: string) => new PDFLoader(path),
    ".txt": (path: string) => new TextLoader(path),
  });

  console.log("Loading docs...");
  const docs: IDocument[] = await loader.load();
  console.log("Docs loaded.");

  return docs
    .map((doc: IDocument) => {
      if (typeof doc.pageContent === "string") {
        return doc.pageContent;
      } else if (Array.isArray(doc.pageContent)) {
        return doc.pageContent.join("\n");
      }
      return "";
    })
    .filter((doc) => doc !== "");
};

export const setupVectorStore = async (docs: string[]): Promise<Chroma> => {
  const joinedText = docs.join("\n\n");

  console.log("Checking for existing vector store...");

  const textSplitter = new RecursiveCharacterTextSplitter({
    separators: ["\n\n", "\n", ".", "!", "?", ";", " ", ""],
    chunkSize: 10000,
    chunkOverlap: 200,
  });

  const chunks = await textSplitter.splitText(joinedText);

  const splitDocs = chunks.map((chunk) => new Document({ pageContent: chunk }));
  console.log("Vector store created.");

  const ChromaVectorStore = await Chroma.fromDocuments(
    splitDocs,
    new OpenAIEmbeddings(),
    {
      url: "http://localhost:8000",
    }
  );
  console.log("Vectorized and stored documents:", ChromaVectorStore);

  return ChromaVectorStore;
};
