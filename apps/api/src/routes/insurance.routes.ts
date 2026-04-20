import express from "express";
import { requireAuth, requireInsuredPartnersManager } from "../middleware/auth";
import insuranceController from "../controllers/insurance.controller";
import commodityController from "../controllers/commodity.controller";

const router = express.Router();

// Public routes
router.get("/verify/:certificateNumber", insuranceController.verifyCertificate);

// All other routes require authentication
router.use(requireAuth);

// ============================================
// Insurance Routes
// ============================================

/**
 * GET /api/insurance/certificate/:tpiaId
 * Get insurance certificate for a TPIA
 */
router.get("/certificate/:tpiaId", insuranceController.getInsuranceCertificate);

/**
 * POST /api/insurance/claim/:tpiaId
 * File an insurance claim (Admin)
 */
router.post("/claim/:tpiaId", requireInsuredPartnersManager, insuranceController.fileInsuranceClaim);

/**
 * PUT /api/insurance/:insuranceId/claim/:claimNumber
 * Process an insurance claim (Admin)
 */
router.put("/:insuranceId/claim/:claimNumber", requireInsuredPartnersManager, insuranceController.processInsuranceClaim);

/**
 * GET /api/insurance/claims
 * Get all insurance claims (Admin)
 */
router.get("/claims", requireInsuredPartnersManager, insuranceController.getAllClaims);

// ============================================
// Commodity Routes
// ============================================

/**
 * PUT /api/commodity/:commodityId/price
 * Update commodity price (Admin)
 */
router.put("/commodity/:commodityId/price", requireInsuredPartnersManager, commodityController.updateCommodityPrice);

/**
 * POST /api/commodity/prices/bulk
 * Bulk update commodity prices (Admin)
 */
router.post("/commodity/prices/bulk", requireInsuredPartnersManager, commodityController.bulkUpdatePrices);

/**
 * GET /api/commodity/prices
 * Get commodity market prices
 */
router.get("/commodity/prices", commodityController.getCommodityPrices);

/**
 * GET /api/commodity/backing/:tpiaId
 * Get commodity backing for a TPIA
 */
router.get("/commodity/backing/:tpiaId", commodityController.getTPIACommodityBacking);

export default router;
