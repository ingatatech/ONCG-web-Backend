import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from "../controllers/partnersController";
import { upload } from "../utils/multer";
import { authAsyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", getAllPartners);
router.get("/:id", getPartnerById);
router.post("/",  upload.single("image"), authAsyncHandler(createPartner));
router.patch("/:id",  upload.single("image"),  authAsyncHandler(updatePartner));
router.delete("/:id",authAsyncHandler (deletePartner));

export default router;
