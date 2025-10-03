import { body, param, query } from "express-validator";

export const createServiceValidation = [
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

  body("serviceDescription")
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage("Service description must be between 50 and 2000 characters"),

  body("categoryId")
    .isUUID()
    .withMessage("Invalid category ID"),

  body("expertIds")
    .optional()
    .isArray()
    .withMessage("Expert IDs must be an array"),

  body("expertIds.*")
    .optional()
    .isUUID()
    .withMessage("Each expert ID must be a valid UUID"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  body("experts")
    .optional()
    .isArray()
    .withMessage("Experts must be an array"),


  body("experts.*.sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Expert sort order must be a non-negative integer"),

  body("caseStudies")
    .optional()
    .isArray()
    .withMessage("Case studies must be an array"),

  body("caseStudies.*.title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Case study title must be between 5 and 200 characters"),

  body("caseStudies.*.description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("Case study description must be between 50 and 2000 characters"),

  body("caseStudies.*.impact")
    .optional()
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage("Case study impact must be between 10 and 1000 characters"),

  body("caseStudies.*.displayOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Case study display order must be a non-negative integer"),

  body("caseStudies.*.isActive")
    .optional()
    .isBoolean()
    .withMessage("Case study isActive must be a boolean"),


];

export const updateServiceValidation = [
  param("id").isUUID().withMessage("Invalid service ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9\s\-&.,()]+$/)
    .withMessage("Name can only contain letters, numbers, spaces, hyphens, ampersands, periods, commas, and parentheses"),

  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Slug must be between 2 and 100 characters")
    .matches(/^[a-z0-9\-]+$/)
    .withMessage("Slug can only contain lowercase letters, numbers, and hyphens"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Title must be between 2 and 150 characters"),

  body("serviceDescription")
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage("Service description must be between 50 and 2000 characters"),
  body("categoryId")
    .optional()
    .isUUID()
    .withMessage("Invalid category ID"),

  body("expertIds")
    .optional()
    .isArray()
    .withMessage("Expert IDs must be an array"),

  body("expertIds.*")
    .optional()
    .isUUID()
    .withMessage("Each expert ID must be a valid UUID"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

export const getServiceValidation = [
  param("id").isUUID().withMessage("Invalid service ID"),
];

export const getServiceBySlugValidation = [
  param("slug")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Slug must be between 2 and 100 characters")
    .matches(/^[a-z0-9\-]+$/)
    .withMessage("Invalid slug format"),
];



export const addExpertValidation = [
  param("id").isUUID().withMessage("Invalid service ID"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

export const removeExpertValidation = [
  param("id").isUUID().withMessage("Invalid service ID"),
  param("expertId").isUUID().withMessage("Invalid expert ID"),
];

export const getServiceCaseStudiesValidation = [
  param("id").isUUID().withMessage("Invalid service ID"),
];


export const toggleServiceStatusValidation = [
  param("id").isUUID().withMessage("Invalid service ID"),
];

export const getServiceStatsValidation = [
  param("id").isUUID().withMessage("Invalid service ID"),
];

// Category Validations
export const createCategoryValidation = [
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

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

export const updateCategoryValidation = [
  param("id").isUUID().withMessage("Invalid category ID"),

  ...createCategoryValidation.map((validation) => validation.optional()),
];

export const getCategoryValidation = [
  param("id").isUUID().withMessage("Invalid category ID"),
];

export const deleteCategoryValidation = [
  param("id").isUUID().withMessage("Invalid category ID"),
];




// Expert Validations
export const validateExpertCreation = [
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
    .isLength({ min: 2, max: 200 })
    .withMessage("Education must be between 2 and 200 characters"),

  body("experience")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Experience must be between 5 and 500 characters"),

  body("bio")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Bio must be between 10 and 1000 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format"),


  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

export const validateExpertUpdate = [
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
    .isLength({ min: 2, max: 150 })
    .withMessage("Title must be between 2 and 150 characters"),

  body("credentials")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Credentials must be between 2 and 200 characters"),

  body("experience")
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Experience must be between 5 and 500 characters"),

  body("specialization")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Specialization must be between 2 and 100 characters"),

  body("bio")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Bio must be between 10 and 1000 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

export const validateExpertGet = [
  param("id").isUUID().withMessage("Invalid expert ID"),
];

export const validateExpertsGet = [
  query("specialization")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Specialization filter must be between 2 and 100 characters"),

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
    .isIn(["name", "title", "specialization", "sortOrder", "createdAt"])
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

export const validateExpertDelete = [
  param("id").isUUID().withMessage("Invalid expert ID"),
];

export const validateExpertReorder = [
  body("expertIds")
    .isArray({ min: 1 })
    .withMessage("Expert IDs must be an array with at least one ID"),

  body("expertIds.*")
    .isUUID()
    .withMessage("Each expert ID must be a valid UUID"),
];

export const validateExpertBySpecialization = [
  param("specialization")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Specialization must be between 2 and 100 characters"),
];