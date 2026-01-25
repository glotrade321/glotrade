import express from "express";
import imageController from "../controllers/image.controller";

const router = express.Router();

// GET /api/v1/images/:key
// Example: /api/v1/images/product-123.jpg?w=400&q=80
router.get("/:key", imageController.optimize);

export default router;
