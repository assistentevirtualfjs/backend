import express, { Express } from "express";
import dotenv from "dotenv";
import { setupExpress } from "./expressConfig";
import { router } from "./router";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();
const port: number = 8000;
app.use(cookieParser());

setupExpress(app);
app.use(router);

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
