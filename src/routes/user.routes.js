import { Router } from "express";
import {
    generateApiKey,
  loginUser,
  profile,
  registerUser,
} from "../controllers/user.controller.js";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    upload.single("image"),
    userRegisterValidator(),
    validate,
    registerUser,
  );

router
    .route("/login")
    .post(userLoginValidator(), validate, loginUser);

router
    .route("/api-key")
    .get(verifyJWT, generateApiKey);

router
    .route("/me")
    .get(verifyJWT, profile);

export default router;
