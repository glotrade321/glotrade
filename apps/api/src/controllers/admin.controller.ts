// apps/api/src/controllers/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AdminService, UserManagementFilters, VendorManagementFilters } from '../services/AdminService';
import { CreditService } from '../services/CreditService';
import { AuthRequest } from '../middleware/auth';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors';

export class AdminController {
  private adminService: AdminService;
  private creditService: CreditService;

  constructor() {
    this.adminService = new AdminService();
    this.creditService = new CreditService();
  }

  // ==================== DASHBOARD ENDPOINTS ====================

  /**
   * GET /api/v1/admin/dashboard
   * Get comprehensive platform metrics for admin dashboard
   */
  getDashboard = async (req: any, res: any, next: any) => {
    try {
      const metrics = await this.adminService.getDashboardMetrics();

      res.status(200).json({
        status: 'success',
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/dashboard/health
   * Get platform health metrics
   */
  getPlatformHealth = async (req: any, res: any, next: any) => {
    try {
      const health = await this.adminService.getPlatformHealth();

      res.status(200).json({
        status: 'success',
        data: health
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/dashboard/categories
   * Get category statistics
   */
  getCategoryStats = async (req: any, res: any, next: any) => {
    try {
      const stats = await this.adminService.getCategoryStats();

      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/dashboard/sales-timeseries
   * Get sales time-series data for charts
   */
  getSalesTimeSeries = async (req: any, res: any, next: any) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const timeSeriesData = await this.adminService.getSalesTimeSeries(days);

      res.status(200).json({
        status: 'success',
        data: timeSeriesData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/dashboard/user-growth
   * Get user growth analytics
   */
  getUserGrowthAnalytics = async (req: any, res: any, next: any) => {
    try {
      const growthData = await this.adminService.getUserGrowthAnalytics();

      res.status(200).json({
        status: 'success',
        data: growthData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/dashboard/top-vendors
   * Get top performing vendors
   */
  getTopVendors = async (req: any, res: any, next: any) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topVendors = await this.adminService.getTopVendors(limit);

      res.status(200).json({
        status: 'success',
        data: topVendors
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/dashboard/top-products
   * Get top performing products
   */
  getTopProducts = async (req: any, res: any, next: any) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topProducts = await this.adminService.getTopProducts(limit);

      res.status(200).json({
        status: 'success',
        data: topProducts
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/dashboard/performance
   * Get platform performance metrics
   */
  getPlatformPerformance = async (req: any, res: any, next: any) => {
    try {
      const performance = await this.adminService.getPlatformPerformance();

      res.status(200).json({
        status: 'success',
        data: performance
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get geographic distribution analytics
   */
  getGeographicDistribution = async (req: any, res: any, next: any) => {
    try {
      const geographicData = await this.adminService.getGeographicDistribution();
      res.status(200).json({
        status: 'success',
        data: geographicData
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== USER MANAGEMENT ENDPOINTS ====================

  /**
   * GET /api/v1/admin/users
   * Get users with advanced filtering and pagination
   */
  getUsers = async (req: any, res: any, next: any) => {
    try {
      const filters: UserManagementFilters = {
        role: req.query.role as string,
        isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
        isBlocked: req.query.isBlocked === 'true' ? true : req.query.isBlocked === 'false' ? false : undefined,
        isSuperAdmin: req.query.isSuperAdmin === 'true' ? true : req.query.isSuperAdmin === 'false' ? false : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        businessType: req.query.businessType as string
      };

      const result = await this.adminService.getUsersWithFilters(filters, req.user);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/users/:id
   * Update user information
   */
  updateUser = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      const { firstName, lastName, email, phone, country } = req.body;

      await this.adminService.updateUser(userId, { firstName, lastName, email, phone, country }, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/users/:id
   * Get specific user details
   */
  getUserById = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      const user = await this.adminService.findById(userId);

      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/users/:id/role
   * Update user role
   */
  updateUserRole = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;

      if (!role) {
        throw new ValidationError('Role is required');
      }

      const updatedUser = await this.adminService.updateUserRole(userId, role, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'User role updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/users/:id/block
   * Block or unblock user
   */
  toggleUserBlock = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      const { blocked } = req.body;

      if (typeof blocked !== 'boolean') {
        throw new ValidationError('Blocked status must be a boolean');
      }

      const updatedUser = await this.adminService.toggleUserBlock(userId, blocked, req.user!);

      res.status(200).json({
        status: 'success',
        message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/users/:id/verify
   * Verify user account
   */
  verifyUser = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      const updatedUser = await this.adminService.verifyUser(userId, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'User verified successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/users/:id/verify-business
   * Verify business account
   */
  verifyBusiness = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      const updatedUser = await this.adminService.verifyBusiness(userId, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'Business account verified successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/users/:id/credit
   * Update user credit settings
   */
  updateCreditSettings = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      const { creditLimit, paymentTerms } = req.body;

      if (creditLimit === undefined || !paymentTerms) {
        throw new ValidationError('Credit limit and payment terms are required');
      }

      const updatedUser = await this.creditService.updateCreditSettings(userId, creditLimit, paymentTerms);

      res.status(200).json({
        status: 'success',
        message: 'Credit settings updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/admin/users/:id
   * Soft delete user account (admin deactivation)
   */
  deleteUser = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      const { reason } = req.body;
      await this.adminService.deleteUser(userId, req.user!, reason);

      res.status(200).json({
        status: 'success',
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/admin/users/:id/restore
   * Restore soft-deleted user account
   */
  restoreUser = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      await this.adminService.restoreUser(userId, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'User restored successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/admin/users/:id/permanent
   * Permanently delete user (after retention period)
   */
  permanentlyDeleteUser = async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id;
      await this.adminService.permanentlyDeleteUser(userId, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'User permanently deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/users/deleted
   * Get deleted users with filtering and pagination
   */
  getDeletedUsers = async (req: any, res: any, next: any) => {
    try {
      const filters: UserManagementFilters = {
        role: req.query.role as string,
        isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
        isBlocked: req.query.isBlocked === 'true' ? true : req.query.isBlocked === 'false' ? false : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.adminService.getDeletedUsers(filters, req.user);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== VENDOR MANAGEMENT ENDPOINTS ====================

  /**
   * GET /api/v1/admin/vendors
   * Get vendors with advanced filtering and pagination
   */
  getVendors = async (req: any, res: any, next: any) => {
    try {
      const filters: VendorManagementFilters = {
        isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
        hasStore: req.query.hasStore === 'true' ? true : req.query.hasStore === 'false' ? false : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.adminService.getVendorsWithFilters(filters);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/vendors/:id
   * Get specific vendor details
   */
  getVendorById = async (req: any, res: any, next: any) => {
    try {
      const vendorId = req.params.id;
      const vendor = await this.adminService.findById(vendorId);

      res.status(200).json({
        status: 'success',
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/vendors/:id/performance
   * Get vendor performance metrics
   */
  getVendorPerformance = async (req: any, res: any, next: any) => {
    try {
      const vendorId = req.params.id;
      const performance = await this.adminService.getVendorPerformance(vendorId);

      res.status(200).json({
        status: 'success',
        data: performance
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== VENDOR MANAGEMENT ACTIONS ====================

  /**
   * PUT /api/v1/admin/vendors/:id/verify
   * Verify a vendor
   */
  verifyVendor = async (req: any, res: any, next: any) => {
    try {
      const vendorId = req.params.id;
      await this.adminService.verifyVendor(vendorId, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'Vendor verified successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/vendors/:id/block
   * Toggle vendor block status
   */
  toggleVendorBlock = async (req: any, res: any, next: any) => {
    try {
      const vendorId = req.params.id;
      const { blocked } = req.body;

      if (typeof blocked !== 'boolean') {
        throw new ValidationError('Blocked status must be a boolean');
      }

      await this.adminService.toggleVendorBlock(vendorId, blocked, req.user!);

      res.status(200).json({
        status: 'success',
        message: `Vendor ${blocked ? 'blocked' : 'unblocked'} successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/vendors/:id/deactivate
   * Soft delete (deactivate) a vendor
   */
  deactivateVendor = async (req: any, res: any, next: any) => {
    try {
      const vendorId = req.params.id;
      const { reason } = req.body;

      if (!reason || typeof reason !== 'string') {
        throw new ValidationError('Deactivation reason is required');
      }

      await this.adminService.deactivateVendor(vendorId, reason, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'Vendor deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/admin/vendors/:id/restore
   * Restore a deactivated vendor
   */
  restoreVendor = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const result = await this.adminService.restoreVendor(id, req.user!);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/admin/vendors/:id/permanent
   * Permanently delete a vendor (super admin only)
   */
  permanentlyDeleteVendor = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const result = await this.adminService.permanentlyDeleteVendor(id, req.user!);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/vendors/:id/store
   * Update vendor store information
   */
  updateVendorStore = async (req: any, res: any, next: any) => {
    try {
      const vendorId = req.params.id;
      const { name, description, status } = req.body;

      await this.adminService.updateVendorStore(vendorId, { name, description, status }, req.user!);

      res.status(200).json({
        status: 'success',
        message: 'Vendor store updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/vendors/deactivated
   * Get deactivated vendors
   */
  getDeactivatedVendors = async (req: any, res: any, next: any) => {
    try {
      const filters: VendorManagementFilters = {
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.adminService.getDeactivatedVendors(filters);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== BULK OPERATIONS ====================

  /**
   * POST /api/v1/admin/users/bulk/verify
   * Bulk verify multiple users
   */
  bulkVerifyUsers = async (req: any, res: any, next: any) => {
    try {
      const { userIds } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new ValidationError('User IDs array is required');
      }

      const results = await Promise.allSettled(
        userIds.map(id => this.adminService.verifyUser(id, req.user!))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      res.status(200).json({
        status: 'success',
        message: `Bulk operation completed: ${successful} successful, ${failed} failed`,
        data: {
          total: userIds.length,
          successful,
          failed
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/admin/users/bulk/block
   * Bulk block/unblock multiple users
   */
  bulkToggleUserBlock = async (req: any, res: any, next: any) => {
    try {
      const { userIds, blocked } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new ValidationError('User IDs array is required');
      }

      if (typeof blocked !== 'boolean') {
        throw new ValidationError('Blocked status must be a boolean');
      }

      const results = await Promise.allSettled(
        userIds.map(id => this.adminService.toggleUserBlock(id, blocked, req.user!))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      res.status(200).json({
        status: 'success',
        message: `Bulk ${blocked ? 'block' : 'unblock'} completed: ${successful} successful, ${failed} failed`,
        data: {
          total: userIds.length,
          successful,
          failed
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== EXPORT OPERATIONS ====================

  /**
   * GET /api/v1/admin/users/export
   * Export users data (CSV format)
   */
  exportUsers = async (req: any, res: any, next: any) => {
    try {
      const filters: UserManagementFilters = {
        role: req.query.role as string,
        isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
        isBlocked: req.query.isBlocked === 'true' ? true : req.query.isBlocked === 'false' ? false : undefined,
        search: req.query.search as string,
        page: 1,
        limit: 10000 // Large limit for export
      };

      const result = await this.adminService.getUsersWithFilters(filters, req.user);

      // Convert to CSV format
      const csvData = this.convertUsersToCSV(result.users);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/vendors/export
   * Export vendors data (CSV format)
   */
  exportVendors = async (req: any, res: any, next: any) => {
    try {
      const filters: VendorManagementFilters = {
        isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
        hasStore: req.query.hasStore === 'true' ? true : req.query.hasStore === 'false' ? false : undefined,
        search: req.query.search as string,
        page: 1,
        limit: 10000 // Large limit for export
      };

      const result = await this.adminService.getVendorsWithFilters(filters);

      // Convert to CSV format
      const csvData = this.convertVendorsToCSV(result.vendors);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=vendors-export.csv');
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };

  // ==================== ORDER MANAGEMENT ENDPOINTS ====================

  /**
   * GET /api/v1/admin/orders
   * Get all orders with filtering and pagination
   */
  getOrders = async (req: any, res: any, next: any) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const search = req.query.q as string;
      const fromDate = req.query.from as string;
      const toDate = req.query.to as string;

      const result = await this.adminService.getOrders({
        page,
        limit,
        status,
        search,
        fromDate,
        toDate
      });

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/orders/stats
   * Get order statistics
   */
  getOrderStats = async (req: any, res: any, next: any) => {
    try {
      const stats = await this.adminService.getOrderStats();

      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/orders/:id
   * Get order by ID
   */
  getOrderById = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const order = await this.adminService.getOrderById(id);

      res.status(200).json({
        status: 'success',
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/orders/:id/status
   * Update order status
   */
  updateOrderStatus = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ValidationError('Status is required');
      }

      const result = await this.adminService.updateOrderStatus(id, status, req.user);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/admin/orders/:id/refund
   * Process detailed order refund with custom reason and amount
   * 
   * This endpoint is for advanced refund management where admins need to:
   * - Specify custom refund reasons
   * - Set custom refund amounts (partial refunds)
   * - Provide detailed refund documentation
   * 
   * Used by: Advanced admin features, external integrations, detailed refund workflows
   * 
   * @param {string} id - Order ID
   * @param {string} reason - Required refund reason
   * @param {number} amount - Optional custom refund amount (defaults to full order amount)
   */
  refundOrder = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const { reason, amount } = req.body;

      if (!reason) {
        throw new ValidationError('Refund reason is required');
      }

      const result = await this.adminService.refundOrder(id, reason, amount, req.user);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== HELPER METHODS ====================

  /**
   * Convert users array to CSV format
   */
  private convertUsersToCSV(users: any[]): string {
    const headers = ['ID', 'Username', 'Email', 'Role', 'Verified', 'Blocked', 'Super Admin', 'Created At'];
    const rows = users.map(user => [
      user._id,
      user.username,
      user.email,
      user.role,
      user.isVerified ? 'Yes' : 'No',
      user.isBlocked ? 'Yes' : 'No',
      user.isSuperAdmin ? 'Yes' : 'No',
      user.createdAt
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * POST /api/v1/admin/orders/:id/cancel
   * Cancel order (admin action)
   */
  cancelOrder = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;

      const result = await this.adminService.cancelOrder(id, req.user);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error: any) {
      // Return specific error messages for better frontend handling
      if (error.message === 'Order not found') {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }

      if (error.message === 'Order is already cancelled') {
        return res.status(400).json({
          status: 'error',
          message: 'This order has already been cancelled'
        });
      }

      if (error.message === 'Cannot cancel delivered order') {
        return res.status(400).json({
          status: 'error',
          message: 'Delivered orders cannot be cancelled'
        });
      }

      // For other errors, use the generic error handler
      next(error);
    }
  };

  /**
   * POST /api/v1/admin/orders/:id/refund
   * Process simple order refund (quick admin action)
   * 
   * This endpoint is for quick admin refunds from the orders management page:
   * - No request body required
   * - Uses default "Admin refund" reason
   * - Refunds full order amount
   * - Simple confirmation modal workflow
   * 
   * Used by: Admin orders page modal, quick refund actions
   * 
   * @param {string} id - Order ID
   */
  processRefund = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;

      const result = await this.adminService.processRefund(id, req.user);

      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Order refund processed successfully'
      });
    } catch (error: any) {
      // Return specific error messages for better frontend handling
      if (error.message === 'Order not found') {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }

      if (error.message === 'Order is already refunded') {
        return res.status(400).json({
          status: 'error',
          message: 'This order has already been refunded'
        });
      }

      if (error.message === 'Can only refund delivered orders') {
        return res.status(400).json({
          status: 'error',
          message: 'Only delivered orders can be refunded'
        });
      }

      next(error);
    }
  };

  // ==================== ADMIN ROLE MANAGEMENT ENDPOINTS ====================

  /**
   * POST /api/v1/admin/promote-user
   * Promote a user to admin role (super admin only)
   */
  promoteUserToAdmin = async (req: any, res: any, next: any) => {
    try {
      // Verify requester is super admin
      if (!req.user?.isSuperAdmin) {
        throw new UnauthorizedError("Only super admins can promote users");
      }

      const { userId } = req.body;

      if (!userId) {
        throw new ValidationError("userId is required");
      }

      // Find user to promote
      const user = await this.adminService.findById(userId);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Check if user is already an admin
      if (user.role === "admin") {
        return res.status(200).json({
          status: "success",
          message: "User is already an admin",
          data: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            isSuperAdmin: user.isSuperAdmin
          }
        });
      }

      // Promote user to admin
      await this.adminService.updateUserRole(userId, "admin", req.user);

      const updatedUser = await this.adminService.findById(userId);

      res.status(200).json({
        status: "success",
        message: "User promoted to admin successfully",
        data: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role,
          isSuperAdmin: updatedUser.isSuperAdmin
        }
      });
    } catch (e) {
      next(e);
    }
  };

  /**
   * POST /api/v1/admin/demote-user
   * Demote an admin to buyer role (super admin only)
   */
  demoteUserFromAdmin = async (req: any, res: any, next: any) => {
    try {
      // Verify requester is super admin
      if (!req.user?.isSuperAdmin) {
        throw new UnauthorizedError("Only super admins can demote users");
      }

      const { userId } = req.body;

      if (!userId) {
        throw new ValidationError("userId is required");
      }

      // Find user to demote
      const user = await this.adminService.findById(userId);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Prevent demoting super admins
      if (user.isSuperAdmin) {
        throw new ValidationError("Cannot demote super admin");
      }

      // Check if user is not an admin
      if (user.role !== "admin") {
        return res.status(200).json({
          status: "success",
          message: "User is not an admin",
          data: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
          }
        });
      }

      // Demote user to buyer
      await this.adminService.updateUserRole(userId, "buyer", req.user);

      const updatedUser = await this.adminService.findById(userId);

      res.status(200).json({
        status: "success",
        message: "User demoted to buyer successfully",
        data: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role
        }
      });
    } catch (e) {
      next(e);
    }
  };

  /**
   * GET /api/v1/admin/list-admins
   * List all admin users (admin access required)
   */
  listAdminUsers = async (req: any, res: any, next: any) => {
    try {
      // Verify requester is admin
      if (req.user?.role !== "admin" && !req.user?.isSuperAdmin) {
        throw new UnauthorizedError("Only admins can view admin list");
      }

      const admins = await this.adminService.getUsersWithFilters({
        role: "admin",
        page: 1,
        limit: 1000
      }, req.user);

      res.status(200).json({
        status: "success",
        data: {
          admins: admins.users,
          total: admins.total
        }
      });
    } catch (e) {
      next(e);
    }
  };

  /**
   * GET /api/v1/admin/stats
   * Get admin statistics (admin access required)
   */
  getAdminStatistics = async (req: any, res: any, next: any) => {
    try {
      // Verify requester is admin
      if (req.user?.role !== "admin" && !req.user?.isSuperAdmin) {
        throw new UnauthorizedError("Only admins can view statistics");
      }

      const [allAdmins, superAdmins] = await Promise.all([
        this.adminService.getUsersWithFilters({ role: "admin", page: 1, limit: 1000 }, req.user),
        this.adminService.getUsersWithFilters({ role: "admin", isSuperAdmin: true, page: 1, limit: 1000 }, req.user)
      ]);

      res.status(200).json({
        status: "success",
        data: {
          totalAdmins: allAdmins.total,
          superAdmins: superAdmins.total,
          regularAdmins: allAdmins.total - superAdmins.total
        }
      });
    } catch (e) {
      next(e);
    }
  };

  // ==================== HELPER METHODS ====================

  /**
   * Convert vendors array to CSV format
   */
  private convertVendorsToCSV(vendors: any[]): string {
    if (vendors.length === 0) return '';

    const headers = ['ID', 'Username', 'Email', 'Store Name', 'Verified', 'Blocked', 'Created At'];
    const rows = vendors.map(vendor => [
      vendor._id,
      vendor.username,
      vendor.email,
      vendor.store?.name || 'N/A',
      vendor.isVerified ? 'Yes' : 'No',
      vendor.isBlocked ? 'Yes' : 'No',
      new Date(vendor.createdAt).toISOString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
} 