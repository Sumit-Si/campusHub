import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
    },
    userId: {
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
      enum: ["active", "inactive"],
      default: "active",
    },
    target: {
      type: String,
      enum: ["all", "admins", "faculty", "students"],
      default: "all",
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);


const Announcement = new mongoose.model("Announcement", announcementSchema);

export default Announcement;
