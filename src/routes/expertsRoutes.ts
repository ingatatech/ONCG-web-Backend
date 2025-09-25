import { Router } from "express"
import {
  createExpert,
  getExperts,
  getExpertById,
  updateExpert,
  deleteExpert,
  reorderExperts,
  getLeaders,
  getExpertsOnly,
} from "../controllers/expertController"
import {
  validateExpertCreation,
  validateExpertUpdate,
  validateExpertGet,
  validateExpertsGet,
  validateExpertDelete,
  validateExpertReorder,
} from "../validators/serviceValidator"
import { upload } from "../utils/multer"

const router = Router()

// Expert routes
router.post("/", upload.single("image"), validateExpertCreation, createExpert)
router.get("/", validateExpertsGet, getExperts)              // get all experts (mixed roles)
router.get("/leaders", getLeaders)                          // get only leaders
router.get("/only-experts", getExpertsOnly)               // get only experts
router.get("/:id", validateExpertGet, getExpertById)        // get one expert by id
router.patch("/:id", upload.single("image"), validateExpertUpdate, updateExpert)
router.delete("/:id", validateExpertDelete, deleteExpert)
router.put("/reorder", validateExpertReorder, reorderExperts)

export default router
