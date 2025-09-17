import { EnrollStatusEnum, UserRolesEnum } from "../constants.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getEnrollments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = EnrollStatusEnum.ACTIVE } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const enrollments = await Enrollment.find({
    status,
  })
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .skip(skip)
    .limit(limit);

  if (!enrollments || enrollments?.length === 0) {
    throw new ApiError(404, "Enrollments not exist");
  }

  const totalEnrollments = await Course.countDocuments();
  const totalPages = Math.ceil(totalEnrollments / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        enrollments,
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

const createEnrollment = asyncHandler(async (req, res) => {
  const { courseId, role, remarks } = req.body;
  const userId = req.user?._id;

  const course = await Course.findOne({
    _id: courseId,
    deletedAt: null,
  });

  if (!course) {
    throw new ApiError(404, "Course not exists");
  }

  const existingEnrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
    status: EnrollStatusEnum.ACTIVE,
  });

  if (existingEnrollment) {
    throw new ApiError(400, "Already enrolled in a course");
  }

  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId,
    role: UserRolesEnum.STUDENT,
    remarks,
  });

  const createdEnrollment = await Enrollment.findById(enrollment?._id)
    .populate("user", "username fullName image")
    .populate("course", "name price");

  if (!createdEnrollment) {
    throw new ApiError(500, "Problem while creating enrollment");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdEnrollment,
        "Enrollment created successfully",
      ),
    );
});

const getEnrollmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enrollment = await Enrollment.findById(id)
    .populate("user", "username fullName image")
    .populate("course", "name price");

  if (!enrollment) {
    throw new ApiError(404, "Enrollment not exists");
  }

  res
    .status(200)
    .json(new ApiResponse(200, enrollment, "Enrollment fetched successfully"));
});

const updateEnrollmentById = asyncHandler(async (req, res) => {});

const deleteEnrollmentById = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const existing = await Enrollment.findById(id);

    if(!existing) {
        throw new ApiError(404, "Enrollment not exists");
    }

    // const enrollment = await Enrollment.findByIdAnd(id);


});

const getCurrentEnrollment = asyncHandler(async (req, res) => {
//   const currentEnrollment = await Enrollment.findOne({
//     user: req.user?._id,
//   });
});

export {
  getEnrollments,
  createEnrollment,
  getEnrollmentById,
  updateEnrollmentById,
  deleteEnrollmentById,
  getCurrentEnrollment,
};
