import mongoose, { Schema } from "mongoose";
import {
  AvailableNotificationStatus,
  NotificationStatusEnum,
} from "../constants";

const notificationSchema = new Schema(
  {
    message: {
      type: String,
      trim: true,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: AvailableNotificationStatus,
      default: NotificationStatusEnum.ANNOUNCEMENT,
    },
    announcement: {
      type: Schema.Types.ObjectId,
      ref: "Announcement",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ user: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ isRead: 1, user: 1 });
notificationSchema.index({ type: 1, user: 1 });

const Notification = new mongoose.model("Notification", notificationSchema);

export default Notification;
