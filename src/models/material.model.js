import mongoose, { Schema } from "mongoose";

const materialSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
        publicId: { type: String, required: true },
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    published: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

materialSchema.index({ name: 1 });
materialSchema.index({ course: 1 });

const Material = new mongoose.model("Material", materialSchema);

export default Material;
