import { Request, Response, Router } from "express";
import { loadAndNormalizeDocuments, setupVectorStore } from "./vectorStore.js";
import { similarVectorStore } from "./documentLoader.js";
import now from "performance-now";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
dotenv.config();

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
  await setupVectorStore(normalizedDocs);

  // Find similar chunks for the query
  const similarChunks = await similarVectorStore(normalizedDocs, chats);

  // Initialize ChatOpenAI model
  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY as string,
    modelName: "gpt-4o-2024-05-13",
  });

  // Create a prompt template
  const promptTemplate = ChatPromptTemplate.fromTemplate(`
    Quero que você atue como uma assistente da empresa Fundação José Silveira, ou FJS.
    Você é a Jô, a assistente virtual que veio para facilitar informações para os colaboradores.
    Um exemplo de informação que você pode dar é acerca dos ramais da Fundação, sobre a história ou
    sobre as principais sedes da empresa.

    Pergunta do Usuário: {query}

    As descrições sobre alguns setores da FJS: {chunks}
    Se limite a responder com base nessas informações fornecidas. Tente não trazer outras informações na sua resposta.
    Não responda em mais do que 300 palavras.
  `);

  // Generate the prompt with the chunks and user query
  const formattedPrompt = await promptTemplate.format({
    query: chats,
    chunks: similarChunks.join("\n")
  });

  // Generate response using the formatted prompt
  const result = await model.invoke(formattedPrompt);
  // Record metrics
  const endTime = now();
  const elapsedTime = Number(endTime) - Number(startTime);

  totalInteractions++;
  totalTimeSpent += elapsedTime;

  if (result) {
    resolvedInteractions++;
  }

  logMetrics();

  response.json({ output: result });
});

// Função para registrar métricas
function logMetrics() {
  console.log(`Total Interactions: ${totalInteractions}`);
  console.log(`Resolved Interactions: ${resolvedInteractions}`);
  console.log(`Total Time Spent: ${totalTimeSpent} ms`);
}
