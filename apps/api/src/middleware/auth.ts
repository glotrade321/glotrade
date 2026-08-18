// Express types handled by any
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors";
import { UserService } from "../services/UserService";
import { IUser } from "../types/user.types";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define our JWT payload interface
interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: IUser; // Use IUser instead of any
}

export const auth = (userService: UserService) => {
  return async (req: any, res: any, next: any) => {
    try {
      let token: string;
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (!token) {
        throw new UnauthorizedError("Not authorized to access this route");
      }
      console.log("Auth middleware received token:", token); // Debug log

      if (!token) {
        throw new UnauthorizedError("Invalid token");
      }

      // JWT token authentication
      let user: IUser;
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      // console.log("Auth middleware verifying with secret length:", JWT_SECRET.length); // Debug log

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        // console.log("Auth middleware: Token verified successfully. User ID:", decoded.id);

        if (!decoded.id) {
          throw new UnauthorizedError("Invalid JWT token payload");
        }

        user = await userService.findById(decoded.id);
      } catch (jwtError: any) {
        // console.log("Auth middleware: JWT verification failed:", jwtError.message);
        // console.log("Secret used length:", JWT_SECRET.length);
        throw new UnauthorizedError("Invalid JWT token");
      }
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Check if account is marked for deletion
      if (user.isDeletionRequested) {
        throw new UnauthorizedError("Account is marked for deletion. Please contact support if you need to reactivate.");
      }

      // console.log("Authenticated User:", {
      //   address: user.address,
      //   role: user.role,
      //   isSuperAdmin: user.isSuperAdmin,
      // }); // Debug log

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(`Required role: ${roles.join(" or ")}`);
    }

    next();
  };
};

// Helper function to get user ID from token
export const getUserIdFromToken = (req: any): string | null => {
  let token: string;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return null;
  }



  // If it's a JWT token, decode it and return the user ID
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded.id || null;
  } catch (jwtError: any) {
    // console.log("JWT verification failed in getUserIdFromToken:", jwtError?.message || 'Unknown JWT error');
    return null;
  }
};

// Middleware to require authentication
export const requireAuth = async (req: any, res: any, next: any) => {
  try {
    let token: string;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const userService = new UserService();
    let user;

    // JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      if (decoded.id) {
        user = await userService.findById(decoded.id);
      }
    } catch (jwtError: any) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if account is marked for deletion
    if (user.isDeletionRequested) {
      return res.status(401).json({
        status: "error",
        message: "Account is marked for deletion",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Authentication failed",
    });
  }
};

// Middleware to require admin role
export const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin" && !req.user.isSuperAdmin) {
    return res.status(403).json({
      status: "error",
      message: "Admin access required",
    });
  }

  next();
};

const userHasRole = (user: any, targetRole: string) => {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === "admin") return true;
  if (user.role === targetRole) return true;
  if (Array.isArray(user.assignedRoles) && user.assignedRoles.includes(targetRole)) return true;
  return false;
};

export const requireInsuredPartnersManager = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (!userHasRole(req.user, "insured_partners_manager")) {
    return res.status(403).json({
      status: "error",
      message: "Insured Partners management access required",
    });
  }

  next();
};

export const requireBazaarManager = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (!userHasRole(req.user, "bazaar_manager")) {
    return res.status(403).json({
      status: "error",
      message: "Bazaar management access required",
    });
  }

  next();
};

// Middleware to require super admin role
export const requireSuperAdmin = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (!req.user.isSuperAdmin) {
    return res.status(403).json({
      status: "error",
      message: "Super admin access required",
    });
  }

  next();
};
