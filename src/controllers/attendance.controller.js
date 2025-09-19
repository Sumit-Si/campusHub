import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import Enrollment from "../models/enrollment.model.js";

const createAttendance = asyncHandler(async (req, res) => {
  const { attendanceRecords } = req.body;

  console.log(attendanceRecords, "records");
  const validAttRecords = [];
  const invalidAttRecords = [];

  const uniqueUserIds = [
    ...new Set(attendanceRecords.map((attRecord) => attRecord.user)),
  ];
  const uniqueCourseIds = [
    ...new Set(attendanceRecords.map((attRecord) => attRecord.course)),
  ];
  console.log(uniqueUserIds, uniqueCourseIds, "uniqueIds");

  const users = await User.find({
    _id: {
      $in: uniqueUserIds,
    },
  }).select("_id");

  console.log(users, "users");

  const userIdSet = new Set(users.map((user) => user._id.toString()));
  console.log(userIdSet, "setUserId");

  const courses = await Course.find({
    _id: {
      $in: uniqueCourseIds,
    },
  }).select("_id");

  const courseIdSet = new Set(courses.map((course) => course._id.toString()));

  const userCoursePairs = attendanceRecords.map((attRecord) => ({
    user: attRecord.user,
    course: attRecord.course,
  }));

  const uniquePairs = Array.from(
    new Set(
      userCoursePairs.map((ucPair) => `${ucPair.user}_${ucPair.course}`),
    ),
  ).map((ucStringPair) => {
    const [ user, course ] = ucStringPair.split("_");
    return { user, course };
  });

  console.log(uniquePairs,"uniquePairs");
  

  const enrollments = await Enrollment.find({
    $or: uniquePairs,
  }).select("user course");

  console.log(enrollments,"enrollments");


  const enrollmentSet = new Set(
    enrollments.map((e) => `${e.user}_${e.course}`),
  );

    console.log(enrollmentSet,"enrollmentSet");


  for (const attRecord of attendanceRecords) {
    const validUser = userIdSet.has(attRecord.user);
    const validCourse = courseIdSet.has(attRecord.course);
    const enrolledIn = enrollmentSet.has(
      `${attRecord.user}_${attRecord.course}`,
    );

    if (!validUser || !validCourse || !enrolledIn) {
      attRecord.error = !validUser
        ? "User not exists"
        : !validCourse
          ? "Course not exists"
          : "User not enrolled";
      invalidAttRecords.push(attRecord);
    } else {
      validAttRecords.push({...attRecord,markedBy: req.user?._id.toString()});
    }
  }
  console.log(validAttRecords,"validAttREcords");
  
  try {
    const markedBulkAttendance = await Attendance.insertMany(validAttRecords, {
      ordered: false,
    });

    console.log(markedBulkAttendance,"markAtt");
    

    if (!markedBulkAttendance) {
      throw new ApiError(500, "Problem while marking bulk attendance");
    }

    res.status(201).json(
      new ApiResponse(201, "Attendance marked successfully", {
        insertedCount: markedBulkAttendance.length,
        invalidAttRecords,
      }),
    );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Problem while marking attendance",
    );
  }
});

const updateAttendanceById = asyncHandler(async (req, res) => {});

const deleteAttendanceById = asyncHandler(async (req, res) => {});

const getAttendanceByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const attendance = await Attendance.find({
    user: userId,
  })
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .populate("markedBy", "username fullName image")
    .skip(skip)
    .limit(limit);

  const totalAttendance = await Attendance.countDocuments();
  const totalPages = Math.ceil(totalAttendance / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        attendance,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Attendance fetched successfully",
    ),
  );
});

const getAttendanceByCourseId = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const attendance = await Attendance.find({
    course: courseId,
  })
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .populate("markedBy", "username fullName image")
    .skip(skip)
    .limit(limit);

  const totalAttendance = await Attendance.countDocuments();
  const totalPages = Math.ceil(totalAttendance / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        attendance,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Attendance fetched successfully",
    ),
  );
});

const getAttendanceByCourseIdAndSessionDate = asyncHandler(
  async (req, res) => {},
);

export {
  createAttendance,
  updateAttendanceById,
  deleteAttendanceById,
  getAttendanceByCourseId,
  getAttendanceByUserId,
  getAttendanceByCourseIdAndSessionDate,
};
