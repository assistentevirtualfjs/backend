
import { OpenAIEmbeddingFunction } from "chromadb";
import { ChromaClient } from "chromadb";


const client = new ChromaClient({
  path: "http://localhost:8000",
});


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
