import { Router } from "express";
import {
  checkApiKey,
  checkRole,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { UserRolesEnum } from "../constants.js";
import { deleteNotificationById, getAllNotifications, updateNotificationById } from "../controllers/notification.controller.js";

const router = Router();

router.route("/").get(verifyJWT, checkApiKey, getAllNotifications);

router
  .route("/:id/read")
  .put(
    verifyJWT,
    checkApiKey,
    updateNotificationById,
  );

router
  .route("/:id/delete")
  .delete(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN]),
    deleteNotificationById,
  );

export default router;
