import { Router } from "express";
import {
  getIndustries,
  getIndustry,
  getIndustryBySlug,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  getIndustryExperts,
  addExpertToIndustry,
  removeExpertFromIndustry,
  getIndustryCaseStudies,
  getIndustryInsights,
  toggleIndustryStatus,
  getIndustryStats,
} from "../controllers/industryController";
import {
  createIndustryValidation,
  updateIndustryValidation,
  getIndustryValidation,
  getIndustryBySlugValidation,
  getIndustriesValidation,
  addExpertValidation,
  removeExpertValidation,
  getIndustryCaseStudiesValidation,
  getIndustryInsightsValidation,
  toggleIndustryStatusValidation,
  getIndustryStatsValidation,
} from "../validators/industryValidator";
import { validate } from "../middlewares/validation";
import { auth } from "../middlewares/auth";

const router = Router();

// Get all industries with filtering and pagination
router.get("/", getIndustriesValidation, validate, getIndustries);

// Get a single industry by ID
router.get("/:id", getIndustryValidation, validate, getIndustry);

// Get industry by slug
router.get("/slug/:slug", getIndustryBySlugValidation, validate, getIndustryBySlug);

// Create a new industry
router.post("/", createIndustryValidation, validate, createIndustry);

// Update an industry
router.patch("/:id", updateIndustryValidation, validate,auth , updateIndustry);

// Delete an industry
router.delete("/:id", getIndustryValidation, validate,auth , deleteIndustry);

// Get industry experts
router.get("/:id/experts", getIndustryValidation, validate, getIndustryExperts);

// Add expert to industry
router.post("/:id/experts", addExpertValidation, validate, auth ,addExpertToIndustry);

// Remove expert from industry
router.delete("/:id/experts/:expertId", removeExpertValidation, validate,auth , removeExpertFromIndustry);

// Get industry case studies
router.get("/:id/case-studies", getIndustryCaseStudiesValidation, validate, getIndustryCaseStudies);

// Get industry insights
router.get("/:id/insights", getIndustryInsightsValidation, validate, getIndustryInsights);

// Toggle industry active status
router.patch("/:id/toggle-status", toggleIndustryStatusValidation, validate,auth , toggleIndustryStatus);

// Get industry statistics
router.get("/:id/stats", getIndustryStatsValidation, validate, getIndustryStats);

export default router;
