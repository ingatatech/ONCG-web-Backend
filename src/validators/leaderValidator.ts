import { body, param, query } from "express-validator"
export const createLeaderValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s\-.,()]+$/)
    .withMessage("Name can only contain letters, spaces, hyphens, periods, commas, and parentheses"),

  body("title")
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Title must be between 2 and 150 characters"),

  body("education")
    .trim()
    .isLength({ min: 2, max: 200000 })
    .withMessage("Education must be between 2 and 200 characters"),

  body("experience")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Experience must be between 5 and 500 characters"),

  body("bio")
    .optional()
    .trim()
    .isLength({ min: 10, max: 100000 })
    .withMessage("Bio must be between 10 and 10000 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format"),


  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

export const updateLeaderValidation = [
  param("id").isUUID().withMessage("Invalid expert ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s\-.,()]+$/)
    .withMessage("Name can only contain letters, spaces, hyphens, periods, commas, and parentheses"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 1500 })
    .withMessage("Title must be between 2 and 150 characters"),

  body("credentials")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20000 })
    .withMessage("Credentials must be between 2 and 200 characters"),

  body("experience")
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Experience must be between 5 and 500 characters"),


  body("bio")
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage("Bio must be between 10 and 10000 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

export const getLeaderValidation = [param("id").isUUID().withMessage("Invalid leader ID")]

export const getLeadersValidation = [,

  query("isActive").optional().isBoolean().withMessage("isActive filter must be a boolean"),

  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn(["name", "title", "department", "experience", "displayOrder", "createdAt"])
    .withMessage("Invalid sort field"),

  query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc"),
]
