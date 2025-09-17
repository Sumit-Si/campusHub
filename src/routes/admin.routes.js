import { Router } from "express";
import { checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
import { changeUserRole, getUsers } from "../controllers/admin.controller.js";
import { changeUserRoleValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/users").get(verifyJWT, checkRole(["admin"]), getUsers);

router
  .route("/users/:id/role")
  .put(
    verifyJWT,
    checkRole(["admin"]),
    changeUserRoleValidator(),
    validate,
    changeUserRole,
  );

export default router;
