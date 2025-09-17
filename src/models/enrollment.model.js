import mongoose, { Schema } from "mongoose";
import {
  AvailableEnrollStatus,
  AvailableUserRoles,
  EnrollStatusEnum,
  UserRolesEnum,
} from "../constants.js";

const enrollmentSchema = new Schema(
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
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.STUDENT,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: AvailableEnrollStatus,
      default: EnrollStatusEnum.ACTIVE,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true }); // each user can have at most one enrollment per course

const Enrollment = new mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
