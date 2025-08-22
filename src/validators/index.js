import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .trim()
      .isLowercase()
      .withMessage("Username must be lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at lease 3 characters long"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email")
      .trim()
      .isLowercase()
      .withMessage("Email must be lowercase"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be 8-20 characters length"),

    body("fullName").trim().notEmpty().withMessage("Full name is required"),
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
      .withMessage("Email must be lowercase"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be 8-20 characters length"),
  ];
};

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
  ]
}

const createAnnounceValidator = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .trim()
      .isLength({min: 5})
      .withMessage("Title must be al least 5 characters length"),

    body("message")
      .trim(),  

    body("expireAt")
    .optional()
    .isISO8601().withMessage("expireAt must be a valid ISO8601 date string")
    .custom((value) => {
      const expireDate = new Date(value);
      if (expireDate <= new Date()) {
        throw new Error("expireAt must be a future date/time");
      }
      return true;
    }),
  ]
}

const createResultsValidator = () => {
  return [
    body()
      .isArray({max: 30})
      .withMessage("Request body should be an array and maximum be 30"),
    
    body("*.studentId")
      .trim()
      .notEmpty()
      .withMessage("StudentId is required"),
    
    body("*.courseId")
      .trim()
      .notEmpty()
      .withMessage("CourseId is required"),

    body("*.subject")
      .notEmpty()
      .withMessage("Subject is required")
      .trim(),

    body("*.marks")
      .notEmpty()
      .withMessage("Marks is required"),

    body("*.examDate")
      .notEmpty()
      .withMessage("examDate is required"),
  ]
}

export { userRegisterValidator, userLoginValidator, changeUserRoleValidator, createAnnounceValidator, createResultsValidator };
