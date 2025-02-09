import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";

import { userMiddleware } from "../../middleware/validations/userValidation";
import { adminMiddleware } from "../../middleware/validations/adminValidation";
import { validator } from "../../middleware/validations/validateInput";
import { SigninSchema, SignupSchema } from "../../types";

import { getAllUsers, getAvatars, getUser, userSignin, userSignup } from "../../controller/user";
import { getAllElements } from "../../controller/space";

const router = Router();

router.post("/signup", validator(SignupSchema), userSignup);

router.get("/getuser/:id", getUser);

router.post("/signin", validator(SigninSchema), userSignin);

router.get("/getAllUser", getAllUsers);

router.get("/avatars", getAvatars);

router.get("/element/all", getAllElements)

router.use("/user/", userMiddleware, userRouter);
router.use("/space/", spaceRouter);
router.use("/admin", adminMiddleware, adminRouter);

export { router };
