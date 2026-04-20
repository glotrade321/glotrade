import express from "express";
import GDIPController from "../controllers/gdip.controller";
import { requireAuth, requireInsuredPartnersManager } from "../middleware/auth";

const router = express.Router();

// ==================== PARTNER ROUTES ====================

/**
 * @route   POST /api/gdip/tpia/purchase
 * @desc    Purchase a new TPIA block
 * @access  Private (Authenticated Partners)
 */
router.post("/tpia/purchase", requireAuth, GDIPController.purchaseTPIA);

/**
 * @route   GET /api/gdip/portfolio
 * @desc    Get partner's complete portfolio summary
 * @access  Private (Authenticated Partners)
 */
router.get("/portfolio", requireAuth, GDIPController.getPortfolio);

/**
 * @route   GET /api/gdip/tpias
 * @desc    Get all TPIAs owned by partner
 * @access  Private (Authenticated Partners)
 */
router.get("/tpias", requireAuth, GDIPController.getTPIAs);
router.get("/commodities/types", requireAuth, GDIPController.getCommodityTypes);

/**
 * @route   GET /api/gdip/tpia/:tpiaId
 * @desc    Get detailed information for a specific TPIA
 * @access  Private (Authenticated Partners)
 */
router.get("/tpia/:tpiaId", requireAuth, GDIPController.getTPIADetails);

/**
 * @route   GET /api/gdip/gdc/:gdcId
 * @desc    Get GDC details with all TPIAs
 * @access  Private (Authenticated Partners)
 */
router.get("/gdc/:gdcId", requireAuth, GDIPController.getGDCDetails);

/**
 * @route   PUT /api/gdip/tpia/:tpiaId/profit-mode
 * @desc    Switch TPIA profit mode between TPM (compounding) and EPS (withdrawal)
 * @access  Private (Authenticated Partners)
 */
router.put("/tpia/:tpiaId/profit-mode", requireAuth, GDIPController.switchProfitMode);

/**
 * @route   GET /api/gdip/tpia/:tpiaId/cycles
 * @desc    Get trade cycle history for a TPIA
 * @access  Private (Authenticated Partners)
 */
router.get("/tpia/:tpiaId/cycles", requireAuth, GDIPController.getTPIACycles);

/**
 * @route   GET /api/gdip/forming-gdc
 * @desc    Get the current GDC in formation (partner-accessible)
 * @access  Private (Authenticated Partners)
 */
router.get("/forming-gdc", requireAuth, GDIPController.getFormingGDC);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/gdip/admin/cycle/create
 * @desc    Create a new trade cycle for a GDC
 * @access  Private (Admin only)
 */
router.post("/admin/cycle/create", requireAuth, requireInsuredPartnersManager, GDIPController.createTradeCycle);

/**
 * @route   POST /api/gdip/admin/cycle/:cycleId/complete
 * @desc    Complete a trade cycle with profit/loss results
 * @access  Private (Admin only)
 */
router.post("/admin/cycle/:cycleId/complete", requireAuth, requireInsuredPartnersManager, GDIPController.completeTradeCycle);

/**
 * @route   POST /api/gdip/admin/cycle/:cycleId/distribute
 * @desc    Distribute profits to TPIA holders
 * @access  Private (Admin only)
 */
router.post("/admin/cycle/:cycleId/distribute", requireAuth, requireInsuredPartnersManager, GDIPController.distributeProfits);

/**
 * @route   GET /api/gdip/admin/gdcs
 * @desc    Get all GDCs (admin view)
 * @access  Private (Admin only)
 */
router.get("/admin/gdcs", requireAuth, requireInsuredPartnersManager, GDIPController.getAllGDCs);

/**
 * @route   GET /api/gdip/admin/tpias
 * @desc    Get all TPIAs (admin view)
 * @access  Private (Admin only)
 */
router.get("/admin/tpias", requireAuth, requireInsuredPartnersManager, GDIPController.getAllTPIAs);

/**
 * @route   GET /api/gdip/admin/cycles
 * @desc    Get all trade cycles (admin view)
 * @access  Private (Admin only)
 */
router.get("/admin/cycles", requireAuth, requireInsuredPartnersManager, GDIPController.getAllCycles);

/**
 * @route   GET /api/gdip/admin/cycle/:cycleId
 * @desc    Get details of a specific trade cycle
 * @access  Private (Admin only)
 */
router.get("/admin/cycle/:cycleId", requireAuth, requireInsuredPartnersManager, GDIPController.getCycleDetails);

/**
 * @route   POST /api/gdip/admin/commodities/types
 * @desc    Create a new commodity type
 * @access  Private (Admin only)
 */
router.post("/admin/commodities/types", requireAuth, requireInsuredPartnersManager, GDIPController.createCommodityType);

/**
 * @route   PATCH /api/gdip/admin/commodities/types/:id
 * @desc    Update a commodity type
 * @access  Private (Admin only)
 */
router.patch("/admin/commodities/types/:id", requireAuth, requireInsuredPartnersManager, GDIPController.updateCommodityType);

/**
 * @route   DELETE /api/gdip/admin/commodities/types/:id
 * @desc    Delete a commodity type
 * @access  Private (Admin only)
 */
router.delete("/admin/commodities/types/:id", requireAuth, requireInsuredPartnersManager, GDIPController.deleteCommodityType);

/**
 * @route   POST /api/gdip/admin/initialize-cycles
 * @desc    Initialize trade cycles for existing full GDCs
 * @access  Private (Admin only)
 */
router.post("/admin/initialize-cycles", requireAuth, requireInsuredPartnersManager, GDIPController.initializeCycles);

export default router;
