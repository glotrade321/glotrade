// src/routes/admin.routes.ts
import { Router } from "express";
import { auth } from "../middleware/auth";
import { adminAuth, superAdminAuth, roleBasedAdminAuth } from "../middleware/adminAuth";
import { UserService } from "../services/UserService";
import { AdminController } from "../controllers/admin.controller";
import { UserController } from "../controllers/user.controller";
import { WalletController } from "../controllers/wallet.controller";

const router = Router();
const userService = new UserService();
const adminController = new AdminController();
const userController = new UserController(userService);
const walletController = new WalletController();

// All routes require admin authentication
router.use(auth(userService));
router.use(adminAuth); // Use the new admin auth middleware

// ==================== DASHBOARD ENDPOINTS ====================
router.get("/dashboard", adminController.getDashboard);
router.get("/dashboard/health", adminController.getPlatformHealth);
router.get("/dashboard/categories", adminController.getCategoryStats);
router.get("/dashboard/sales-timeseries", adminController.getSalesTimeSeries);
router.get("/dashboard/user-growth", adminController.getUserGrowthAnalytics);
router.get("/dashboard/top-vendors", adminController.getTopVendors);
router.get("/dashboard/top-products", adminController.getTopProducts);
router.get("/dashboard/performance", adminController.getPlatformPerformance);
router.get("/dashboard/geographic", adminController.getGeographicDistribution);

// ==================== USER MANAGEMENT ENDPOINTS ====================
router.get("/users", adminController.getUsers);
router.get("/users/deleted", adminController.getDeletedUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/users/:id/block", adminController.toggleUserBlock);
router.put("/users/:id/verify", adminController.verifyUser);
router.put("/users/:id/verify-business", adminController.verifyBusiness);
router.put("/users/:id/credit", adminController.updateCreditSettings);
router.put("/users/:id/deactivate", adminController.deleteUser); // Soft delete via PUT
router.delete("/users/:id", adminController.deleteUser); // Keep DELETE for backward compatibility
router.post("/users/:id/restore", adminController.restoreUser);
router.delete("/users/:id/permanent", adminController.permanentlyDeleteUser);

// ==================== VENDOR MANAGEMENT ENDPOINTS ====================
router.get("/vendors", adminController.getVendors);
router.get("/vendors/deactivated", adminController.getDeactivatedVendors);
router.get("/vendors/:id", adminController.getVendorById);
router.get("/vendors/:id/performance", adminController.getVendorPerformance);
router.put("/vendors/:id/verify", adminController.verifyVendor);
router.put("/vendors/:id/block", adminController.toggleVendorBlock);
router.put("/vendors/:id/deactivate", adminController.deactivateVendor);
router.put("/vendors/:id/store", adminController.updateVendorStore);
router.post("/vendors/:id/restore", adminController.restoreVendor);
router.delete("/vendors/:id/permanent", adminController.permanentlyDeleteVendor);

// ==================== ORDER MANAGEMENT ENDPOINTS ====================
router.get("/orders", adminController.getOrders);
router.get("/orders/stats", adminController.getOrderStats);
router.get("/orders/:id", adminController.getOrderById);
router.put("/orders/:id/status", adminController.updateOrderStatus);
router.post("/orders/:id/cancel", adminController.cancelOrder);

// REFUND ENDPOINTS - Two different approaches for different use cases:
// POST /orders/:id/refund - Simple admin refund (no body required)
// Used by: Admin orders page modal for quick refunds
// Purpose: Standard admin refund action with default "Admin refund" reason
router.post("/orders/:id/refund", adminController.processRefund);

// PUT /orders/:id/refund - Detailed refund with custom parameters
// Used by: Advanced admin features, external integrations, detailed refund management
// Purpose: Custom refund with specific reason and amount
// Body: { reason: string, amount?: number }
router.put("/orders/:id/refund", adminController.refundOrder);

// Super admin order deletion endpoints
router.post("/orders/bulk-delete", superAdminAuth, adminController.bulkDeleteOrders);
router.delete("/orders/:id", superAdminAuth, adminController.deleteOrder);

// ==================== BULK OPERATIONS ====================
router.post("/users/bulk/verify", adminController.bulkVerifyUsers);
router.post("/users/bulk/block", adminController.bulkToggleUserBlock);

// ==================== EXPORT OPERATIONS ====================
router.get("/users/export", adminController.exportUsers);
router.get("/vendors/export", adminController.exportVendors);

// ==================== ADMIN ROLE MANAGEMENT ENDPOINTS ====================
// Super admin only endpoints for promoting/demoting users
router.post("/promote-user", adminController.promoteUserToAdmin);
router.post("/demote-user", adminController.demoteUserFromAdmin);
router.get("/list-admins", adminController.listAdminUsers);
router.get("/stats", adminController.getAdminStatistics);


// ==================== LEGACY ROUTES (for backward compatibility) ====================
// These routes use the old UserController methods
router.post("/create-admin", userController.createAdmin);
router.get("/users/all", userController.getAllUsers);
router.post("/users/:id/verify", userController.verifyUser);
router.post("/users/:id/block", userController.blockUser);
router.post("/users/:id/unblock", userController.unBlockUser);
router.put("/users/:id/change-role", userController.changeUserRole);

// ==================== WALLET MANAGEMENT ENDPOINTS ====================
router.get("/wallets", walletController.getAllWallets);
router.get("/wallets/stats", walletController.getWalletStats);
router.post("/wallets/:walletId/freeze", walletController.freezeWallet);
router.post("/wallets/:walletId/unfreeze", walletController.unfreezeWallet);
router.get("/wallets/:walletId/freeze-history", walletController.getWalletFreezeHistory);
router.get("/wallets/export/transactions", walletController.exportAllTransactions);

export default router;
