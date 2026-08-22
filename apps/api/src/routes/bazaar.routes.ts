import { Router } from "express";
import { BazaarController } from "../controllers/bazaar.controller";
import { requireAuth, requireBazaarManager } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/config", BazaarController.getPublicConfig);
router.post("/initialize-booking", BazaarController.initializeBooking);
router.get("/verify-payment", BazaarController.verifyPayment);
router.get("/verify-payment/:reference", BazaarController.verifyPayment);
router.post("/contact", BazaarController.submitContact);

// Admin / Manager protected routes
router.put("/admin/config", requireAuth, requireBazaarManager, BazaarController.updateAdminConfig);
router.get("/admin/stats", requireAuth, requireBazaarManager, BazaarController.getAdminStats);
router.get("/admin/bookings", requireAuth, requireBazaarManager, BazaarController.getAdminBookings);
router.post("/admin/bookings/manual", requireAuth, requireBazaarManager, BazaarController.createManualBooking);
router.patch("/admin/bookings/:id", requireAuth, requireBazaarManager, BazaarController.updateBookingStatus);
router.post("/admin/bookings/:id/resend-email", requireAuth, requireBazaarManager, BazaarController.resendConfirmationEmail);
router.post("/admin/check-in", requireAuth, requireBazaarManager, BazaarController.checkInTicket);

export default router;
