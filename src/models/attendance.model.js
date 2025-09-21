import mongoose, { Schema } from "mongoose";
import {
  AttendanceStatusEnum,
  AvailableAttendanceStatus,
} from "../constants.js";

const attendanceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    sessionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: AvailableAttendanceStatus,
      default: AttendanceStatusEnum.PRESENT,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index(
  { user: 1, course: 1, sessionDate: 1 },
  { unique: true },
);

const Attendance = new mongoose.model("Attendance", attendanceSchema);

export default Attendance;
