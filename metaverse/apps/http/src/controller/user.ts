import { Request, Response, NextFunction } from "express";

export const updateMetadata = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userid = req.params.id;
};

export const bulk = (req: Request, res: Response, next: NextFunction) => {
  res.json();
};
