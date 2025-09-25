import { Router } from "express";
import {
  getInsights,
  getInsight,
  createInsight,
  updateInsight,
  deleteInsight,
  getInsightsByIndustry,
  getInsightsByAuthor,
  getPopularInsights,
  getRecentInsights,
  updateInsightOrder,
  toggleInsightStatus,
} from "../controllers/insightController";
import {
  createInsightValidation,
  updateInsightValidation,
  getInsightValidation,
  getInsightsValidation,
  getInsightsByIndustryValidation,
  getInsightsByAuthorValidation,
  getPopularInsightsValidation,
  getRecentInsightsValidation,
  updateInsightOrderValidation,
  toggleInsightStatusValidation,
} from "../validators/insightValidator";
import { validate } from "../middlewares/validation";
import { upload } from "../utils/multer";
import { auth } from "../middlewares/auth";

const router = Router();

// Get all insights with filtering and pagination
router.get("/", getInsightsValidation, validate, getInsights);

// Get a single insight by ID
router.get("/:id", getInsightValidation, validate, getInsight);

// Create a new insight
router.post("/", upload.single("image"), createInsightValidation, validate,auth , createInsight);

// Update an insight
router.patch("/:id", upload.single("image"), updateInsightValidation, validate,auth , updateInsight);

// Delete an insight
router.delete("/:id", getInsightValidation, validate,auth , deleteInsight);

// Get insights by industry
router.get("/industry/:industryId", getInsightsByIndustryValidation, validate, getInsightsByIndustry);

// Get insights by author
router.get("/author/:authorId", getInsightsByAuthorValidation, validate, getInsightsByAuthor);

// Get popular insights
router.get("/popular/all", getPopularInsightsValidation, validate, getPopularInsights);

// Get recent insights
router.get("/recent/all", getRecentInsightsValidation, validate, getRecentInsights);


// Update insight display order
router.patch("/order", updateInsightOrderValidation, validate,auth , updateInsightOrder);

// Toggle insight active status
router.patch("/:id/toggle-status", toggleInsightStatusValidation, validate,auth , toggleInsightStatus);


export default router;
