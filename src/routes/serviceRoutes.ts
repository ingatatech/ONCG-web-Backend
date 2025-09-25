import { Router } from "express";
import {
  getServices,
  getService,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  getServiceExperts,
  addExpertToService,
  removeExpertFromService,
  getServiceCaseStudies,
  toggleServiceStatus,
  getServiceStats,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,

} from "../controllers/servicesController";
import {
  createServiceValidation,
  updateServiceValidation,
  getServiceValidation,
  getServiceBySlugValidation,
  addExpertValidation,
  removeExpertValidation,
  getServiceCaseStudiesValidation,
  toggleServiceStatusValidation,
  getServiceStatsValidation,
  createCategoryValidation,
  updateCategoryValidation,
  getCategoryValidation,
  deleteCategoryValidation,

} from "../validators/serviceValidator";
import { validate } from "../middlewares/validation";
import { auth } from "../middlewares/auth";

const router = Router();

// Service Routes
// Get all services with filtering and pagination
router.get("/", validate, getServices);

// Get a single service by ID
router.get("/:id", getServiceValidation, validate, getService);

// Get service by slug
router.get("/slug/:slug", getServiceBySlugValidation, validate, getServiceBySlug);

// Create a new service
router.post("/", createServiceValidation, validate, createService);
// router.post("/", validate, createService);

// Update a service
router.patch("/:id", updateServiceValidation, validate, updateService);

// Delete a service
router.delete("/:id", getServiceValidation, validate,auth , deleteService);

// Get service experts
router.get("/:id/experts", getServiceValidation, validate, getServiceExperts);

// Add expert to service
router.post("/:id/experts", addExpertValidation, validate,auth , addExpertToService);

// Remove expert from service
router.delete("/:id/experts/:expertId", removeExpertValidation, validate, removeExpertFromService);

// Get service case studies
router.get("/:id/case-studies", getServiceCaseStudiesValidation, validate, getServiceCaseStudies);



// Toggle service active status
router.patch("/:id/toggle-status", toggleServiceStatusValidation, validate,auth , toggleServiceStatus);

// Get service statistics
router.get("/:id/stats", getServiceStatsValidation, validate, getServiceStats);

// Category Routes
// Get all categories
router.get("/categories/all", getCategories);

// Create a new category
router.post("/categories", createCategoryValidation, validate,auth ,  createCategory);

// Update a category
router.patch("/categories/:id", updateCategoryValidation, validate,auth , updateCategory);
router.put("/categories/reorder", reorderCategories);

// Delete a category
router.delete("/categories/:id", deleteCategoryValidation, validate,auth , deleteCategory);

export default router;
