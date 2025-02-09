import { Router } from "express";
import { userMiddleware } from "../../middleware/validations/userValidation";
import { validator } from "../../middleware/validations/validateInput";
import { createSpace, getSpace, getAllSpaces, addElementToSpace, deleteElementFromSpace, deleteSpace, getAllMaps, getSpaceElements } from "../../controller/space";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema, deleteSpaceSchema } from "../../types";
import { isCreaterOfSpaceElement } from "../../middleware/validations/createrOfSpaceElement";

const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, validator(CreateSpaceSchema), createSpace);

spaceRouter.get("/all", userMiddleware, getAllSpaces);

spaceRouter.get("/:spaceId", userMiddleware, getSpace);

spaceRouter.get("/:spaceId/elements", userMiddleware, getSpaceElements)

spaceRouter.post("/delete/:spaceId", userMiddleware, deleteSpace);

spaceRouter.post("/element", userMiddleware, validator(AddElementSchema), addElementToSpace);

spaceRouter.delete("/element", userMiddleware, validator(DeleteElementSchema),isCreaterOfSpaceElement, deleteElementFromSpace);


export { spaceRouter };
