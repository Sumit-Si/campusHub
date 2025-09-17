import { asyncHandler } from "../utils/asyncHandler.js";
import Course from "../models/course.model.js";
import Material from "../models/material.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const courses = await Course.find({
    deletedAt: null,
  })
    .populate("materials", "name uploadFiles tags published")
    .skip(skip)
    .limit(limit);

  if (!courses || courses?.length === 0) {
    throw new ApiError(400, "Courses not exist");
  }

  const totalCourses = await Course.countDocuments({
    deletedAt: null,
  });
  const totalPages = Math.ceil(totalCourses / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        courses,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Courses fetched successfully",
    ),
  );
});

const createCourse = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { name, description, price } = req.body;

  const existingCourse = await Course.findOne({
    name,
    createdBy: userId,
    deletedAt: null,
  });

  if (existingCourse) {
    throw new ApiError(400, "Course already exists");
  }

  const course = await Course.create({
    name,
    description,
    price,
    createdBy: userId,
  });

  const createdCourse = await Course.findById(course?._id).populate(
    "createdBy",
    "username fullName image",
  );

  if (!createdCourse) {
    throw new ApiError(500, "Problem while creating course");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdCourse, "Course created successfully"));
});

const getMaterialsByCourseId = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const course = await Course.findOne({
    _id: courseId,
    deletedAt: null,
  })
    .populate("materials")
    .populate("createdBy", "username fullName avatar")
    .skip(skip)
    .limit(limit);

  if (!course || course?.length === 0) {
    throw new ApiError(400, "Course not exists");
  }

  const totalCourses = await Course.countDocuments({
    deletedAt: null,
  });
  const totalPages = Math.ceil(totalCourses / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        course,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Course materials fetched successfully",
    ),
  );
});

const addMaterialsByCourseId = asyncHandler(async (req, res) => {
  const { name, description, tags } = req.body;
  const { courseId } = req.params;
  const userId = req.user?._id;

  const existingMaterial = await Material.findOne({
    name,
    course: courseId,
    deletedAt: null,
  });

  if (existingMaterial) {
    throw new ApiError(400, "Course material already exists");
  }

  let uploadResults = [];
  try {
    uploadResults = await Promise.all(
      req.files.map((file) => uploadOnCloudinary(file.path)),
    );
  } catch (error) {
    throw new ApiError(400, "Failed to upload files");
  }

  const results = uploadResults.map((file) => ({
    fileUrl: file?.secure_url,
    fileType: file?.resource_type,
    size: file?.bytes,
    publicId: file?.public_id,
  }));

  try {
    const material = await Material.create({
      name,
      description,
      uploadFiles: results,
      tags: typeof tags === "string" ? JSON.parse(tags) : tags,
      uploadedBy: userId,
      course: courseId,
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { materials: material._id },
      },
      { new: true },
    );

    if (!updatedCourse) {
      throw new ApiError(404, "Course not found");
    }

    const createdMaterial = await Material.findById(material?._id)
      .populate("uploadedBy", "username fullName image")
      .populate("course", "name price");

    if (!createdMaterial) {
      throw new ApiError(500, "Problem while creating material");
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdMaterial,
          "Course material added successfully",
        ),
      );
  } catch (error) {
    await Promise.all(
      results.map(async (file) => {
        if (file.publicId) {
          await deleteFromCloudinary(file.publicId);
        }
      }),
    );
    throw new ApiError(
      500,
      error.message || "Problem while adding material and uploaded files were deleted",
    );
  }
});

export {
  getCourses,
  createCourse,
  addMaterialsByCourseId,
  getMaterialsByCourseId,
};
