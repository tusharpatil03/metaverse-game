import { NextFunction, Request, Response } from "express";
import { JWT_PASSWORD } from "../../global";
import jwt from "jsonwebtoken";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];
  if (!token) {
    console.log(req.url);
    res.status(403).json({ message: "user is not Authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as {
      role: string;
      id: string;
    };
    if (!decoded.id) {
      res.status(200).json("Unauthorized");
    }
    req.userId = decoded.id;
    next();
  } catch (e) {
    next(e);
  }
};
