import { Request, Response, Router } from 'express';
import { setupVectorStore } from "./vectorStore";
import { loadAndNormalizeDocuments } from "./documentLoader";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";

import now from "performance-now";
import fs from "fs";

let contadorDeConsultas = 0;

try {
    const contadorString = fs.readFileSync('contador.txt', 'utf-8');
  
    contadorDeConsultas = parseInt(contadorString, 10);
  
  } catch (err) {
  
    contadorDeConsultas = 0;
      
}

const addConsultaAoHistorico = (consulta: string, resposta: string) => {
  const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const logEntry = `${timestamp} - Consulta: ${consulta}\nResposta: ${resposta}\n\n`;    

  fs.appendFile("consultas.log", logEntry, (err) => {

    if (err) console.error("Erro ao adicionar consulta ao histórico:", err);      

  });

  contadorDeConsultas++;

  fs.writeFileSync('contador.txt', contadorDeConsultas.toString());
};


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
      modelName: "gpt-4",
      temperature: 0.7,
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

    const resposta = result?.text?.toString() || "Nenhuma resposta encontrada.";

    addConsultaAoHistorico(chats, resposta);
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
