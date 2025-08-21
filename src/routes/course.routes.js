import { Router } from "express";
import { checkApiKey, checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../constants.js";
import {upload} from "../middlewares/multer.middleware.js";
import {
  addMaterialsByCourseId,
  createCourse,
  getCourses,
  getMaterialsByCourseId,
} from "../controllers/course.controller.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT,checkApiKey, checkRole(AvailableUserRoles), getCourses)
  .post(verifyJWT,checkApiKey, checkRole([UserRolesEnum.ADMIN]), createCourse);

router
  .route("/:courseId/materials")
  .get(
    verifyJWT,
    checkApiKey,
    checkRole([UserRolesEnum.FACULTY, UserRolesEnum.STUDENT]),
    getMaterialsByCourseId,
  )
  .post(verifyJWT,checkApiKey, checkRole([UserRolesEnum.FACULTY]),upload.array("uploadFiles",3), addMaterialsByCourseId);

export default router;
