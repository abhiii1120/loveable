import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import morgan from "morgan";
import { HttpError } from "../utils/path.util.js";
import fileRoutes from "../routes/file.routes.js";
let app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(fileRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "not found",
  });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message =
    error instanceof Error ? error.message : "Internal server error";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;