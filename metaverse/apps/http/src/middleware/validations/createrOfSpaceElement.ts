import { NextFunction, Request, Response } from "express";
import { SpaceServices } from "../../services/spaceServices";

export const isCreaterOfSpaceElement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.body.spaceId;
  const spaceElement = await SpaceServices.getSpaceElements(id);
  if (
    !spaceElement?.space.creatorId ||
    spaceElement.space.creatorId != req.userId
  ) {
    res.status(200).json("Unauthorized");
    return;
  }
  req.body.creator = true;

  next();
};
