import {Router} from "express"
import { checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../constants.js";
import { addMaterialsByCourseId, createCourse, getCourses, getMaterialsByCourseId } from "../controllers/course.controller.js";

const router = Router();

router
    .route("/")
    .get(verifyJWT,checkRole(AvailableUserRoles),getCourses)
    .post(verifyJWT,checkRole([UserRolesEnum.ADMIN]),createCourse);

router
    .route("/:courseId/materials")
    .get(verifyJWT,checkRole([UserRolesEnum.FACULTY,UserRolesEnum.STUDENT]),getMaterialsByCourseId)
    .post(verifyJWT,checkRole([UserRolesEnum.FACULTY]), addMaterialsByCourseId);

export default router;