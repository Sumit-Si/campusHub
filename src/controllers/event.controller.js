import { asyncHandler } from "../utils/asyncHandler.js";
import Course from "../models/course.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Event from "../models/event.model.js";

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, course, target, location } = req.body;
  const userId = req.user?._id;

  if (course) {
    const existingCourse = await Course.findOne({
      _id: course,
      deletedAt: null,
    }).select("_id");

    if (!existingCourse) {
      throw new ApiError(404, "Course not exists");
    }
  }

  if (new Date(date) <= new Date()) {
    throw new ApiError(400, "Previous date not acceptable");
  }

  const existingEvent = await Event.findOne({
    title,
    date,
    location,
    course,
  }).select("_id");

  if (existingEvent) {
    throw new ApiError(
      400,
      `Event already exists with title: ${title} - date: ${date} - location: ${location} ${course ? `- course: ${course}` : ""}`,
    );
  }

  try {
    const event = await Event.create({
      title,
      description,
      course,
      target,
      date,
      createdBy: userId,
      location,
    });

    const createdEvent = await Event.findById(event?._id)
      .populate("createdBy", "username fullName image")
      .populate("course", "name price");

    if (!createdEvent) {
      throw new ApiError(500, "Problem while creating event");
    }

    res
      .status(201)
      .json(new ApiResponse(201, createdEvent, "Event created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Problem while creating event");
  }
});

const getEvents = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    date,
    title,
    target,
    order = "asc",
    sortBy = "date",
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const filters = {};

  if (target) filters.target = target;
  if (date) filters.date = { $gte: new Date(date) };
  if (title) filters.title = { $regex: title, $options: "i" };
  filters.deletedAt = null;

  const sortOrder = order === "desc" ? -1 : 1;

  const events = await Event.find(filters)
    .populate("createdBy", "username fullName image")
    .populate("course", "name price")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const totalEvents = await Event.countDocuments(filters);
  const totalPages = Math.ceil(totalEvents / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        events,
        metadata: {
          totalPages,
          currentPage: page,
          currentLimit: limit,
        },
      },
      "Events fetched successfully",
    ),
  );
});

const updateEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, location, status, target, date } = req.body || {};

  const existingEvent = await Event.findOne({
    _id: id,
    deletedAt: null,
  });

  if (!existingEvent) {
    throw new ApiError(404, "Event not exists");
  }

  if (new Date(date) <= new Date()) {
    throw new ApiError(400, "Previous date not acceptable");
  }

  const event = await Event.findByIdAndUpdate(
    id,
    {
      title,
      description,
      target,
      status,
      date,
      location,
    },
    {
      new: true,
    },
  );

  if (!event) {
    throw new ApiError(500, "Problem while updating event");
  }

  res
    .status(200)
    .json(new ApiResponse(200, event, "Event updated successfully"));
});

const deleteEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingEvent = await Event.findOne({
    _id: id,
    deletedAt: null,
  });

  if (!existingEvent) {
    throw new ApiError(404, "Event not exists");
  }

  const event = await Event.findByIdAndUpdate(
    id,
    {
      deletedAt: new Date(),
    },
    {
      new: true,
    },
  );

  if (!event) {
    throw new ApiError(500, "Problem while deleting event");
  }

  res
    .status(200)
    .json(new ApiResponse(200, event, "Event deleted successfully"));
});

export { createEvent, getEvents, updateEventById, deleteEventById };
