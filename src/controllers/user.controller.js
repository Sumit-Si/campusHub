import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiKey from "../models/apiKey.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { generateAccessAndRefreshToken } from "../utils/accessRefreshToken.js";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const imageLocalPath = req.file?.path;
  let image;

  if (imageLocalPath) {
    try {
      image = await uploadOnCloudinary(imageLocalPath);
      console.log("Uploaded image", image);
    } catch (error) {
      console.log("Error uploading image", error);
      throw new ApiError(400, "Failed to upload image");
    }
  }

  try {
    const user = await User.create({
      fullName,
      email,
      password,
      username,
      role,
      image: image ? image?.url : null,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    ); // for reliabiltiy

    if (!createdUser) {
      throw new ApiError(500, "Problem while creating a user");
    }

    res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registed successfully"));
  } catch (error) {
    console.log("User Creation failed");

    if (image) {
      await deleteFromCloudinary(image.public_id);
    }

    throw new ApiError(
      500,
      "Problem while registering a user and image was deleted",
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(400, "Invalid credientails");
  }

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) {
    throw new ApiError(400, "Invalid credientails");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...options,
      maxAge: 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in Successfully",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshtoken;

  if (!token) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (token !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(500, "Problem while refreshing access token");
  }
});

const generateApiKey = asyncHandler(async (req, res) => {
  const user = req.user;
  try {
    const { expiresAt } = req.body;
    const key = crypto.randomBytes(32).toString("hex");

    const apiKey = await ApiKey.create({
      key,
      expiresAt,
      createdBy: user._id,
    });

    const createdKey = await ApiKey.findById(apiKey?._id)
      .select("-expiresAt")
      .populate("createdBy", "fullName email username");

    if (!createdKey) {
      throw new ApiError(500, "Problem while creating apiKey");
    }

    res
      .status(201)
      .json(new ApiResponse(200, createdKey, "Api key generated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Problem while creating apiKey");
  }
});

const profile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(400, "Unauthenticated!");
  }

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

export { registerUser, loginUser, refreshAccessToken, generateApiKey, profile };
