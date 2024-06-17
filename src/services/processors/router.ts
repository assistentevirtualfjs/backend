import { Request, Response, Router } from "express";
import { loadAndNormalizeDocuments, setupVectorStore } from "./vectorStore.js";

import now from "performance-now";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Chat } from "openai/resources/index.mjs";
import { ChatOpenAI } from "@langchain/openai";

let totalInteractions = 0;
let resolvedInteractions = 0;
let totalTimeSpent = 0;

export const router = Router();



router.post("/", async (request: Request, response: Response) => {
    const { chats } = request.body;

    const startTime = now();



    // Load and normalize documents
    const normalizedDocs = await loadAndNormalizeDocuments();
  
    // Set up vector store with embeddings
    const embeddingsVector = await setupVectorStore(normalizedDocs);
  
   
    // Initialize ChatOpenAI model
    const model = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY as string, model: "gpt-3.5-turbo" });
  
    // Create a prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`Answer the user's question: {chats}`);
  
    // Combine the prompt and model into a chain
    const chain = prompt.chain(model);

  
  
    console.log("Querying chain...");
    const result = await chain.call({ query: chats });

    // metricas
    const endTime = now();
    const elapsedTime = Number(endTime) - Number(startTime);

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
