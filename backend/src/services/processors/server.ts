import express, { Express } from "express";
import dotenv from "dotenv";
import { setupExpress } from "./expressConfig.js";
import { router } from "./router.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();
const port: number = 8000;
app.use(cookieParser());

setupExpress(app);
app.use(router);

app.listen(port, () => {
  console.log(`Server is listening at http://172.16.1.66:${port}`);
});
