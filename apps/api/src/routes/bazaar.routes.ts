import { Router } from "express";
import { BazaarController } from "../controllers/bazaar.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/config", BazaarController.getPublicConfig);
router.post("/initialize-booking", BazaarController.initializeBooking);
router.get("/verify-payment", BazaarController.verifyPayment);
router.get("/verify-payment/:reference", BazaarController.verifyPayment);
router.post("/contact", BazaarController.submitContact);

// Admin protected routes
router.put("/admin/config", requireAuth, requireAdmin, BazaarController.updateAdminConfig);
router.get("/admin/stats", requireAuth, requireAdmin, BazaarController.getAdminStats);
router.get("/admin/bookings", requireAuth, requireAdmin, BazaarController.getAdminBookings);
router.patch("/admin/bookings/:id", requireAuth, requireAdmin, BazaarController.updateBookingStatus);
router.post("/admin/check-in", requireAuth, requireAdmin, BazaarController.checkInTicket);

export default router;
