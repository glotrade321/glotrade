// src/routes/index.ts
import { Router } from "express";
import userRoutes from "./user.routes";
import paymentRoutes from "./payment.routes";
import vendorRoutes from "./vendor.routes";
import sellerRoutes from "./seller.routes";
// import payoutRoutes from "./payout.routes";
import orderRoutes from "./order.routes";
import voucherRoutes from "./voucher.routes";
import walletRoutes from "./wallet.routes";
import withdrawalRoutes from "./withdrawal.routes";
import webhookRoutes from "./webhook.routes";
import bannerRoutes from "./banner.routes";
import bazaarRoutes from "./bazaar.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/vendors", vendorRoutes);
router.use("/sellers", sellerRoutes);
// DISABLED FOR SINGLE-VENDOR PLATFORM - Uncomment to re-enable payout functionality
// router.use("/payouts", payoutRoutes);
router.use("/orders", orderRoutes);
router.use("/vouchers", voucherRoutes);
router.use("/wallets", walletRoutes);
router.use("/withdrawals", withdrawalRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/banners", bannerRoutes);
router.use("/bazaar", bazaarRoutes);

export default router;
