import { Router } from "express";
import {
  addSpace,
  getSpace,
  getAllSpaces,
  addElement,
  deleteElement,
} from "../../controller/space";

const spaceRouter = Router();

spaceRouter.get("/space/all", getAllSpaces);

spaceRouter.post("/space", addSpace);

spaceRouter.get("/space/:spaceId", getSpace);

spaceRouter.delete("/space/:spaceId", getSpace);

spaceRouter.post("/space/element", addElement);

spaceRouter.delete("/space/element/:elementId", deleteElement);

export { spaceRouter };
