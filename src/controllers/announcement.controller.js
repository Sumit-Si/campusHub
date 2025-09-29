import Announcement from "../models/announcement.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import { sendNotification } from "../services/sendNotification.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAnnouncements = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    title,
    target,
    status,
    course,
    creator,
    sortBy = "createdAt", order = "asc"
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const filters = {};

  if(title) filters.title = {$regex: title, $options: "i"};
  if(target) filters.target = target;
  if(status) filters.status = status;
  if(course) filters.course = course;
  if(creator) filters.createdBy = creator;
  filters.deletedAt = null;

  const sortOrder = order === "desc" ? -1 : 1;

  const Announcements = await Announcement.find(filters)
    .populate("course", "name description")
    .populate("createdBy", "username fullName image")
    .sort({[sortBy]: sortOrder})
    .skip(skip)
    .limit(limit)
    .lean();

  const totalAnnouncements = await Announcement.countDocuments(filters);
  const totalPages = Math.ceil(totalAnnouncements / limit);
  res.status(200).json(
    new ApiResponse(
      200,
      {
        Announcements,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Announcements fetched successfully",
    ),
  );
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, target, course } = req.body;
  const userId = req.user?._id;

  const existingGlobalAnnouncement = await Announcement.findOne({
    $and: [{ target: "all" }, { status: "active" }],
  });

  if (existingGlobalAnnouncement) {
    throw new ApiError(400, "Global announcement already exist");
  }

  const existingCourse = await Course.findOne({
    _id: course,
    deletedAt: null,
  }).select("name");

  if (!existingCourse) {
    throw new ApiError(404, "Course not exists");
  }

  let uploadResults = [];

  try {
    uploadResults = await Promise.all(
      req.files?.map((file) => uploadOnCloudinary(file?.path)),
    );
  } catch (error) {
    throw new ApiError(400, "Failed to upload files");
  }

  const attachments = uploadResults
    .map((file) => file?.secure_url)
    .filter((url) => !!url); // !! means if it's value is true then it's result will be true

  const announcement = await Announcement.create({
    title,
    message,
    createdBy: userId,
    target,
    course,
    attachments,
  });

  const createdAnnouncement = await Announcement.findById(announcement?._id)
    .populate("createdBy", "username fullName image")
    .populate("course", "name price");

  if (!createdAnnouncement) {
    throw new ApiError(500, "Problem while creating announcement");
  }

  // notification system for announcements
  let targetToNotify = {};

  if (target === "all") {
    targetToNotify = {};
  } else {
    targetToNotify.role = target;
  }

  // console.log(targetToNotify, "targetNotify");

  // check for course
  if (course) {
    const enrollments = await Enrollment.find({
      course,
      deletedAt: null,
    }).select("user");

    // console.log(enrollments, "enrollments");

    // get userIds from enrollments
    const enrolledUserIds = enrollments.map((enroll) => enroll.user);
    // console.log(enrolledUserIds, "enrolledUsers");

    targetToNotify = {
      _id: {
        $in: enrolledUserIds,
      },
    };
  }

  // console.log(targetToNotify, "targetToNotify");

  // users to notify
  const notifyToUsers = await User.find(targetToNotify).select(
    "username fullName image",
  );

  // console.log(notifyToUsers, "notifyToUsers");

  const notify = await sendNotification(notifyToUsers, message);
  // console.log(notify, "notify");

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdAnnouncement,
        "Announcement created successfully",
      ),
    );
});

export { getAnnouncements, createAnnouncement };
