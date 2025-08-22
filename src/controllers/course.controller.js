import { asyncHandler } from "../utils/asyncHandler.js";
import Course from "../models/course.model.js";
import Material from "../models/material.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("materials" ,"name uploadFiles tags published");

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
  const { name, description, tags } = req.body;
  const { courseId } = req.params;
  const userId = req.user?._id;

  const existingMaterial = await Material.findOne({ name, courseId });

  if (existingMaterial) {
    throw new ApiError(400, "Course material already exists");
  }

  let uploadResults = [];
  try {
    uploadResults = await Promise.all(
      req.files?.map(file => uploadOnCloudinary(file.path))
    );
  } catch (error) {
    throw new ApiError(400, "Failed to upload files");
  }

  const results = uploadResults.map(file => ({
    fileUrl: file?.secure_url,
    fileType: file?.resource_type,
    size: file?.bytes,
  }));


  try {
    const material = await Material.create({
      name,
      description,
      uploadFiles: results,
      tags: typeof tags === "string" ? JSON.parse(tags) : tags,
      userId,
      courseId,
    });

    await Course.findByIdAndUpdate(courseId, { $push: { materials: material._id } });

    res.status(201).json(
      new ApiResponse(200, material, "Course material added successfully")
    );
  } catch (error) {
    await Promise.all(
      results.map(async file => {
        if (file.publicId) {
          await deleteFromCloudinary(file.publicId);
        }
      })
    );
    throw new ApiError(
      500,
      "Something went wrong while adding the material; uploaded files were deleted"
    );
  }
});


export {
  getCourses,
  createCourse,
  addMaterialsByCourseId,
  getMaterialsByCourseId,
};
