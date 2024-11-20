import { Router } from "express";
import { updateMetadata, bulk } from "../../controller/user";

const userRouter = Router();

userRouter.post("/metadata", updateMetadata);

userRouter.get("/metadata/bulk", bulk);

export { userRouter };
