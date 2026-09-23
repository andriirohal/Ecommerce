import type { Request, Response } from "express";

import cors from "cors";
import express from "express";

import { uniqueHandler, errorHandler } from "./middlewares";
import { commerceRouter, checkoutRouter } from "./routes";

export const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://understory-mu.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

app.use("/", commerceRouter);
app.use("/", checkoutRouter);

app.get("/", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

app.use(uniqueHandler, errorHandler);