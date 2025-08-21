import mongoose, { Schema } from "mongoose";

const materialSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    uploadFiles: [
      {
        fileUrl: { type: String, required: true },
        fileType: { type: String, required: true },
        size: Number,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    published: { type: Boolean, default: true },
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
  },
  {
    timestamps: true,
  },
);

const Material = new mongoose.model("Material", materialSchema);

export default Material;
