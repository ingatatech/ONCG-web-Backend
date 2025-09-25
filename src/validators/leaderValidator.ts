import { body, param, query } from "express-validator"

export const createLeaderValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s\-'.]+$/)
    .withMessage("Name can only contain letters, spaces, hyphens, apostrophes, and periods"),

  body("title").trim().isLength({ min: 2, max: 150 }).withMessage("Position must be between 2 and 150 characters"),

  body("department")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters"),
   

  body("bio").trim().isLength({ min: 50, max: 1000 }).withMessage("Bio must be between 50 and 1000 characters"),

  body("location").trim().isLength({ min: 2, max: 100 }).withMessage("Location must be between 2 and 100 characters"),

  body("experience").isInt({ min: 0, max: 50 }).withMessage("Experience must be between 0 and 50 years"),

  body("projectsLed").isInt({ min: 0, max: 1000 }).withMessage("Projects led must be between 0 and 1000"),

  body("email").optional().isEmail().normalizeEmail().withMessage("Invalid email format"),

  body("image").optional().isURL().withMessage("Image must be a valid URL"),

  body("specialties").optional().isLength({ max: 500 }).withMessage("Specialties must not exceed 500 characters"),

  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),

  body("displayOrder").optional().isInt({ min: 0 }).withMessage("Display order must be a non-negative integer"),
]

export const updateLeaderValidation = [
  param("id").isUUID().withMessage("Invalid leader ID"),

  ...createLeaderValidation.map((validation) => validation.optional()),
]

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
