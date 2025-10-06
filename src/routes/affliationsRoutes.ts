import express from "express"
import { body } from "express-validator"
import {
  createAffiliation,
  getAllAffiliations,
  getAffiliationById,
  updateAffiliation,
  deleteAffiliation,
} from "../controllers/affliationsController"

const router = express.Router()

/**
 * @route   POST /api/affiliations
 * @desc    Create a new affiliation
 * @access  Private (Admin)
 */
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("acronym").notEmpty().withMessage("Acronym is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  createAffiliation,
)

/**
 * @route   GET /api/affiliations
 * @desc    Get all affiliations
 * @access  Public
 */
router.get("/", getAllAffiliations)

/**
 * @route   GET /api/affiliations/:id
 * @desc    Get affiliation by ID
 * @access  Public
 */
router.get("/:id", getAffiliationById)

/**
 * @route   PUT /api/affiliations/:id
 * @desc    Update affiliation
 * @access  Private (Admin)
 */
router.patch("/:id", updateAffiliation)

/**
 * @route   DELETE /api/affiliations/:id
 * @desc    Delete affiliation
 * @access  Private (Admin)
 */
router.delete("/:id", deleteAffiliation)

export default router
