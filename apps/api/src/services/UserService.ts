// apps/api/src/services/UserService.ts
import User from "../models/User";
import { IUser, IUserBase } from "../types/user.types";
import { BaseService } from "./BaseService";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";
import { isEmail } from "../utils/validators";

type AllowedUpdateKeys = "username" | "profileImage" | "country" | "city" | "phone" | "email";

export type UserRole = "buyer" | "seller" | "admin" | "product_manager" | "order_manager";

export class UserService extends BaseService<IUser> {
  constructor() {
    super(User);
  }

  async findByAddress(address: string): Promise<IUser> {


    const user = await this.model.findOne({ address: address.toLowerCase() });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async verifyUser(userId: string): Promise<IUser> {
    const user = await this.findById(userId);
    user.isVerified = true;
    return user.save();
  }

  // Update by id with partial fields (generic helper)
  async updateById(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(userId, data, { new: true });
  }

  async updateReputation(userId: string, rating: number): Promise<IUser> {
    const user = await this.findById(userId);
    await user.updateReputation(rating);
    return user;
  }

  async updateTokenBalance(userId: string, amount: number): Promise<IUser> {
    const user = await this.findById(userId);
    await user.updateTokenBalance(amount);
    return user;
  }

  async createUser(userData: Partial<IUserBase>): Promise<IUser> {
    if (!userData.email || !userData.username || !userData.passwordHash) {
      throw new ValidationError("Missing required fields");
    }



    if (!isEmail(userData.email)) {
      throw new ValidationError("Invalid email format");
    }

    // Validate role if provided
    if (
      userData.role &&
      !["buyer", "seller", "admin", "product_manager", "order_manager"].includes(userData.role)
    ) {
      throw new ValidationError("Invalid role");
    }

    // If requesting admin role, check if other admins exist
    // First admin becomes super admin
    if (userData.role === "admin") {
      const existingAdmin = await this.model.findOne({ role: "admin" });
      if (!existingAdmin) {
        // First admin becomes super admin
        return this.create({
          ...userData,
          isSuperAdmin: true,
          isVerified: true,
        });
      } else {
        throw new ValidationError(
          "Admin already exists. New admins must be created by existing admin."
        );
      }
    }

    return this.create(userData);
  }

  async updateProfile(
    userId: string,
    data: Partial<Pick<IUserBase, AllowedUpdateKeys>>
  ): Promise<IUser> {
    const user = await this.findById(userId);

    const allowedUpdates: AllowedUpdateKeys[] = [
      "username",
      "profileImage",
      "country",
      "city",
      "phone",
      "email",
    ];

    const updates = Object.entries(data).reduce((acc, [key, value]) => {
      if (!allowedUpdates.includes(key as AllowedUpdateKeys)) return acc;
      if (key === "email") {
        if (typeof value === "string" && isEmail(value)) {
          acc.email = value;
        }
        return acc;
      }
      (acc as any)[key] = value as any;
      return acc;
    }, {} as Partial<IUserBase>);

    Object.assign(user, updates);
    return user.save();
  }

  async findVerifiedSellers(): Promise<IUser[]> {
    return this.model.find({
      role: "seller",
      isVerified: true,
      reputation: { $gte: 3 },
    });
  }

  async createAdmin(
    adminData: Partial<IUserBase>,
    requestingAdmin: IUser
  ): Promise<IUser> {
    // Only super admin can create other admins
    if (!requestingAdmin.isSuperAdmin) {
      throw new UnauthorizedError("Only super admin can create new admins");
    }

    // Skip the existing admin check for super admin
    return this.create({
      ...adminData,
      role: "admin" as const,
      isVerified: true,
    });
  }

  async blockUser(userId: string): Promise<IUser> {
    const user = await this.findById(userId);

    if (user.role === "admin") {
      throw new ValidationError("Cannot block admin users");
    }

    user.isBlocked = true;
    return user.save();
  }

  async unBlockUser(userId: string): Promise<IUser> {
    const user = await this.findById(userId);

    if (user.role === "admin") {
      throw new ValidationError("Cannot unblock admin users");
    }

    user.isBlocked = false;
    return user.save();
  }

  async changeUserRole(userId: string, newRole: UserRole): Promise<IUser> {
    const user = await this.findById(userId);
    user.role = newRole;

    if (newRole === "seller") {
      user.isVerified = false;
    }

    return user.save();
  }

  // Ensure user has walletId (create if missing)
  async ensureWalletId(userId: string): Promise<string> {
    const user = await this.findById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    if (user.businessInfo?.businessType === 'Wholesaler') {
      throw new ValidationError("Wholesalers cannot have a wallet ID");
    }

    if (!user.walletId) {
      const walletId = `WAL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Check for uniqueness
      const existingUser = await this.model.findOne({ walletId });
      if (existingUser) {
        // If collision, try again with different random values
        return this.ensureWalletId(userId);
      }

      // Set walletId and ensure wallet-related fields are set
      const updateData: any = {
        walletId,
        isWalletPublic: user.isWalletPublic !== undefined ? user.isWalletPublic : true,
        walletVisibility: user.walletVisibility || "public"
      };

      // Set displayName if not already set
      if (!user.displayName) {
        updateData.displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
      }

      await this.updateById(userId, updateData);
      return walletId;
    }

    return user.walletId;
  }
}
