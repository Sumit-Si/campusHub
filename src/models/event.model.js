import mongoose, { Schema } from "mongoose";
import {
  AnnouncementTargetEnum,
  AvailableAnnouncementTargetStatus,
  AvailableEventStatus,
  EventStatusEnum,
} from "../constants.js";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: String,
      enum: AvailableAnnouncementTargetStatus,
      default: AnnouncementTargetEnum.ALL,
    },
    date: {
      type: Date,
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: AvailableEventStatus,
      default: EventStatusEnum.ACTIVE,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.index({ title: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ target: 1 });
eventSchema.index({ date: 1, title: 1 });

const Event = new mongoose.model("Event", eventSchema);

export default Event;
