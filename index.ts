import express from "express";
import { router } from "./src/services/processors/router.js"

const app = express();
const port = 3000;

app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
