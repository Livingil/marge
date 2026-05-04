import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { router } from "./routes/index.js";
import { connectDatabase } from "./services/database.service.js";

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/marge";

const start = async (): Promise<void> => {
  await connectDatabase(mongoUri);

  const app = express();
  app.use(express.json());
  app.use(router);

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = error instanceof Error ? 400 : 500;
    res.status(status).json({ message });
  });

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
};

start().catch((error: unknown) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
