import { Router } from "express";
import supportController from "../controllers/support.controller";

const router = Router();

// POST /api/v1/support/inquiry
// Public endpoint for contact form
router.post("/inquiry", supportController.submitInquiry);

export default router;
