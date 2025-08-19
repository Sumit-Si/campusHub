import { UserRolesEnum } from "../constants.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized!");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Unauthorized!");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized!");
  }
};

const checkRole = (roles = []) => async (req,res,next) => {
  try {

    if(!req.user) {
      throw new ApiError(401, "Unauthorized!");
    }
    
    const userRole = String(req.user?.role)?.toLowerCase();
    const allowedRoles = roles.map(role => role);

    if(!allowedRoles.includes(userRole)) {
      throw new ApiError(403, `Access denied, ${allowedRoles.join(",")} is necessary`);
    }

    next();
    
  } catch (error) {
    throw new ApiError(500,error?.message || "Something went wrong while checking for admin");
  }
}

export { verifyJWT,checkRole };
