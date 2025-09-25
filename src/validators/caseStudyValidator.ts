import { body, param, query } from "express-validator";

export const createCaseStudyValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage("Description must be between 50 and 2000 characters"),

  body("impact")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Impact must be between 10 and 1000 characters"),

  body("industryId")
    .optional()
    .isUUID()
    .withMessage("Invalid industry ID"),

  body("serviceId")
    .optional()
    .isUUID()
    .withMessage("Invalid service ID"),

  body("displayOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Display order must be a non-negative integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  // Custom validation to ensure at least one of industryId or serviceId is provided
  body().custom((value) => {
    if (!value.industryId && !value.serviceId) {
      throw new Error("Either industryId or serviceId must be provided");
    }
    return true;
  }),
];

export const updateCaseStudyValidation = [
  param("id").isUUID().withMessage("Invalid case study ID"),

  ...createCaseStudyValidation.map((validation) => validation.optional()),
];

export const getCaseStudyValidation = [
  param("id").isUUID().withMessage("Invalid case study ID"),
];

export const getCaseStudiesValidation = [
  query("industryId")
    .optional()
    .isUUID()
    .withMessage("Invalid industry ID filter"),

  query("serviceId")
    .optional()
    .isUUID()
    .withMessage("Invalid service ID filter"),

  query("impact")
    .optional()
    .isIn(["Low", "Medium", "High", "Transformational"])
    .withMessage("Invalid impact level filter"),

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
    .isIn(["title", "displayOrder", "impact", "createdAt"])
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

export const getCaseStudiesByIndustryValidation = [
  param("industryId").isUUID().withMessage("Invalid industry ID"),
];

export const getCaseStudiesByServiceValidation = [
  param("serviceId").isUUID().withMessage("Invalid service ID"),
];

export const getCaseStudiesByImpactValidation = [
  param("impact")
    .isIn(["Low", "Medium", "High", "Transformational"])
    .withMessage("Invalid impact level"),
];

export const updateCaseStudyOrderValidation = [
  body("caseStudies")
    .isArray()
    .withMessage("Case studies must be an array"),

  body("caseStudies.*.id")
    .isUUID()
    .withMessage("Invalid case study ID"),

  body("caseStudies.*.displayOrder")
    .isInt({ min: 0 })
    .withMessage("Display order must be a non-negative integer"),
];

export const toggleCaseStudyStatusValidation = [
  param("id").isUUID().withMessage("Invalid case study ID"),
];

export const getCaseStudyStatsValidation = [
  query("industryId")
    .optional()
    .isUUID()
    .withMessage("Invalid industry ID"),

  query("serviceId")
    .optional()
    .isUUID()
    .withMessage("Invalid service ID"),
];

export const getFeaturedCaseStudiesValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Limit must be between 1 and 20"),
];
