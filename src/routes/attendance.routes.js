import { Router } from "express";
import {
  checkApiKey,
  checkRole,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../constants.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createAttendance, deleteAttendanceById, getAttendanceByCourseId, getAttendanceByCourseIdAndSessionDate, getAttendanceByUserId, updateAttendanceById } from "../controllers/attendance.controller.js";
import { createAttendanceValidator, updateAttendanceByIdValidator } from "../validators/index.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    createAttendanceValidator(),
    validate,
    createAttendance,
  );

router
  .route("/:id")
  .put(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    updateAttendanceByIdValidator(),
    validate,
    updateAttendanceById,
  )
  .delete(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN]),
    deleteAttendanceById,
  );

router
  .route("/user/:userId")
  .get(
    verifyJWT,
    checkApiKey,
    checkRole(AvailableUserRoles),
    getAttendanceByUserId,
  );

router
  .route("/course/:courseId")
  .get(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    getAttendanceByCourseId,
  );

router
  .route("/course/:courseId/session/:sessionDate")
  .get(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.ADMIN, UserRolesEnum.FACULTY]),
    getAttendanceByCourseIdAndSessionDate,
  );

export default router;
