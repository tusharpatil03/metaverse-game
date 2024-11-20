import { Router } from "express";
import {
  createAvatar,
  createElement,
  createMap,
  updateElement,
} from "../../controller/admin";

const adminRouter = Router();

adminRouter.post("/space/element", createElement);

adminRouter.put("/space/element/:elementId", updateElement);

adminRouter.post("/avatar", createAvatar);

adminRouter.post("/map", createMap);

export { adminRouter };
