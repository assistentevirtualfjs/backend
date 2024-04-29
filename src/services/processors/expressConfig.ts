import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";

dotenv.config();

/* const secret = process.env.SECRET_KEY || 'secret' as string;  */

export const setupExpress = (app: Express) => {
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();

    req.on("error", (err) => {
      console.error(err);
      res.sendStatus(400);
    });
  });
};
