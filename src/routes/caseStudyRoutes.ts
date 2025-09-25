import { Router } from "express";
import {
  getCaseStudies,
  getCaseStudy,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  getCaseStudiesByIndustry,
  getCaseStudiesByService,
  getCaseStudiesByImpact,
  updateCaseStudyOrder,
  toggleCaseStudyStatus,
  getCaseStudyStats,
  getFeaturedCaseStudies,
} from "../controllers/caseStudyController";
import {
  createCaseStudyValidation,
  updateCaseStudyValidation,
  getCaseStudyValidation,
  getCaseStudiesValidation,
  getCaseStudiesByIndustryValidation,
  getCaseStudiesByServiceValidation,
  getCaseStudiesByImpactValidation,
  updateCaseStudyOrderValidation,
  toggleCaseStudyStatusValidation,
  getCaseStudyStatsValidation,
  getFeaturedCaseStudiesValidation,
} from "../validators/caseStudyValidator";
import { validate } from "../middlewares/validation";
import { upload } from "../utils/multer";
import { auth } from "../middlewares/auth";

const router = Router();

// Get all case studies with filtering and pagination
router.get("/", getCaseStudiesValidation, validate, getCaseStudies);

// Get a single case study by ID
router.get("/:id", getCaseStudyValidation, validate, getCaseStudy);

// Create a new case study
router.post("/", upload.single("image"), createCaseStudyValidation, validate,auth , createCaseStudy);

// Update a case study
router.patch("/:id", upload.single("image"), updateCaseStudyValidation, validate,auth , updateCaseStudy);

// Delete a case study
router.delete("/:id", getCaseStudyValidation, validate, auth ,deleteCaseStudy);

// Get case studies by industry
router.get("/industry/:industryId", getCaseStudiesByIndustryValidation, validate, getCaseStudiesByIndustry);

// Get case studies by service
router.get("/service/:serviceId", getCaseStudiesByServiceValidation, validate, getCaseStudiesByService);

// Get case studies by impact level
router.get("/impact/:impact", getCaseStudiesByImpactValidation, validate, getCaseStudiesByImpact);

// Update case study display order
router.patch("/order", updateCaseStudyOrderValidation, validate, updateCaseStudyOrder);

// Toggle case study active status
router.patch("/:id/toggle-status", toggleCaseStudyStatusValidation, validate, auth ,toggleCaseStudyStatus);

// Get case study statistics
router.get("/stats/overview", getCaseStudyStatsValidation, validate, getCaseStudyStats);

// Get featured case studies
router.get("/featured/all", getFeaturedCaseStudiesValidation, validate, getFeaturedCaseStudies);

export default router;
