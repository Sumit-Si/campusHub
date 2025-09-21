import Result from "../models/result.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

const checkResults = asyncHandler(async (req, res) => {
  const user = req.user;
  const { studentId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  if (!studentId) {
    throw new ApiError(400, "Missing or Invalid studentId");
  }

  if (user?.role === "student" && user?._id.toString() !== studentId) {
    throw new ApiError(403, "Access Denied");
  }

  const results = await Result.find({
    student: studentId,
    deletedAt: null,
  })
    .populate("student", "username fullName image")
    .populate("course", "name price")
    .populate("createdBy", "username fullName image")
    .skip(skip)
    .limit(limit);

  const totalResults = await Result.countDocuments({
    student: studentId,
    deletedAt: null,
  });
  const totalPages = Math.ceil(totalResults / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        results,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Results fetched successfully",
    ),
  );
});

const createResults = asyncHandler(async (req, res) => {
  const { results } = req.body;
  const userId = req.user?._id;

  const uniqueUserIds = [...new Set(results.map((res) => res.student))];

  const uniqueCourseIds = [...new Set(results.map((res) => res.course))];

  const users = await User.find({
    _id: {
      $in: uniqueUserIds,
    },
  }).select("_id");


  const userIdSet = new Set(users.map((user) => user._id.toString()));

  const courses = await Course.find({
    _id: {
      $in: uniqueCourseIds,
    },
  }).select("_id");


  const courseIdSet = new Set(courses.map((course) => course._id.toString()));

  // enrollment checking
  const userCoursePairs = results.map((res) => ({
    student: res.student,
    course: res.course,
  }));

  const uniquePairs = Array.from(
    new Set(
      userCoursePairs.map((ucPair) => `${ucPair.student}_${ucPair.course}`),
    ),
  ).map((ucStringPair) => {
    const [student, course] = ucStringPair.split("_");
    return { user: student, course };
  });


  const enrollment = await Enrollment.find({
    $or: uniquePairs,
  }).select("user course");

  const enrollmentSet = new Set(
    enrollment.map((enroll) => `${enroll.user}_${enroll.course}`),
  );

  const validResultRecords = [];
  const invalidResultRecords = [];

  for (const result of results) {
    const validUser = userIdSet.has(result.student);
    const validCourse = courseIdSet.has(result.course);
    const enrolledIn = enrollmentSet.has(`${result.student}_${result.course}`);
    result.createdBy = userId.toString();
    result.examDate = new Date(
      new Date(result.examDate).setUTCHours(0, 0, 0, 0),
    );

    if (!validUser || !validCourse || !enrolledIn) {
      result.error = !validUser
        ? "User not exists"
        : !validCourse
          ? "Course not exists"
          : "User not enrolled";
      invalidResultRecords.push(result);
    } else {
      // if (
      //   !validResultRecords.some(
      //     (validRes) => validRes.student === result.student,
      //   )
      // )  // no need
        validResultRecords.push(result);
    }
  }

  // existing Result check
  const existingResults = await Result.find({
    $or: validResultRecords.map((validRes) => ({
      student: validRes.student,
      course: validRes.course,
      examDate: validRes.examDate,
      deletedAt: null,
    })),
  }).select("student course examDate");

  const uniqueExistingResults = new Set(
    existingResults.map(
      (existRes) =>
        `${existRes.student}_${existRes.course}_${existRes.examDate.toISOString()}`,
    ),
  );

  const uniqueResultsForInsertion = validResultRecords.filter(
    (validRes) =>
      !uniqueExistingResults.has(
        `${validRes.student}_${validRes.course}_${validRes.examDate.toISOString()}`,
      ),
  );

  try {
    const insertedResults = await Result.insertMany(uniqueResultsForInsertion, {
      ordered: false,
    });

    if (!insertedResults) {
      throw new ApiError(500, "Problem while creating results");
    }

    res.status(201).json(
      new ApiResponse(
        201,
        {
          insertedCount: insertedResults.length,
          existingResults,
          invalidResultRecords,
        },
        "Results created successfully",
      ),
    );
  } catch (error) {
    if (error.code === 11000) {
      console.log(`Error on duplicate record ${error.code}`);
    }
    throw new ApiError(500, error.message || "Problem while creating results");
  }
});

export { checkResults, createResults };
