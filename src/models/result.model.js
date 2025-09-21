import mongoose, { Schema } from "mongoose";

const resultSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      trim: true,
      enum: ["O", "A", "B", "C", "D", "E", "F"],
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    semester: {
      type: String,
      trim: true,
      required: true,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    deletedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  },
);

resultSchema.index(
  { student: 1, course: 1, subject: 1, examDate: 1 },
  { unique: true },
);

resultSchema.pre("save", async function (next) {
  if (!this.isModified("examDate")) return next();
  this.examDate = new Date(this.examDate.setUTCHours(0, 0, 0, 0));
  next();
});

const Result = mongoose.model("Result", resultSchema);
export default Result;
