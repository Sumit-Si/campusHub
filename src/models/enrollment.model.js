import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "ta"],
      required: true,
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Enrollment = new mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
