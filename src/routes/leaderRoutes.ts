import { Router } from "express";
import * as leaderController from "../controllers/leaderController";
import {
  createLeaderValidation,
  updateLeaderValidation,
  getLeaderValidation,
  getLeadersValidation,
} from "../validators/leaderValidator";
import { authAsyncHandler } from "../utils/asyncHandler";
import { auth } from "../middlewares/auth";
import { upload } from "../utils/multer";

const router = Router();

router.post(
  "/",
  upload.single("image"),
  // createLeaderValidation,
  leaderController.createLeader
);

router.get("/", leaderController.getLeaders);

router.get("/departments", leaderController.getDepartments);


router.get("/:id", getLeaderValidation, leaderController.getLeaderById);

router.patch(
  "/:id",
  upload.single("image"),
  updateLeaderValidation,
  leaderController.updateLeader
);

router.delete("/:id", getLeaderValidation, leaderController.deleteLeader);
router.post("/reorder", authAsyncHandler(leaderController.reorderLeaders));

export default router;
