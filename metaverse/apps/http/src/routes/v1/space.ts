import { Router } from "express";
import { validator } from "../../middleware/validations/validateInput";
import {
  createSpace,
  getSpace,
  getAllSpaces,
  addElementToSpace,
  deleteElementFromSpace,
  deleteSpace,
  getAllMaps,
  getSpaceElements,
} from "../../controller/space";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
  deleteSpaceSchema,
} from "../../types";
import { isCreaterOfSpaceElement } from "../../middleware/validations/createrOfSpaceElement";

const spaceRouter = Router();

spaceRouter.post("/", validator(CreateSpaceSchema), createSpace);

spaceRouter.get("/all", getAllSpaces);

spaceRouter.get("/:spaceId", getSpace);

spaceRouter.get("/:spaceId/elements", getSpaceElements);

spaceRouter.post("/delete/:spaceId", deleteSpace);

spaceRouter.post("/element", validator(AddElementSchema), addElementToSpace);

spaceRouter.delete(
  "/element",
  validator(DeleteElementSchema),
  isCreaterOfSpaceElement,
  deleteElementFromSpace,
);

export { spaceRouter };
