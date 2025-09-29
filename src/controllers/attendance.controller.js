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
  // console.log(uniqueUserIds, uniqueCourseIds, "uniqueIds");

  const users = await User.find({
    _id: {
      $in: uniqueUserIds,
    },
  }).select("_id");

  // console.log(users, "users");

  const userIdSet = new Set(users.map((user) => user._id.toString()));
  // console.log(userIdSet, "setUserId");

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
    new Set(userCoursePairs.map((ucPair) => `${ucPair.user}_${ucPair.course}`)),
  ).map((ucStringPair) => {
    const [user, course] = ucStringPair.split("_");
    return { user, course };
  });

  // console.log(uniquePairs, "uniquePairs");

  const enrollments = await Enrollment.find({
    $or: uniquePairs,
  }).select("user course");

  // console.log(enrollments, "enrollments");

  const enrollmentSet = new Set(
    enrollments.map((e) => `${e.user}_${e.course}`),
  );

  // console.log(enrollmentSet, "enrollmentSet");

  for (const attRecord of attendanceRecords) {
    const validUser = userIdSet.has(attRecord.user);
    const validCourse = courseIdSet.has(attRecord.course);
    const enrolledIn = enrollmentSet.has(
      `${attRecord.user}_${attRecord.course}`,
    );
    attRecord.markedBy = req.user?._id.toString();
    attRecord.sessionDate = attRecord.sessionDate
      ? new Date(new Date(attRecord.sessionDate).setUTCHours(0, 0, 0, 0))
      : new Date(new Date().setUTCHours(0, 0, 0, 0));

    if (!validUser || !validCourse || !enrolledIn) {
      attRecord.error = !validUser
        ? "User not exists"
        : !validCourse
          ? "Course not exists"
          : "User not enrolled";
      invalidAttRecords.push(attRecord);
    } else {
      validAttRecords.push(attRecord);
    }
  }
  // console.log(validAttRecords, "validAttREcords");

  try {
    const existingAttendance = await Attendance.find({
      $or: validAttRecords.map((record) => ({
        user: record.user,
        course: record.course,
        sessionDate: record.sessionDate,
      })),
    }).select("user course sessionDate");

    // console.log(existingAttendance, "existingRecord");

    const setExistingAtt = new Set(
      existingAttendance.map(
        (extAtt) =>
          `${extAtt.user}_${extAtt.course}_${extAtt.sessionDate.toISOString()}`,
      ),
    );

    // console.log(setExistingAtt, "setExistingAtt");

    const recordsToInsert = validAttRecords.filter(
      (attRecord) =>
        !setExistingAtt.has(
          `${attRecord.user}_${attRecord.course}_${attRecord.sessionDate.toISOString()}`,
        ),
    );

    // console.log(recordsToInsert, "uniqueAttREcords");

    const markedBulkAttendance = await Attendance.insertMany(recordsToInsert, {
      ordered: false,
    });

    // console.log(markedBulkAttendance, "markAtt");

    if (!markedBulkAttendance) {
      throw new ApiError(500, "Problem while marking bulk attendance");
    }

    res.status(201).json(
      new ApiResponse(201, "Attendance marked successfully", {
        insertedCount: markedBulkAttendance.length,
        existingAttendance,
        invalidAttRecords,
      }),
    );
  } catch (error) {
    if (error.code === 11000) {
      console.log(`Error on duplicate record ${error.code}`);
    }
    throw new ApiError(
      500,
      error.message || "Problem while marking attendance",
    );
  }
});

const updateAttendanceById = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const { id } = req.params;

  const existingAtt = await Attendance.findById(id);

  if (!existingAtt) {
    throw new ApiError(404, "Attendance not exists");
  }

  const updateAtt = await Attendance.findByIdAndUpdate(
    id,
    {
      status,
    },
    {
      new: true,
    },
  )
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .populate("markedBy", "username fullName image");

  if (!updateAtt) {
    throw new ApiError(500, "Problem while updating attendance");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updateAtt, "Attendance updated successfully"));
});

const deleteAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingAtt = await Attendance.findById(id);

  if (!existingAtt) {
    throw new ApiError(404, "Attendance not exists");
  }

  const deletedAtt = await Attendance.findByIdAndDelete(id)
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .populate("markedBy", "username fullName image");

  if (!deletedAtt) {
    throw new ApiError(500, "Problem while deleting attendance");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedAtt, "Attendance deleted successfully"));
});

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

  const existingUser = await User.findById(userId).select("_id");

  if (!existingUser) {
    throw new ApiError(404, "User not exists");
  }

  const attendance = await Attendance.find({
    user: userId,
  })
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .populate("markedBy", "username fullName image")
    .skip(skip)
    .limit(limit);

  const totalAttendance = await Attendance.countDocuments({
    user: userId,
  });
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

  const existingCourse = await Course.findOne({
    _id: courseId,
    deletedAt: null,
  }).select("_id");

  if (!existingCourse) {
    throw new ApiError(404, "Course not exists");
  }

  const attendance = await Attendance.find({
    course: courseId,
  })
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .populate("markedBy", "username fullName image")
    .skip(skip)
    .limit(limit);

  const totalAttendance = await Attendance.countDocuments({
    course: courseId
  });
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

const getAttendanceByCourseIdAndSessionDate = asyncHandler(async (req, res) => {
  const { courseId, sessionDate } = req.params;
  let { page = 1, limit = 10 } = req.query;
  console.log(typeof sessionDate, "sessionDate");

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const parsedDate = new Date(sessionDate);

  if (isNaN(parsedDate)) {
    throw new ApiError(400, "Invalid sessionDate format");
  }

  const validSessionDate = new Date(parsedDate.setUTCHours(0, 0, 0, 0));

  const existingCourse = await Course.findOne({
    _id: courseId,
    deletedAt: null,
  }).select("_id name price");

  if (!existingCourse) {
    throw new ApiError(404, "Course not exists");
  }

  const attendance = await Attendance.find({
    course: courseId,
    sessionDate: validSessionDate,
  })
    .populate("user", "username fullName image")
    .populate("course", "name price")
    .populate("markedBy", "username fullName image")
    .skip(skip)
    .limit(limit);

  const totalAttendance = await Attendance.countDocuments({
    course: courseId,
    sessionDate: validSessionDate,
  });
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

export {
  createAttendance,
  updateAttendanceById,
  deleteAttendanceById,
  getAttendanceByCourseId,
  getAttendanceByUserId,
  getAttendanceByCourseIdAndSessionDate,
};
