import { UserRolesEnum } from "../constants.js";
import ApiKey from "../models/apiKey.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken;
      //  || req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthenticated!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Unauthenticated!");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthenticated!");
  }
};

const checkRole =
  (roles = []) =>
  async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized!");
      }

      const userRole = String(req.user?.role)?.toLowerCase();
      const allowedRoles = roles.map((role) => role);

      if (!allowedRoles.includes(userRole)) {
        throw new ApiError(
          403,
          `Access denied, ${allowedRoles.join(",")} is necessary`,
        );
      }

      next();
    } catch (error) {
      throw new ApiError(
        500,
        error?.message || "Problem while checking for admin",
      );
    }
  };

const checkApiKey = async (req, res, next) => {
  const key = req.header("Authorization").replace("Bearer ", "");
  const userId = req.user?._id;

  if (!key) {
    throw new ApiError(401, "Create a key to access it");
  }

  try {
    const isKeyExist = await ApiKey.findOne({
      key,
      createdBy: userId,
    });

    if (!isKeyExist) {
      throw new ApiError(401, "Unauthorized! - Invalid key");
    }

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized! - Invalid key");
  }
};

export { verifyJWT, checkRole, checkApiKey };
