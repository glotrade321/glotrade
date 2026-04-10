// apps/api/src/models/User.ts
import mongoose, { Schema } from "mongoose";
import { IUser, IUserModel, IUserMethods } from "../types/user.types";
import {
  isEmail,
  isValidUsername,
  validators,
} from "../utils/validators";

// Create schema
const userSchema = new Schema<IUser, IUserModel>(
  {
    address: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      default: undefined, // Explicitly set default to undefined
      set: (value: any) => {
        if (value === undefined || value === null || value === '') return undefined;
        const trimmed = String(value).trim();
        return trimmed.length === 0 ? undefined : trimmed;
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    firstName: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: { type: String, required: false },
    passwordHash: { type: String, required: false },
    emailVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyTokenExpires: { type: Date },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin", "product_manager", "order_manager"],
      default: "buyer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    reputation: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    profileImage: String,
    country: {
      type: String,
      required: false,
    },
    city: String,
    totalTransactions: {
      type: Number,
      default: 0,
    },
    tokenBalance: {
      type: Number,
      default: 0,
    },
    paymentRecipients: {
      type: Object,
      default: {}, // e.g. { paystack: 'RCP_g7...' }
    },
    store: {
      name: { type: String },
      description: { type: String },
      logoUrl: { type: String },
      payout: { type: Object },
    },
    wishlist: {
      type: [String],
      default: [],
    },
    cart: {
      type: [
        new Schema(
          {
            productId: { type: String, required: true },
            qty: { type: Number, required: true, min: 1, max: 5 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    addresses: [
      new Schema(
        {
          id: { type: String, required: true },
          street: { type: String, required: true },
          city: { type: String, required: true },
          state: { type: String, required: true },
          country: { type: String, required: true },
          phone: { type: String, required: true },
          isDefault: { type: Boolean, default: false },
        },
        { _id: false }
      ),
    ],
    preferences: {
      type: Object,
      default: {},
    },
    passwordChangedAt: { type: Date },
    passwordChangeCount: { type: Number, default: 0 },
    passwordChangeFailedCount: { type: Number, default: 0 },
    passwordChangeLastFailedAt: { type: Date },
    // Account deletion fields
    deletionRequestedAt: { type: Date },
    deletionReason: { type: String },
    canDelete: { type: Boolean, default: true },
    gracePeriodEndsAt: { type: Date },
    isDeletionRequested: { type: Boolean, default: false },
    deletionCount: { type: Number, default: 0 }, // Track number of times account was deleted
    // Soft delete fields for admin management
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    // CBN Compliance - Wallet System Fields
    walletId: {
      type: String,
      unique: true,
      sparse: true,
    },
    displayName: { type: String, trim: true, maxlength: 50 },
    isWalletPublic: { type: Boolean, default: true },
    walletVisibility: {
      type: String,
      enum: ["public", "contacts", "private"],
      default: "public"
    },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },

    // Admin deletion management fields
    deletedBy: { type: String }, // Admin who deleted the user
    adminDeletionReason: { type: String }, // Admin reason for deletion
    canRestore: { type: Boolean, default: true }, // Whether user can be restored
    permanentDeletionDate: { type: Date }, // Date when user will be permanently deleted

    // Product Manager / Admin-created account fields
    createdBy: { type: String }, // Admin who created this account
    accountCreatedByAdmin: {
      type: Boolean,
      default: false
    }, // Flag for admin-created accounts
    mustChangePassword: {
      type: Boolean,
      default: false
    }, // Force password change on first login

    // Payment gateway integration for CBN compliance
    paystackCustomerId: { type: String },
    flutterwaveCustomerId: { type: String },
    bankAccount: {
      accountNumber: { type: String },
      bankCode: { type: String },
      accountName: { type: String },
      bankName: { type: String }
    },
    kycStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified"
    },
    kycLevel: {
      type: Number,
      enum: [1, 2, 3],
      default: 1
    },
    kycDocuments: {
      idCard: { type: Boolean, default: false },
      utilityBill: { type: Boolean, default: false },
      bankStatement: { type: Boolean, default: false }
    },
    // B2B Business Account Fields
    accountType: {
      type: String,
      enum: ["individual", "business"],
      default: "business"
    },
    businessInfo: {
      companyName: { type: String, trim: true },
      taxId: { type: String, trim: true },
      businessType: {
        type: String,
        enum: ["Distributor", "Wholesaler", "Sales Agent"],
        default: "Wholesaler"
      },
      registrationNumber: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
      website: { type: String, trim: true },
      industry: { type: String, trim: true },
      yearEstablished: { type: Number },
      // Credit & Terms
      creditLimit: { type: Number, default: 0 },
      currentCreditUsage: { type: Number, default: 0 },
      paymentTerms: {
        type: String,
        enum: ["prepaid", "net15", "net30", "net45", "net60"],
        default: "prepaid"
      },
      // Sales Agent specific fields
      referralCode: { type: String, uppercase: true, sparse: true, unique: true },
      referredBy: { type: String, uppercase: true },
      agentStats: {
        totalReferrals: { type: Number, default: 0 },
        activeReferrals: { type: Number, default: 0 },
        totalCommissionEarned: { type: Number, default: 0 },
        pendingCommission: { type: Number, default: 0 },
        tier: { type: String, enum: ["Bronze", "Silver", "Gold"], default: "Bronze" },
      },
      // Distributor specific fields
      distributorStats: {
        nextRewardDate: { type: Date },
        totalRewardsEarned: { type: Number, default: 0 },
        lastRewardDate: { type: Date },
        lastRewardAmount: { type: Number }
      }
    }
  },
  {
    timestamps: true,
  }
);

// Add pre-find middleware to filter out deleted users
userSchema.pre(/^find/, function (this: any, next) {
  // Only show deleted users when explicitly requested
  const query = this.getQuery ? this.getQuery() : {};
  const options = this.getOptions ? this.getOptions() : {};

  // Check if we're explicitly looking for deleted users
  if (query.isDeleted === true || options.onlyDeleted) {
    // Show only deleted users
    if (this.where) {
      this.where({ isDeleted: true });
    }
  } else if (!query.includeDeleted && !options.includeDeleted) {
    // Default behavior: exclude deleted users
    if (this.where) {
      this.where({ isDeleted: { $ne: true } });
    }
  }
  next();
});

// Wallet ID generation function
function generateWalletId(): string {
  const prefix = "WAL";
  const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const letters = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${numbers}-${letters}`;
}

// Add pre-save middleware
userSchema.pre("save", async function (next) {
  const self = this as unknown as IUser;

  // Generate wallet ID and display name for new users
  // SKIP wallet generation for Wholesalers
  const isWholesaler = this.businessInfo?.businessType === 'Wholesaler';

  if (this.isNew && !this.walletId && !isWholesaler) {
    let walletId;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure unique wallet ID
    do {
      walletId = generateWalletId();
      attempts++;
      const existingUser = await (this.constructor as any).findOne({ walletId });
      if (!existingUser) break;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error("Unable to generate unique wallet ID");
    }

    this.walletId = walletId;
  }

  // Generate display name if not provided
  if (this.isNew && !this.displayName) {
    this.displayName = `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
  }

  // Update lastSeen on every save
  this.lastSeen = new Date();

  if (this.isModified("email") && self.email && !isEmail(self.email)) {
    throw new Error("Invalid email format");
  }
  if (this.isModified("username") && self.username && !isValidUsername(self.username)) {
    throw new Error(
      "Invalid username format. Use only letters, numbers, underscore, and hyphen"
    );
  }

  if (this.isModified("country") && self.country && !validators.isValidCountry(self.country)) {
    throw new Error("Invalid country");
  }
  if (
    this.isModified("profileImage") &&
    self.profileImage &&
    !validators.isValidImageUrl(self.profileImage)
  ) {
    throw new Error("Invalid image URL format");
  }
  next();
});

// Add instance methods
userSchema.methods.updateReputation = async function (
  this: IUser,
  rating: number
): Promise<void> {
  if (!validators.isNumericPositive(rating) || rating > 5) {
    throw new Error("Invalid rating value");
  }
  const oldReputation = this.reputation * this.totalTransactions;
  const newTotalTransactions = this.totalTransactions + 1;
  this.reputation = (oldReputation + rating) / newTotalTransactions;
  await this.save();
};

userSchema.methods.canSell = async function (this: IUser): Promise<boolean> {
  return this.isVerified && this.reputation >= 3;
};

userSchema.methods.updateTokenBalance = async function (
  this: IUser,
  amount: number
): Promise<void> {
  if (!validators.isNumericPositive(this.tokenBalance + amount)) {
    throw new Error("Insufficient token balance");
  }
  this.tokenBalance += amount;
  await this.save();
};

userSchema.methods.canDeleteAccount = async function (this: IUser): Promise<{ canDelete: boolean; reason?: string; unsettledOrders?: number }> {
  // Check if user has unsettled orders
  const Order = mongoose.model('Order');
  const unsettledOrders = await Order.countDocuments({
    $or: [
      { buyer: this._id, status: { $in: ['pending', 'processing', 'shipped'] } },
      { 'lineItems.vendorId': this._id, status: { $in: ['pending', 'processing', 'shipped'] } }
    ]
  });

  if (unsettledOrders > 0) {
    return {
      canDelete: false,
      reason: `You have ${unsettledOrders} unsettled order(s). Please complete or cancel all orders before deleting your account.`,
      unsettledOrders
    };
  }

  // Check if user has pending payouts (for sellers)
  if (this.role === 'seller') {
    const Payout = mongoose.model('Payout');
    const pendingPayouts = await Payout.countDocuments({
      vendorId: this._id,
      status: { $in: ['pending', 'processing'] }
    });

    if (pendingPayouts > 0) {
      return {
        canDelete: false,
        reason: `You have ${pendingPayouts} pending payout(s). Please wait for all payouts to be processed before deleting your account.`,
        unsettledOrders: 0
      };
    }
  }

  return { canDelete: true };
};

userSchema.methods.requestAccountDeletion = async function (this: IUser, reason?: string): Promise<void> {
  const deletionCheck = await this.canDeleteAccount();

  if (!deletionCheck.canDelete) {
    throw new Error(deletionCheck.reason || 'Cannot delete account at this time');
  }

  this.deletionRequestedAt = new Date();
  this.deletionReason = reason;
  this.isDeletionRequested = true;
  this.gracePeriodEndsAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
  this.canDelete = false; // Prevent immediate deletion
  this.deletionCount = (this.deletionCount || 0) + 1; // Increment deletion count

  // Invalidate any existing auth tokens/sessions
  this.resetToken = undefined;
  this.resetTokenExpires = undefined;
  this.verifyToken = undefined;
  this.verifyTokenExpires = undefined;

  await this.save();
};

userSchema.methods.reactivateAccount = async function (this: IUser): Promise<void> {
  if (!this.isDeletionRequested) {
    throw new Error('Account is not marked for deletion');
  }

  this.deletionRequestedAt = undefined;
  this.deletionReason = undefined;
  this.isDeletionRequested = false;
  this.gracePeriodEndsAt = undefined;
  this.canDelete = true;

  await this.save();
};

// Add static methods
userSchema.static(
  "isSuperAdmin",
  async function (address: string): Promise<boolean> {
    const user = await this.findOne({
      address: address.toLowerCase(),
      role: "admin",
      isSuperAdmin: true,
    });
    return !!user;
  }
);

userSchema.static(
  "findByAddress",
  async function (address: string): Promise<IUser | null> {

    return this.findOne({ address: address.toLowerCase() });
  }
);

userSchema.static("findVerifiedSellers", async function (): Promise<IUser[]> {
  return this.find({
    role: "seller",
    isVerified: true,
    reputation: { $gte: 3 },
  });
});

// Create and export model
const User = mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;
