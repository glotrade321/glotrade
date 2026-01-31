// apps/api/src/types/user.types.ts
import { Document, Model } from "mongoose";

export type UserRole = "buyer" | "seller" | "admin" | "product_manager";

export interface IUserBase {
  address?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  verifyToken?: string;
  verifyTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  role: UserRole;
  isBlocked?: boolean;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  isVerified: boolean;
  reputation: number;
  profileImage?: string;
  country?: string;
  city?: string;
  totalTransactions: number;
  tokenBalance: number;
  paymentRecipients?: Record<string, string>;
  store?: {
    name?: string;
    description?: string;
    logoUrl?: string;
    payout?: { provider?: string; recipientCode?: string };
  };
  wishlist?: string[]; // product ids
  cart?: { productId: string; qty: number }[];
  addresses?: { id: string; street: string; city: string; state: string; country: string; phone: string; isDefault?: boolean }[];
  preferences?: {
    language?: string;
    currency?: string;
    country?: string;
    theme?: "light" | "dark" | "system";
  };
  passwordChangedAt?: Date;
  passwordChangeCount?: number;
  passwordChangeFailedCount?: number;
  passwordChangeLastFailedAt?: Date;
  // Account deletion fields
  deletionRequestedAt?: Date;
  deletionReason?: string;
  canDelete?: boolean; // false if has unsettled orders
  gracePeriodEndsAt?: Date;
  isDeletionRequested?: boolean;
  deletionCount?: number; // Track number of times account was deleted
  // Soft delete fields for admin management
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string; // Admin who deleted the user
  adminDeletionReason?: string; // Admin reason for deletion
  canRestore?: boolean; // Whether user can be restored
  permanentDeletionDate?: Date; // Date when user will be permanently deleted

  // Product Manager / Admin-created account fields
  createdBy?: string; // Admin who created this account
  accountCreatedByAdmin?: boolean; // Flag for admin-created accounts
  mustChangePassword?: boolean; // Force password change on first login

  // CBN Compliance - Wallet System Fields
  walletId?: string;           // "WAL-1234-ABCD" - User-friendly wallet identifier
  displayName?: string;        // "Kane4Dia" - Display name for transfers
  isWalletPublic?: boolean;    // Allow others to find by wallet ID
  walletVisibility?: "public" | "contacts" | "private"; // Wallet discovery settings
  lastSeen?: Date;             // Last activity timestamp
  isOnline?: boolean;          // Online status

  // Payment gateway integration for CBN compliance
  paystackCustomerId?: string;    // Paystack customer reference
  flutterwaveCustomerId?: string; // Flutterwave customer reference
  bankAccount?: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
    bankName: string;
  };
  kycStatus?: "unverified" | "pending" | "verified" | "rejected";
  kycLevel?: 1 | 2 | 3; // Transaction limits based on KYC level
  kycDocuments?: {
    idCard: boolean;
    utilityBill: boolean;
    bankStatement: boolean;
  };

  // B2B Business Account Fields
  accountType?: "individual" | "business";
  businessInfo?: {
    companyName?: string;
    taxId?: string;
    businessType?: "Distributor" | "Wholesaler" | "Sales Agent";
    registrationNumber?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
    verifiedBy?: string; // User ID
    website?: string;
    industry?: string;
    yearEstablished?: number;
    creditLimit?: number;
    currentCreditUsage?: number;
    paymentTerms?: "prepaid" | "net15" | "net30" | "net45" | "net60";
    // Sales Agent specific fields
    referralCode?: string;
    referredBy?: string;
    agentStats?: {
      totalReferrals: number;
      activeReferrals: number;
      totalCommissionEarned: number;
      pendingCommission: number;
      tier: "Bronze" | "Silver" | "Gold";
    };
    // Distributor specific fields
    distributorStats?: {
      nextRewardDate?: Date;
      totalRewardsEarned?: number;
      lastRewardDate?: Date;
      lastRewardAmount?: number;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  updateReputation(rating: number): Promise<void>;
  updateTokenBalance(amount: number): Promise<void>;
  canSell(): Promise<boolean>;
  canDeleteAccount(): Promise<{ canDelete: boolean; reason?: string; unsettledOrders?: number }>;
  requestAccountDeletion(reason?: string): Promise<void>;
  reactivateAccount(): Promise<void>;
}

export interface IUser extends IUserBase, Document, IUserMethods { }

export interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByAddress(address: string): Promise<IUser | null>;
  findVerifiedSellers(): Promise<IUser[]>;
  isSuperAdmin(address: string): Promise<boolean>;
}
