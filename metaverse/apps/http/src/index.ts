import express from "express";
import { router } from "./routes/v1/";
import { ErrorHandler } from "./services/ErrorHandler";
import { Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());
app.use("/api/v1", router);

//for undefined route; * => represents all path
app.all("*", (req, res, next) => {
  next(new ErrorHandler(404, "page not found"));
});

app.use((err: ErrorHandler, req: Request, res: Response) => {
  console.log(err.message);
  let { status = 500, message = "Internal server error" } = err;
  res.status(status).json({ message });
  return;
});

app.listen(3000, () => {
  console.log(`localhost:${process.env.port || 3000}`);
});
