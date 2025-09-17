import Announcement from "../models/announcement.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAnnouncements = asyncHandler(async (req, res) => {
  const Announcements = await Announcement.find()
    .populate("courseId", "name description")
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
  const { title, message, target, expireAt, courseId } = req.body;
  const userId = req.user?._id;

  const existingGlobalAnnouncement = await Announcement.findOne({
    $and: [{ target: "all" }, { status: "active" }],
  });

  if (existingGlobalAnnouncement) {
    throw new ApiError(400, "Global announcement already exist");
  }

  const expireTime = new Date(expireAt);

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
    userId,
    target,
    courseId,
    attachments,
    expireAt: expireTime,
  });

  const createdAnnouncement = await Announcement.findById(announcement?._id)
    .populate("userId", "fullName email")
    .populate("courseId", "name");

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
