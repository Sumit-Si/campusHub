import { Router } from "express";
import {
  checkApiKey,
  checkRole,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { UserRolesEnum } from "../constants.js";
import { createEventValidator, updateEventValidator } from "../validators/index.js";
import { createEvent, deleteEventById, getEvents, updateEventById } from "../controllers/event.controller.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    createEventValidator(),
    validate,
    createEvent,
  )
  .get(verifyJWT, checkApiKey, getEvents);

router
  .route("/:id")
  .put(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    updateEventValidator(),
    validate,
    updateEventById,
  )
  .delete(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    deleteEventById,
  );

export default router;
