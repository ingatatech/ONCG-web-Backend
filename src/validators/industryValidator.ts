import { body, param, query } from "express-validator";

export const createIndustryValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s\-&.,()]+$/)
    .withMessage("Name can only contain letters, numbers, spaces, hyphens, ampersands, periods, commas, and parentheses"),

  body("slug")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Slug must be between 2 and 100 characters")
    .matches(/^[a-z0-9\-]+$/)
    .withMessage("Slug can only contain lowercase letters, numbers, and hyphens"),

  body("industryDescription")
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage("Industry description must be between 50 and 2000 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const updateIndustryValidation = [
  param("id").isUUID().withMessage("Invalid industry ID"),

  ...createIndustryValidation.map((validation) => validation.optional()),
];

export const getIndustryValidation = [
  param("id").isUUID().withMessage("Invalid industry ID"),
];

export const getIndustryBySlugValidation = [
  param("slug")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Slug must be between 2 and 100 characters")
    .matches(/^[a-z0-9\-]+$/)
    .withMessage("Invalid slug format"),
];

export const getIndustriesValidation = [
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive filter must be a boolean"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn(["name", "slug", "isActive", "createdAt"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),

  query("search")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),
];

export const addExpertValidation = [
  param("id").isUUID().withMessage("Invalid industry ID"),



  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

export const removeExpertValidation = [
  param("id").isUUID().withMessage("Invalid industry ID"),
  param("expertId").isUUID().withMessage("Invalid expert ID"),
];

export const getIndustryCaseStudiesValidation = [
  param("id").isUUID().withMessage("Invalid industry ID"),
];

export const getIndustryInsightsValidation = [
  param("id").isUUID().withMessage("Invalid industry ID"),
];

export const toggleIndustryStatusValidation = [
  param("id").isUUID().withMessage("Invalid industry ID"),
];

export const getIndustryStatsValidation = [
  param("id").isUUID().withMessage("Invalid industry ID"),
];
