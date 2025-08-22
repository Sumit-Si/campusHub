import mongoose,{ Schema } from 'mongoose';

const resultSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
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
    },
    examDate: {
      type: Date,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model('Result', resultSchema);
export default Result;
