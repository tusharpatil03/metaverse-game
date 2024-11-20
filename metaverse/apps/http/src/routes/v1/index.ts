import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";

const router = Router();

router.post("/signup", (req, res) => {
  res.json({
    message: "signup responce",
  });
});

router.post("/signin", (req, res) => {
  res.json({
    message: "signin responce",
  });
});

router.get("/avatar", (req, res) => {
  res.json({
    message: " responce",
  });
});

router.get("/elements", (req, res) => {
  res.json({
    message: " responce",
  });
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);

export { router };
