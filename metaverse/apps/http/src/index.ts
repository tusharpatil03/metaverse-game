import express from "express";
import { router } from "./routes/v1/";
import { ErrorHandler } from "./services/ErrorHandler";
import { Request, Response, NextFunction } from "express";
import cors from "cors";

const app = express();

// CORS should be registered BEFORE any routes
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

const corsoptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};

app.use(cors(corsoptions));
// Explicitly handle preflight requests for all routes
app.options("*", cors(corsoptions));

app.use(express.json());

// API routes
app.use("/api/v1", router);

// Centralized error handler (must have 4 args)
app.use((err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  console.log(err.message);
  let { status = 500, message = "Internal server error" } = err;
  res.status(status).json({ message });
  return;
});

app.listen(3000, () => {
  console.log(`localhost:${process.env.port || 3000}`);
});
