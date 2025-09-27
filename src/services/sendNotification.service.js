import Notification from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendNotification = async (users, message, type = "announcement") => {
  if (!Array.isArray(users) || users.length < 1) {
    throw new ApiError(400, "Users must be an array");
  }
  const notificationsToInsert = users.map((user) => ({
    user: user._id,
    message,
    type,
  }));
  console.log(notificationsToInsert, "notificationsToInsert");

  return await Notification.insertMany(notificationsToInsert, { ordered: false });
};

export { sendNotification };
