import { Router } from "express";
import { createAvatar, createElement, createMap, deleteAvatar, deleteElement, deleteMap, updateElement } from "../../controller/admin";
import { getAllMaps } from "../../controller/space";
import { validator } from "../../middleware/validations/validateInput";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types";

const adminRouter = Router();

adminRouter.post("/element", validator(CreateElementSchema), createElement);

adminRouter.put("/element/:elementId", validator(UpdateElementSchema), updateElement);

adminRouter.post("/avatar", validator(CreateAvatarSchema), createAvatar);

adminRouter.post("/map", validator(CreateMapSchema), createMap);

adminRouter.get("/map/all", getAllMaps);

adminRouter.delete("/map/:mapId", deleteMap);

adminRouter.delete("/avatar/:avatarId", deleteAvatar);

adminRouter.delete("/element/:elementId", deleteElement);

export { adminRouter };
