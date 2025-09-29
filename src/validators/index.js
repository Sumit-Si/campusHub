import { body } from "express-validator";
import {
  AvailableAnnouncementTargetStatus,
  AvailableAttendanceStatus,
  AvailableEnrollStatus,
  AvailableEventStatus,
  AvailableUserRoles,
  UserRolesEnum,
} from "../constants.js";

// auth validations
const userRegisterValidator = () => {
  return [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .trim()
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be 3-50 characters"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email")
      .trim()
      .isLowercase()
      .withMessage("Email must be in lowercase"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be 8-20 characters"),

    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("FullName is required")
      .isLength({ min: 5, max: 100 })
      .withMessage("FullName must be 5-100 characters"),

    body("role")
      .trim()
      .isIn(AvailableUserRoles)
      .withMessage("Role must be either student,faculty or admin"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email")
      .trim()
      .isLowercase()
      .withMessage("Email must be in lowercase"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be 8-20 characters"),
  ];
};

const generateApiKeyValidator = () => {
  return [
    body("expiresAt")
      .optional({ values: "falsy" }) // -> skips: undefined, null, '', 0, false
      .trim()
      .isISO8601()
      .withMessage("ExpiresAt must be a valid iso date"),
  ];
};

// admin validations
const changeUserRoleValidator = () => {
  return [
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .trim()
      .isLowercase()
      .withMessage("Role must be in lowercase")
      .isIn(["admin", "student", "faculty"])
      .withMessage("Role must be one of: admin, student, faculty"),
  ];
};

// course validations
const createCourseValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 5, max: 100 })
      .withMessage("Name must be 5-100 characters"),

    body("description")
      .trim()
      .optional()
      .isLength({ min: 20, max: 5000 })
      .withMessage("Description must be 20-5000 characters"),

    body("price")
      .trim()
      .notEmpty()
      .withMessage("Price is required")
      .isInt()
      .withMessage("Price must be a number"),
  ];
};

const createMaterialValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 5, max: 200 })
      .withMessage("Name must be 5-200 characters"),

    body("description")
      .trim()
      .optional()
      .isLength({ min: 20, max: 1000 })
      .withMessage("Description must be 20-1000 characters"),

    body("tags").trim().optional(),
  ];
};

// enrollment validation
const createEnrolledValidator = () => {
  return [
    body("courseId")
      .trim()
      .notEmpty()
      .withMessage("CourseId is required")
      .isMongoId()
      .withMessage("CourseId must be a mongoId"),

    body("role")
      .trim()
      .optional()
      .isIn([UserRolesEnum.ADMIN, UserRolesEnum.STUDENT])
      .withMessage("Role must be either admin or student"),

    body("remarks")
      .trim()
      .optional()
      .isLength({ min: 10, max: 200 })
      .withMessage("Remarks must be 10-200 characters"),
  ];
};

const updateEnrolledValidator = () => {
  return [
    body("remarks")
      .trim()
      .optional()
      .isLength({ min: 10, max: 200 })
      .withMessage("Remarks must be 10-200 characters"),

    body("status")
      .trim()
      .optional()
      .isIn(AvailableEnrollStatus)
      .withMessage("Status must be of: completed, active or dropped"),
  ];
};

// attendance validations
const createAttendanceValidator = () => {
  return [
    body("attendanceRecords")
      .isArray({ min: 1 })
      .withMessage("AttendanceRecords must be a non empty array")
      .exists()
      .withMessage("AttendanceRecords is required"),

    body("attendanceRecords.*.user")
      .trim()
      .notEmpty()
      .withMessage("UserId is required")
      .isMongoId()
      .withMessage("UserId must be a valid mongoId"),

    body("attendanceRecords.*.course")
      .trim()
      .notEmpty()
      .withMessage("CourseId is required")
      .isMongoId()
      .withMessage("CourseId must be a valid mongoId"),

    body("attendanceRecords.*.status")
      .optional()
      .trim()
      .isIn(AvailableAttendanceStatus)
      .withMessage("Status must be either present or absent"),

    body("attendanceRecords.*.sessionDate")
      .trim()
      .optional()
      .isISO8601()
      .withMessage("sessionDate must be a valid iso date"),
  ];
};

