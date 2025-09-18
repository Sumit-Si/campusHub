import { asyncHandler } from "../utils/asyncHandler";

const createAttendance = asyncHandler(async (req, res) => {
    const {attendanceRecords} = req.body;
});

const updateAttendanceById = asyncHandler(async (req, res) => {});

const deleteAttendanceById = asyncHandler(async (req, res) => {});

const getAttendanceByUserId = asyncHandler(async (req, res) => {});

const getAttendanceByCourseId = asyncHandler(async (req, res) => {});

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
