import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";

interface Document {
  pageContent: string | string[];
}

export const loadAndNormalizeDocuments = async (): Promise<string[]> => {
  const loader = new DirectoryLoader("./documents", {
      ".pdf": (path: string) => new PDFLoader(path),
      ".txt": (path: string) => new TextLoader(path),
  });

  console.log("Loading docs...");
  const docs: Document[] = await loader.load();
  console.log("Docs loaded.");

  return docs.map((doc: Document) => {
      if (typeof doc.pageContent === "string") {
          return doc.pageContent;
      } else if (Array.isArray(doc.pageContent)) {
          return doc.pageContent.join("\n");
      }
      return "";
  }).filter(doc => doc !== "");
};