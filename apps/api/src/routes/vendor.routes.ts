import { Router } from "express";
import { VendorController } from "../controllers/vendor.controller";
import { auth } from "../middleware/auth";
import { adminAuth, productManagerAuth } from "../middleware/adminAuth";
import { requireApprovedVendor, requireVendorApplication } from "../middleware/vendorAuth";
import { UserService } from "../services/UserService";
import { PaystackProvider } from "../services/providers/PaystackProvider";
import { FlutterwaveBanking } from "../services/providers/FlutterwaveProvider";
import { OrangeMoneyProvider } from "../services/providers/OrangeMoneyProvider";

const router = Router();
const userService = new UserService();
const controller = new VendorController();

// All routes require auth
router.use(auth(userService));

// Become a seller / update payout recipient
router.post("/become", controller.become);

// Check vendor application status (accessible to all vendors regardless of status)
router.get("/application-status", requireVendorApplication(), controller.getApplicationStatus);

// Dashboard overview KPIs (requires approved vendor)
router.get("/overview", requireApprovedVendor(), controller.overview);

// Sales breakdown by status (requires approved vendor)
router.get("/sales-breakdown", requireApprovedVendor(), controller.salesBreakdown);

// Seller orders slice (requires approved vendor)
router.get("/orders", requireApprovedVendor(), controller.listOrders);
router.patch("/orders/:id/status", requireApprovedVendor(), controller.updateOrderStatus);
router.get("/analytics", requireApprovedVendor(), controller.analytics);

// Products CRUD (accessible by approved vendors and product managers)
router.get("/products", (req: any, res: any, next: any) => {
  // Allow both vendors and product managers
  if (req.user.role === 'product_manager' || req.user.role === 'admin' || req.user.isSuperAdmin) {
    return next();
  }
  return requireApprovedVendor()(req, res, next);
}, controller.listProducts);

router.post("/products", (req: any, res: any, next: any) => {
  if (req.user.role === 'product_manager' || req.user.role === 'admin' || req.user.isSuperAdmin) {
    return next();
  }
  return requireApprovedVendor()(req, res, next);
}, controller.createProduct);

router.put("/products/:id", (req: any, res: any, next: any) => {
  if (req.user.role === 'product_manager' || req.user.role === 'admin' || req.user.isSuperAdmin) {
    return next();
  }
  return requireApprovedVendor()(req, res, next);
}, controller.updateProduct);

router.delete("/products/:id", (req: any, res: any, next: any) => {
  if (req.user.role === 'product_manager' || req.user.role === 'admin' || req.user.isSuperAdmin) {
    return next();
  }
  return requireApprovedVendor()(req, res, next);
}, controller.deleteProduct);

// Payouts (requires approved vendor)
// DISABLED FOR SINGLE-VENDOR PLATFORM - Uncomment to re-enable payout functionality
// router.get("/payouts", requireApprovedVendor(), controller.listPayouts);

// Provider utilities (proxy)
router.get("/provider/paystack/banks", async (req: any, res: any, next: any) => {
  try { const p = new PaystackProvider(); const banks = await p.listBanks(); res.json({ status: 'success', data: banks }); } catch (e) { next(e); }
});
router.post("/provider/paystack/resolve", async (req: any, res: any, next: any) => {
  try { const { accountNumber, bankCode } = req.body || {}; const p = new PaystackProvider(); const r = await p.resolveAccount({ accountNumber, bankCode }); res.json({ status: 'success', data: r }); } catch (e) { next(e); }
});

router.get("/provider/flutterwave/banks", async (req: any, res: any, next: any) => {
  try { const { country = 'NG' } = req.query as any; const p = new FlutterwaveBanking(); const banks = await p.listBanks(String(country)); res.json({ status: 'success', data: banks }); } catch (e) { next(e); }
});

router.get("/provider/orange-money/banks", async (req: any, res: any, next: any) => {
  try { const { country = 'SN' } = req.query as any; const p = new OrangeMoneyProvider(); const banks = await p.listBanks(String(country)); res.json({ status: 'success', data: banks }); } catch (e) { next(e); }
});
router.post("/provider/flutterwave/resolve", async (req: any, res: any, next: any) => {
  try { const { accountNumber, bankCode } = req.body || {}; const p = new FlutterwaveBanking(); const r = await p.resolveAccount({ accountNumber, bankCode }); res.json({ status: 'success', data: r }); } catch (e) { next(e); }
});

router.post("/provider/orange-money/resolve", async (req: any, res: any, next: any) => {
  try { const { accountNumber, bankCode } = req.body || {}; const p = new OrangeMoneyProvider(); const r = await p.resolveAccount({ accountNumber, bankCode }); res.json({ status: 'success', data: r }); } catch (e) { next(e); }
});

// Vendor inventory management routes (requires approved vendor)
router.get("/inventory/low-stock", requireApprovedVendor(), controller.getLowStockItems);
router.post("/inventory/adjust", requireApprovedVendor(), controller.adjustStock);
router.get("/inventory/movements/:productId", requireApprovedVendor(), controller.getStockMovements);
router.post("/inventory/bulk-update", requireApprovedVendor(), controller.bulkUpdateStock);

export default router;

