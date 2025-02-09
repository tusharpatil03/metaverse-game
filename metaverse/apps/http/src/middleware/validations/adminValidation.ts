import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../global";
import { NextFunction, Request, Response } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Not Authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as {
      role: string;
      id: string;
    };
    if (decoded.role == "Admin") {
      req.userId = decoded.id;
      next();
    } else {
      res.status(401).json({ message: "you are not autherized person" });
    }
  } catch (e) {
    next(e);
  }
  return;
};
