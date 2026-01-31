// apps/api/src/middleware/adminAuth.ts
// Express types handled by any
import { ForbiddenError } from "../utils/errors";
import { AuthRequest } from "./auth";

/**
 * Admin Authentication Middleware
 * 
 * This middleware extends the existing auth system to provide admin-specific access control.
 * It validates that the authenticated user has either:
 * - role === 'admin' 
 * - isSuperAdmin === true
 * 
 * Usage: Apply this middleware after the main auth middleware on admin routes
 * 
 * @example
 * router.get('/admin/dashboard', auth(userService), adminAuth, adminController.getDashboard);
 */
export const adminAuth = (req: any, res: any, next: any) => {
  try {
    // Ensure user is authenticated (this should be called after the main auth middleware)
    if (!req.user) {
      throw new ForbiddenError("Authentication required for admin access");
    }

    // Check if user has admin privileges
    const hasAdminRole = req.user.role === 'admin';
    const isSuperAdmin = req.user.isSuperAdmin === true;

    if (!hasAdminRole && !isSuperAdmin) {
      throw new ForbiddenError("Admin access required. Insufficient privileges.");
    }

    // Log admin access for audit purposes
    // console.log("Admin access granted:", {
    //   userId: req.user._id,
    //   username: req.user.username,
    //   role: req.user.role,
    //   isSuperAdmin: req.user.isSuperAdmin,
    //   timestamp: new Date().toISOString()
    // });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Super Admin Authentication Middleware
 * 
 * This middleware provides stricter access control for super admin operations.
 * It validates that the authenticated user has isSuperAdmin === true
 * 
 * Usage: Apply this middleware for super admin only operations
 * 
 * @example
 * router.post('/admin/system/config', auth(userService), superAdminAuth, adminController.updateSystemConfig);
 */
export const superAdminAuth = (req: any, res: any, next: any) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new ForbiddenError("Authentication required for super admin access");
    }

    // Check if user is a super admin
    if (req.user.isSuperAdmin !== true) {
      throw new ForbiddenError("Super admin access required. Insufficient privileges.");
    }

    // Log super admin access for audit purposes
    // console.log("Super admin access granted:", {
    //   userId: req.user._id,
    //   username: req.user.username,
    //   role: req.user.role,
    //   isSuperAdmin: req.user.isSuperAdmin,
    //   timestamp: new Date().toISOString()
    // });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Admin Access Middleware
 * 
 * This middleware provides flexible role-based access control for admin operations.
 * It allows you to specify which admin roles can access specific endpoints.
 * 
 * @param allowedRoles - Array of allowed roles (e.g., ['admin', 'moderator'])
 * @param requireSuperAdmin - Whether super admin access is also required
 * 
 * @example
 * router.get('/admin/users', auth(userService), roleBasedAdminAuth(['admin'], false), adminController.getUsers);
 * router.post('/admin/system', auth(userService), roleBasedAdminAuth(['admin'], true), adminController.updateSystem);
 */
export const roleBasedAdminAuth = (allowedRoles: string[], requireSuperAdmin: boolean = false) => {
  return (req: any, res: any, next: any) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new ForbiddenError("Authentication required for admin access");
      }

      // Check if user has one of the allowed roles
      const hasAllowedRole = allowedRoles.includes(req.user.role);
      const isSuperAdmin = req.user.isSuperAdmin === true;

      // If super admin access is required, check that first
      if (requireSuperAdmin && !isSuperAdmin) {
        throw new ForbiddenError("Super admin access required for this operation");
      }

      // Check role-based access
      if (!hasAllowedRole && !isSuperAdmin) {
        throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(' or ')} or super admin`);
      }

      // Log role-based admin access for audit purposes
      // console.log("Role-based admin access granted:", {
      //   userId: req.user._id,
      //   username: req.user.username,
      //   role: req.user.role,
      //   isSuperAdmin: req.user.isSuperAdmin,
      //   allowedRoles,
      //   requireSuperAdmin,
      //   timestamp: new Date().toISOString()
      // });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Product Manager Authentication Middleware
 * 
 * This middleware allows both admin and product_manager roles to access product management endpoints.
 * Product Managers have restricted access to only product-related operations.
 * 
 * Usage: Apply this middleware on product management routes
 * 
 * @example
 * router.get('/vendors/products', auth(userService), productManagerAuth, vendorController.getProducts);
 */
export const productManagerAuth = (req: any, res: any, next: any) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new ForbiddenError("Authentication required");
    }

    // Allow both admin and product_manager roles
    const hasAccess = req.user.role === 'admin' || req.user.role === 'product_manager' || req.user.isSuperAdmin === true;

    if (!hasAccess) {
      throw new ForbiddenError("Product management access required. Insufficient privileges.");
    }

    next();
  } catch (error) {
    next(error);
  }
};