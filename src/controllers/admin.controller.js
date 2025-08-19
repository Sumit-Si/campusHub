import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");

  if (!users) {
    throw new ApiError(400, "Users not exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const userId = req.user?._id;

  if (!id) {
    throw new ApiError(400, "Id is missing in param");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(400, "User not exists");
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      role,
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  if(!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating user's role");
  }

  res
    .status(200)
    .json(new ApiResponse(
        200,
        updatedUser,
        "User role updated successfully",
    ))
});

export { getUsers, changeUserRole };
