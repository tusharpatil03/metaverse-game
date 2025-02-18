import { Request, Response, NextFunction, response } from "express";
import { UserServices } from "../services/userServices";
import { ErrorHandler } from "../services/ErrorHandler";

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existingUser = await UserServices.getUserByUsername(
      req.body.username,
    );
    if (existingUser) {
      throw new ErrorHandler(400, "User already Exist");
    }
    const user = await UserServices.createUser(req.body);
    if (!user) {
      throw new ErrorHandler(400, "can not create user");
    }
    res.status(200).json({
      userId: user.id,
    });
    return;
  } catch (e) {
    next(e);
  }
};

export const userSignin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = await UserServices.getUserToken(req.body);
    if (!token) {
      throw new ErrorHandler(400, "Unable to create user token");
    }
    res.status(200).json({
      token: token,
    });
  } catch (e) {
    next(e);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id;
  const user = await UserServices.getUserById(id);
  if (user == null || user == undefined) {
    res.json({
      message: "user not exist",
    });
    return;
  }
  res.json(user);
  return;
};

export const updateMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    res.status(401).json({ message: "Unautherized" });
    return;
  }

  try {
    const result = await UserServices.updateMetadata(
      req.userId,
      req.body.avatarId,
    );
    if (!result) {
      res.status(400).json({ message: "Unable to update metadata" });
    }
    res.status(200).json({ message: "metadata updated successfuly" });
    return;
  } catch (e) {
    res.status(400).json({ message: "Unautherized" });
    return;
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await UserServices.findAllUsers();
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ message: "Server Error ", error: e });
  }
  return;
};

export const getMetadataOfAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userIdString = (req.query.ids ?? "[]") as string;
    const userIds = userIdString.slice(1, userIdString?.length - 1).split(",");
    const metadata = await UserServices.getMatadataOfAllUsers(userIds);
    res.status(200).json(metadata);
  } catch (e) {
    next(e);
  }
};

export const getAvatars = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const avatars = await UserServices.getAllAvatars();
    if (!avatars) {
      res.status(400).json({ message: "unable to fin avatars" });
    }
    res.status(200).json(avatars);
  } catch (e) {
    next(e);
  }
};
