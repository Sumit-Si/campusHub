import { asyncHandler } from "../utils/asyncHandler.js";
import Course from "../models/course.model.js";
import Material from "../models/material.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find();

  if (!courses) {
    throw new ApiError(400, "Courses not exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, courses, "Courses fetched successfully"));
});

const createCourse = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;

  const existingCourse = await Course.findOne({
    name,
  });

  if (existingCourse) {
    throw new ApiError(400, "Course already exists");
  }

  const course = await Course.create({
    name,
    description,
    price,
    userId: req.user?._id,
  });

  const createdCourse = await Course.findById(course?._id).populate(
    "userId",
    "username fullName email",
  );

  if (!createdCourse) {
    throw new ApiError(500, "Something went wrong while creating course");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdCourse, "Course created successfully"));
});

const getMaterialsByCourseId = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    throw new ApiError(400, "CourseId is missing");
  }

  const course = await Course.findById(courseId).populate("materials");

  if (!course) {
    throw new ApiError(400, "Course not exists");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, course, "Course materials fetched successfully"),
    );
});

const addMaterialsByCourseId = asyncHandler(async (req, res) => {

});

export {
  getCourses,
  createCourse,
  addMaterialsByCourseId,
  getMaterialsByCourseId,
};
