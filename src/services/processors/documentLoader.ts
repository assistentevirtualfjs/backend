
import { OpenAIEmbeddingFunction } from "chromadb";
import { ChromaClient } from "chromadb";

/* interface Document {
  pageContent: string | string[];
} */

const client = new ChromaClient({
  path: "http://localhost:9000",
});

/* export const loadAndNormalizeDocuments = async (): Promise<string[]> => {
  const loader = new DirectoryLoader("./documents", {
    ".pdf": (path: string) => new PDFLoader(path),
    ".txt": (path: string) => new TextLoader(path),
  });

  console.log("Loading docs...");
  const docs: Document[] = await loader.load();
  console.log("Docs loaded.");

  return docs
    .map((doc: Document) => {
      if (typeof doc.pageContent === "string") {
        return doc.pageContent;
      } else if (Array.isArray(doc.pageContent)) {
        return doc.pageContent.join("\n");
      }
      return "";
    })
    .filter((doc) => doc !== "");
}; */

export const similarVectorStore = async (
  normalizedDocs: string[],
  userQuery: string
) => {
  const collection = await client.getOrCreateCollection({
    name: "langchain",
    embeddingFunction: new OpenAIEmbeddingFunction({
      openai_api_key: process.env.OPENAI_API_KEY as string,
    }),
  });

  /* adicionar cada documento individualmente ao banco de dados vetorial*/

  for (const doc of normalizedDocs) {
    await collection.add({
      documents: [doc],
      ids: [
        Math.random()
          .toString(36)
          .substring(7),
      ],
    });
  }

  const results = await collection.query({
    queryTexts: [userQuery],
    nResults: 10,
  });

  // Retornar os chunks como uma lista de strings
  return results["documents"][0];
};