const updateAttendanceByIdValidator = () => {
  return [
    body("status")
      .optional()
      .trim()
      .isIn(AvailableAttendanceStatus)
      .withMessage("Status must be either present or absent"),
  ];
};

// announcement validations
const createAnnounceValidator = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be al least 5 characters length"),

    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be 10-1000 characters"),

    body("course")
      .trim()
      .optional()
      .isMongoId()
      .withMessage("Course id must be a valid mongoId"),
  ];
};

// notification validations
// const updateNotificationValidator = () => {
//   return [
//     body("isRead")
//       .trim()
//       .notEmpty()
//       .withMessage("isRead is required")
//       .isIn(["true", "false"])
//       .withMessage("isRead must either be true or false"),
//   ];
// };

// event validations
const createEventValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 5, max: 500 })
      .withMessage("Title must be 5-500 characters"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 5, max: 1000 })
      .withMessage("Description must be 5-1000 characters"),

    body("date")
      .trim()
      .notEmpty()
      .withMessage("Date is required")
      .isISO8601()
      .withMessage("Date must be a valid iso date"),

    body("course")
      .trim()
      .optional()
      .isMongoId()
      .withMessage("Course id must be a valid mongoId"),

    body("target")
      .trim()
      .optional()
      .isIn(AvailableAnnouncementTargetStatus)
      .withMessage("Target must be of: all, students, admins or faculty"),

    body("location")
      .trim()
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage("Location must be 3-255 characters"),
  ];
};

const updateEventValidator = () => {
  return [
    body("title")
      .trim()
      .optional()
      .isLength({ min: 5, max: 500 })
      .withMessage("Title must be 5-500 characters"),

    body("description")
      .trim()
      .optional()
      .isLength({ min: 5, max: 1000 })
      .withMessage("Description must be 5-1000 characters"),

    body("date")
      .trim()
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid iso date"),

    body("target")
      .trim()
      .optional()
      .isIn(AvailableAnnouncementTargetStatus)
      .withMessage("Target must be of: all, students, admins or faculty"),

    body("status")
      .trim()
      .optional()
      .isIn(AvailableEventStatus)
      .withMessage("Status must either be active or inactive"),

    body("location")
      .trim()
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage("Location must be 3-255 characters"),
  ];
};

// result validations
const createResultsValidator = () => {
  return [
    body("results")
      .isArray({ max: 30 })
      .withMessage("Results should be an array and maximum be 30")
      .exists()
      .withMessage("Results is required"),

    body("results.*.student")
      .trim()
      .notEmpty()
      .withMessage("StudentId is required")
      .isMongoId()
      .withMessage("StudentId must be a valid mongoId"),

    body("results.*.course")
      .trim()
      .notEmpty()
      .withMessage("CourseId is required")
      .isMongoId()
      .withMessage("StudentId must be a valid mongoId"),

    body("results.*.subject")
      .trim()
      .notEmpty()
      .withMessage("Subject is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Subject must be 3-100 characters"),

    body("results.*.marks").notEmpty().withMessage("Marks is required"),

    body("results.*.examDate")
      .notEmpty()
      .withMessage("examDate is required")
      .isISO8601()
      .withMessage("examDate must be a valid iso date"),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  generateApiKeyValidator,
  changeUserRoleValidator,
  createCourseValidator,
  createMaterialValidator,
  createEnrolledValidator,
  updateEnrolledValidator,
  createAttendanceValidator,
  updateAttendanceByIdValidator,
  createAnnounceValidator,
  // updateNotificationValidator,
  createEventValidator,
  updateEventValidator,
  createResultsValidator,
};
