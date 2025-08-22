import { Router } from "express";
import { checkApiKey, checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createAnnouncement,
  getAnnouncements,
} from "../controllers/announcement.controller.js";
import { AvailableUserRoles, UserRolesEnum } from "../constants.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createAnnounceValidator } from "../validators/index.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT,checkApiKey, checkRole(AvailableUserRoles), getAnnouncements)
  .post(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    upload.array("attachments", 3),
    createAnnounceValidator(),
    validate,
    createAnnouncement,
  );

export default router;
