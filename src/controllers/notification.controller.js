import { asyncHandler } from "../utils/asyncHandler.js";
import Notification from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  let { page = 1, limit = 10, isRead, order = "asc", sortBy = "createdAt" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const filters = {
    user: userId,
    deletedAt: null,
  };

  if (isRead === "true" || isRead === "false") {
    filters.isRead = isRead;
  }

  const sortOrder = order === "desc" ? -1 : 1;

  const notifications = await Notification.find(filters)
    .populate("user", "username fullName image")
    .sort({[sortBy]: sortOrder})
    .skip(skip)
    .limit(limit);

  const totalNotifications = await Notification.countDocuments({
    deletedAt: null,
    user: userId,
  });
  const totalPages = Math.ceil(totalNotifications / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Notifications fetched successfully",
    ),
  );
});

const updateNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingNotification = await Notification.findOne({
    _id: id,
    deletedAt: null,
  }).select("_id");

  if (!existingNotification) {
    throw new ApiError(404, "Notification not exists");
  }

  const notification = await Notification.findByIdAndUpdate(
    id,
    {
      isRead: true,
    },
    {
      new: true,
    },
  ).populate("user", "username fullName image");

  if (!notification) {
    throw new ApiError(500, "Problem while updating notification");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, notification, "Notification updated successfully"),
    );
});

const deleteNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingNotification = await Notification.findOne({
    _id: id,
    deletedAt: null,
  }).select("_id");

  if (!existingNotification) {
    throw new ApiError(404, "Notification not exists");
  }

  const notification = await Notification.findByIdAndUpdate(
    id,
    {
      deletedAt: new Date(),
    },
    {
      new: true,
    },
  ).populate("user", "username fullName image");

  if (!notification) {
    throw new ApiError(500, "Problem while deleting notification");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, notification, "Notification deleted successfully"),
    );
});

export { getAllNotifications, updateNotificationById, deleteNotificationById };
