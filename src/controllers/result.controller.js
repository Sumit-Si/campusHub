import Result from "../models/result.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const checkResults = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const user = req.user;

  if (!studentId) {
    throw new ApiError(400, "Missing or Invalid studentId");
  }

  if (user?.role === "student" && user?._id.toString() !== studentId) {
    throw new ApiError(403, "Access Denied");
  }

  const results = await Result.find({
    studentId,
  });

  if (!results) {
    throw new ApiError(400, "Results not exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, results, "Results fetched successfully"));
});

const createResults = asyncHandler(async (req, res) => {
  const bulkResult = req.body;
  const userId = req.user?._id;

//TODO: check duplicate entry of student while creating results
//   const alreadyExist = bulkResult?.some(result => result.studentId === studentId && result.examDate === new Date.now());

//   if(alreadyExist) {
//     throw new ApiError(400, "Result already exist");
//   }

  const bulkResultData = bulkResult?.map(result => ({...result,createdBy: userId.toString()}));
  
  const results = await Result.insertMany(bulkResultData);

  if (!results || results?.length === 0) {
    throw new ApiError(500, "Something went wrong while creating results");
  }

  res
    .status(201)
    .json(new ApiResponse(201, results, "Results created successfully"));
});

export { checkResults, createResults };
