import { Router } from "express";
import {
  checkApiKey,
  checkRole,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../constants.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createEnrolledValidator,
  updateEnrolledValidator,
} from "../validators/index.js";
import { createEnrollment, deleteEnrollmentById, getEnrollmentById, getEnrollments, updateEnrollmentById } from "../controllers/enrollment.controller.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT, checkApiKey, checkRole([UserRolesEnum.ADMIN]), getEnrollments)
  .post(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.STUDENT, UserRolesEnum.ADMIN]),
    createEnrolledValidator(),
    validate,
    createEnrollment,
  );

router
  .route("/:id")
  .get(verifyJWT, checkApiKey, checkRole(AvailableUserRoles), getEnrollmentById)
  .put(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    updateEnrolledValidator(),
    validate,
    updateEnrollmentById,
  )
  .delete(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.STUDENT]),
    deleteEnrollmentById,
  );

export default router;
