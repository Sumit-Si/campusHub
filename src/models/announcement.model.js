import mongoose, { Schema } from "mongoose";
import {
  AnnouncementStatusEnum,
  AnnouncementTargetEnum,
  AvailableAnnouncementStatus,
  AvailableAnnouncementTargetStatus,
} from "../constants.js";

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    attachments: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: AvailableAnnouncementStatus,
      default: AnnouncementStatusEnum.ACTIVE,
    },
    target: {
      type: String,
      enum: AvailableAnnouncementTargetStatus,
      default: AnnouncementTargetEnum.ALL,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

announcementSchema.index({ title: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ target: 1 });
announcementSchema.index({ course: 1 });
announcementSchema.index({ target: 1, status: 1, deletedAt: 1 });
announcementSchema.index({ course: 1, status: 1 });
announcementSchema.index({ creator: 1, status: 1 });

const Announcement = new mongoose.model("Announcement", announcementSchema);

export default Announcement;
