import { Router } from "express";
import { checkApiKey, checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../constants.js";
import { createResultsValidator } from "../validators/index.js";
import {validate} from "../middlewares/validator.middleware.js"
import { checkResults, createResults } from "../controllers/result.controller.js";

const router = Router();

router
    .route("/")
    .post(verifyJWT,checkApiKey,checkRole([UserRolesEnum.ADMIN]),createResultsValidator(),validate,createResults)

router
    .route("/:studentId")
    .get(verifyJWT,checkApiKey,checkRole(AvailableUserRoles), checkResults)


export default router;
