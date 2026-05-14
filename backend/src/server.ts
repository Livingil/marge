import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { router } from "./routes/index.js";
import { connectDatabase } from "./services/database.service.js";

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/marge";
const clientOrigins = (process.env.CLIENT_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const start = async (): Promise<void> => {
  await connectDatabase(mongoUri);

  const app = express();
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin is not allowed"));
      },
      methods: ["GET", "POST", "PATCH"],
      credentials: false
    })
  );
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
