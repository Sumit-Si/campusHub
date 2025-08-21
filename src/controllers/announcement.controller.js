import Announcement from "../models/announcement.model.js";
import Course from "../models/course.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAnnouncements = asyncHandler(async (req, res) => {
  const Announcements = await Announcement.find()
    .populate("courseId","name description")
    .populate("userId", "fullName");

  if (!Announcements) {
    throw new ApiError(400, "Announcements not exist");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, Announcements, "Announcements fetched successfully"),
    );
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, target, expireAt, courseId, status, attachments } =
    req.body;
  const userId = req.user?._id;
  let existingGlobalAnnouncement;

  if (status !== "inactive") {
    existingGlobalAnnouncement = await Announcement.findOne({
      $and: [{ target: "all" }, { status: "active" }],
    });
    if (existingGlobalAnnouncement) {
      throw new ApiError(400, "Global announcement already exist");
    }
  }

  const expireTime = new Date(expireAt);

  //TODO: upload attachements
  const attachmentsArray = attachments?.map(
    file => {

    }
  )

  const announcement = await Announcement.create({
    title,
    message,
    userId,
    target,
    courseId,
    status,
    attachments,
    expireAt: expireTime,
  });

  const createdAnnouncement = await Announcement.findById(
    announcement?._id,
  ).populate("userId", "fullName");

  if (!createdAnnouncement) {
    throw new ApiError(500, "Something went wrong while creating announcement");
  }

  //TODO: mail sending to notify about announcements

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
