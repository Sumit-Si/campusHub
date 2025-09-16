import { body } from "express-validator";
import { AvailableUserRoles } from "../constants.js";

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
      .optional({values: "falsy"})  // -> skips: undefined, null, '', 0, false
      .trim()
      .isISO8601()
      .withMessage("ExpiresAt must be a valid iso date"),
  ]
}

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
      .isLength({min: 5,max: 100})
      .withMessage("Name must be 5-100 characters"),

    body("description")
      .trim()
      .optional()
      .isLength({min: 20, max: 5000})
      .withMessage("Description must be 20-5000 characters"),

    body("price")
      .trim()
      .notEmpty()
      .withMessage("Price is required")
      .isInt()
      .withMessage("Price must be a number"),
  ]
}

const createMaterialValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({min: 5, max: 200})
      .withMessage("Name must be 5-200 characters"),

    body("description")
      .trim()
      .optional()
      .isLength({min: 20, max: 1000})
      .withMessage("Description must be 20-1000 characters"),

    body("tags")
      .trim()
      .optional(),
  ]
}


// announcement validations
const createAnnounceValidator = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be al least 5 characters length"),

    body("message").trim(),

    body("expireAt")
      .optional()
      .isISO8601()
      .withMessage("expireAt must be a valid ISO8601 date string")
      .custom((value) => {
        const expireDate = new Date(value);
        if (expireDate <= new Date()) {
          throw new Error("expireAt must be a future date/time");
        }
        return true;
      }),
  ];
};


// result validations
const createResultsValidator = () => {
  return [
    body()
      .isArray({ max: 30 })
      .withMessage("Request body should be an array and maximum be 30"),

    body("*.studentId").trim().notEmpty().withMessage("StudentId is required"),

    body("*.courseId").trim().notEmpty().withMessage("CourseId is required"),

    body("*.subject").notEmpty().withMessage("Subject is required").trim(),

    body("*.marks").notEmpty().withMessage("Marks is required"),

    body("*.examDate").notEmpty().withMessage("examDate is required"),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  generateApiKeyValidator,
  changeUserRoleValidator,
  createCourseValidator,
  createMaterialValidator,
  createAnnounceValidator,
  createResultsValidator,
};
