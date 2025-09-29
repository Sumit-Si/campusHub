import { UserRolesEnum } from "../constants.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUsers = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, sortBy = "createdAt", order = "asc" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const sortOrder = order === "desc" ? -1 : 1;

  const users = await User.find()
    .select("-password -refreshToken")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Users fetched successfully",
    ),
  );
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(400, "User not exists");
  }

  if (req.user?._id.equals(id) && role !== UserRolesEnum.ADMIN) {
    // recommended: .equals to check for mongoose id equal to params id rather than === which check for only string and not working with MongooseId when checking with string id from params.
    throw new ApiError(400, "Admin cannot change their role");
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

  if (!updatedUser) {
    throw new ApiError(500, "Problem while updating user's role");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User role updated successfully"));
});

export { getUsers, changeUserRole };
