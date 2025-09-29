import { asyncHandler } from "../utils/asyncHandler.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import Material from "../models/material.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getCourses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    name,
    order = "asc",
    sortBy = "createdAt",
    createdBy,
  } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const filters = {};

  if (name) filters.name = { $regex: name, $options: "i" };
  if (createdBy) filters.createdBy = createdBy;
  filters.deletedAt = null;

  const sortOrder = order === "desc" ? -1 : 1;

  const courses = await Course.find(filters)
    .populate("materials", "name uploadFiles tags published")
    .populate("createdBy", "username fullName image")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const totalCourses = await Course.countDocuments(filters);
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

  const totalCourses = await Course.countDocuments({
    _id: courseId,
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
      throw new ApiError(404, "Course not exists");
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
      error.message ||
        "Problem while adding material and uploaded files were deleted",
    );
  }
});

const getEnrolledUsers = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  let { page = 1, limit = 10, sortBy = "createdAt", order = "asc" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const sortOrder = order === "desc" ? -1 : 1;

  const course = await Course.findOne({
    _id: courseId,
    deletedAt: null,
  });

  if (!course) {
    throw new ApiError(404, "Course not exists");
  }

  const enrolledUsers = await Enrollment.find({
    course: courseId,
    deletedAt: null,
  })
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .sort({[sortBy]: sortOrder})
    .skip(skip)
    .limit(limit);

  const totalEnrollment = await Enrollment.countDocuments({
    course: courseId,
  });
  const totalPages = Math.ceil(totalEnrollment / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        enrolledUsers,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Enrollments fetched successfully",
    ),
  );
});

export {
  getCourses,
  createCourse,
  addMaterialsByCourseId,
  getMaterialsByCourseId,
  getEnrolledUsers,
};
