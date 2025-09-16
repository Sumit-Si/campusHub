import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
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
    materials: [{
      type: Schema.Types.ObjectId,
      ref: "Material",
    }],
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  },
);


// index
courseSchema.index({name: 1});
courseSchema.index({createdBy: 1});
courseSchema.index({deletedAt: 1});

const Course = new mongoose.model("Course", courseSchema);

export default Course;
