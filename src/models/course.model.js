import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    materials: [{
      type: Schema.Types.ObjectId,
      ref: "Material",
    }],
    price: {
      type: Number,
      trim: true,
      required: true,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Course = new mongoose.model("Course", courseSchema);

export default Course;
