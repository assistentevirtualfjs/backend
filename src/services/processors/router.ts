import { Request, Response, Router } from "express";
import { setupVectorStore } from "./vectorStore";
import { loadAndNormalizeDocuments } from "./documentLoader";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";

import now from "performance-now";

let totalInteractions = 0;
let resolvedInteractions = 0;
let totalTimeSpent = 0;

export const router = Router();

router.post("/", async (request: Request, response: Response) => {
    const { chats } = request.body;

    const startTime = now();

    const normalizedDocs = await loadAndNormalizeDocuments();
    const vectorStore = await setupVectorStore(normalizedDocs);

    const openai = new OpenAI({
      configuration: {
        apiKey: process.env.OPENAI_API_KEY || "",
      },
    });

    const chain = RetrievalQAChain.fromLLM(openai, vectorStore.asRetriever());

    console.log("Querying chain...");
    const result = await chain.call({ query: chats });

    // metricas
    const endTime = now();
    const elapsedTime = endTime - startTime;

    totalInteractions++;
    totalTimeSpent += elapsedTime;

    if (result) {
      resolvedInteractions++;
    }

    logMetrics();

    response.json({ output: result });
  }
);

// Função para registrar métricas
function logMetrics() {
  console.log(`Total Interactions: ${totalInteractions}`);
  console.log(`Resolved Interactions: ${resolvedInteractions}`);
  console.log(`Total Time Spent: ${totalTimeSpent} ms`);
}
