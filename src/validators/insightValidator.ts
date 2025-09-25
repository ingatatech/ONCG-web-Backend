import { body, param, query } from "express-validator";

export const createInsightValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("content")
    .trim()
    .isLength({ min: 100, max: 10000 })
    .withMessage("Content must be between 100 and 10000 characters"),

  // body("excerpt")
  //   .optional()
  //   .trim()
  //   .isLength({ min: 10, max: 500 })
  //   .withMessage("Excerpt must be between 10 and 500 characters"),


  body("industryId")
    .optional()
    .isUUID()
    .withMessage("Invalid industry ID"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("displayOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Display order must be a non-negative integer"),
];

export const updateInsightValidation = [
  param("id").isUUID().withMessage("Invalid insight ID"),

  ...createInsightValidation.map((validation) => validation.optional()),
];

export const getInsightValidation = [
  param("id").isUUID().withMessage("Invalid insight ID"),
];

export const getInsightsValidation = [
  query("industryId")
    .optional()
    .isUUID()
    .withMessage("Invalid industry ID filter"),


  query("authorId")
    .optional()
    .isUUID()
    .withMessage("Invalid author ID filter"),

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
    .isIn(["title",  "viewCount", "displayOrder", "createdAt"])
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

export const getInsightsByIndustryValidation = [
  param("industryId").isUUID().withMessage("Invalid industry ID"),
];


export const getInsightsByAuthorValidation = [
  param("authorId").isUUID().withMessage("Invalid author ID"),
];

export const getPopularInsightsValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];

export const getRecentInsightsValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];


export const updateInsightOrderValidation = [
  body("insights")
    .isArray()
    .withMessage("Insights must be an array"),

  body("insights.*.id")
    .isUUID()
    .withMessage("Invalid insight ID"),

  body("insights.*.displayOrder")
    .isInt({ min: 0 })
    .withMessage("Display order must be a non-negative integer"),
];

export const toggleInsightStatusValidation = [
  param("id").isUUID().withMessage("Invalid insight ID"),
];

export const getInsightStatsValidation = [
  // No specific validation needed for stats endpoint
];

export const getInsightCategoriesValidation = [
  // No specific validation needed for categories endpoint
];

