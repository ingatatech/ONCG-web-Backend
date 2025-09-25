import { Router } from "express";
import { upload } from "../utils/multer";
import { createTestimonial, getAllTestimonials, updateApprovalStatus, deleteTestimonial, updateTestimonial } from "../controllers/testimonialController";

const router = Router();

router.post("/", upload.single("leaderImage"), createTestimonial);

router.get("/", getAllTestimonials);
router.patch("/:id/approval",  updateApprovalStatus);
router.patch("/:id", upload.single("leaderImage"), updateTestimonial);
router.delete("/:id", deleteTestimonial);
export default router;
