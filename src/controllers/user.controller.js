import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiKey from "../models/apiKey.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { generateAccessAndRefreshToken } from "../utils/accessRefreshToken.js";
import crypto from "crypto"

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body, "req body");

  const { username, fullName, email, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  console.warn(req.file);

  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new ApiError(400, "Image file is missing");
  }

  let image;

  try {
    image = await uploadOnCloudinary(imageLocalPath);
    console.log("Uploaded image", image);
  } catch (error) {
    console.log("Error uploading image", error);
    throw new ApiError(400, "Failed to upload image");
  }

  try {
    const user = await User.create({
      fullName,
      email,
      password,
      username,
      image: image?.url,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    ); // for reliabiltiy

    if (!createdUser) {
      throw new ApiError(500, "Problem while creating user");
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
      "Something went wrong while registering a user and image was deleted",
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

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in Successfully",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token =
    req.cookies.refreshToken || req.body.refreshtoken;

  if (!token) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
    );

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
    throw new ApiError(
      500,
      "Something went wrong while refreshing access token",
    );
  }
});

const generateApiKey = asyncHandler(async (req,res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId);

  if(!user) {
    throw new ApiError(401, "Unauthorized!");
  }

  const key = await crypto.randomBytes(32).toString("hex");
  const expireTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);    // 7 day

  const apiKey = await ApiKey.create({
    key,
    expireAt: expireTime,
  })

  const createdKey = await ApiKey.findById(apiKey._id).select("-expireAt").populate("createdBy","fullName email username");

  if(!createdKey) {
    throw new ApiError(500, "Something went wrong while creating apikey")
  }

  res.status(201)
    .json(new ApiResponse(
      200,
      createdKey,
      "Api key generated successfully"
    ))
})

const profile = asyncHandler(async (req,res) => {

})

export { registerUser, loginUser,generateApiKey,profile };
