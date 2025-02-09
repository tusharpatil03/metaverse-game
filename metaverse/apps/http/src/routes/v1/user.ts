import { Router } from "express";
import { getMetadataOfAllUsers, updateMetadata } from "../../controller/user";
import { userMiddleware } from "../../middleware/validations/userValidation";

const userRouter = Router();

userRouter.put("/metadata", updateMetadata);

userRouter.get("/metadata/bulk", getMetadataOfAllUsers);

export { userRouter };
