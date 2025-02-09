import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../services/ErrorHandler";
import { Schema } from "zod";

export const validator = (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
  const parsedData = schema.safeParse(req.body);
  if (req.body.spaceId) {
    console.log({ ...parsedData });
  }
  if (!parsedData.success) {
    throw new ErrorHandler(400, "Input validation failed");
  }
  next();
};
