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

  //TODO: previous date validation needed
  console.log(date,"date");
  

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

const getEvents = asyncHandler(async (req, res) => {});

const updateEventById = asyncHandler(async (req, res) => {});

const deleteEventById = asyncHandler(async (req, res) => {});

export { createEvent, getEvents, updateEventById, deleteEventById };
