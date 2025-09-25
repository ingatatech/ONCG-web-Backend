import { body, validationResult } from "express-validator"
import type { Request, Response, NextFunction } from "express"

// Validation rules for creating a contact message
export const validateContactMessage = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Company name must be between 2 and 200 characters")
    .matches(/^[a-zA-Z0-9\s&.,'-]+$/)
    .withMessage("Company name contains invalid characters"),

  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Subject must be between 5 and 200 characters"),

  body("serviceInterest")
    .trim()
    .notEmpty()
    .withMessage("Service interest is required")
    .isIn(["Audit Services", "Tax Advisory", "Business Consulting", "Financial Planning", "Risk Management", "ESG Consulting", "Digital Transformation", "Other"])
    .withMessage("Please select a valid service interest"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters"),
]

// Validation rules for updating responded status
export const validateRespondedUpdate = [body("responded").isBoolean().withMessage("Responded must be a boolean value")]

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === "field" ? error.path : "unknown",
      message: error.msg,
      value: error.type === "field" ? error.value : undefined,
    }))

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    })
  }

  next()
}

// Custom validation for UUID parameters
export const validateUUID = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    })
  }

  next()
}
