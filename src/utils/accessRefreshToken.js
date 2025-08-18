import User from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();
    console.log(refreshToken,accessToken,"access and refresh token");
    

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while generating refresh and access tokens",
    );
  }
};

export { generateAccessAndRefreshToken };
