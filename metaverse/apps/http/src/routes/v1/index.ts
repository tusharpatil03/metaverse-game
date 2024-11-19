import { Router } from "express";

const router = Router();

router.get("/signup", (req, res)=> {
    res.json({
        "message": "signup responce"
    })
});

router.get("/signin", (req, res)=> {
    res.json({
        "message": "signin responce"
    })
});

export {router};