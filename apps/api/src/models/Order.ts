// src/models/Order.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IOrderAdminActor {
  adminId?: string;
  name?: string;
  email?: string;
  role?: string;
  at?: Date;
  action?: string;
}

export interface IOrderAuditLogEntry {
  action: string;
  performedBy?: {
    adminId?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  details?: string;
  timestamp: Date;
}

export interface IOrder extends Document {
  buyer?: Schema.Types.ObjectId;
  guestEmail?: string;
  seller?: Schema.Types.ObjectId;
  product?: Schema.Types.ObjectId;
  quantity?: number;
  totalPrice: number;
  currency: string;
  // Optional multi-vendor support
  lineItems?: Array<{
    productId: Schema.Types.ObjectId;
    vendorId: Schema.Types.ObjectId;
    qty: number;
    unitPrice: number; // in NGN (naira)
    currency: string; // default NGN
    // Snapshots to preserve product info at order time
    productTitle?: string;
    productImage?: string;
    discount?: number;
  }>;
  status:
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "disputed";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: "card" | "wallet" | "bank_transfer" | "net_terms";
  paymentTerms?: "prepaid" | "net15" | "net30" | "net45" | "net60";
  payoutStatus?: "none" | "pending" | "settled" | "partial" | "failed";
  transactionHash?: string;
  shippingDetails: {
    address: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  deliveredAt?: Date;
  // Invoice fields
  invoiceNumber?: string;
  invoiceUrl?: string;
  invoiceGeneratedAt?: Date;
  // PO fields
  purchaseOrderNumber?: string;
  poDocument?: string;
  // Audit & Manager Blame Fields
  statusUpdatedByAdmin?: IOrderAdminActor;
  refundApprovedByAdmin?: IOrderAdminActor;
  cancelledByAdmin?: IOrderAdminActor;
  lastModifiedByAdmin?: IOrderAdminActor;
  auditLogs?: IOrderAuditLogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: false },
    guestEmail: { type: String, required: false },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: false },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: false },
    quantity: { type: Number, required: false, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "NGN" },
    lineItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        vendorId: { type: Schema.Types.ObjectId, ref: "User" },
        qty: { type: Number, min: 1 },
        unitPrice: { type: Number, min: 0 },
        currency: { type: String, default: "NGN" },
        productTitle: { type: String },
        productImage: { type: String },
        discount: { type: Number, default: 0 }, // Snapshot of discount % at purchase time
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "wallet", "bank_transfer", "net_terms"],
    },
    paymentTerms: {
      type: String,
      enum: ["prepaid", "net15", "net30", "net45", "net60"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    payoutStatus: {
      type: String,
      enum: ["none", "pending", "settled", "partial", "failed"],
      default: "none",
    },
    transactionHash: String,
    shippingDetails: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      postalCode: String,
      state: String,
      phone: String,
    },
    // Invoice fields
    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceUrl: String,
    invoiceGeneratedAt: Date,
    // PO fields
    purchaseOrderNumber: { type: String, required: false },
    poDocument: { type: String, required: false },
    // Audit & Manager Blame Fields
    statusUpdatedByAdmin: {
      adminId: { type: String },
      name: { type: String },
      email: { type: String },
      role: { type: String },
      at: { type: Date },
    },
    refundApprovedByAdmin: {
      adminId: { type: String },
      name: { type: String },
      email: { type: String },
      role: { type: String },
      at: { type: Date },
    },
    cancelledByAdmin: {
      adminId: { type: String },
      name: { type: String },
      email: { type: String },
      role: { type: String },
      at: { type: Date },
    },
    lastModifiedByAdmin: {
      adminId: { type: String },
      name: { type: String },
      email: { type: String },
      role: { type: String },
      action: { type: String },
      at: { type: Date },
    },
    auditLogs: [
      {
        action: { type: String, required: true },
        performedBy: {
          adminId: { type: String },
          name: { type: String },
          email: { type: String },
          role: { type: String },
        },
        details: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Critical indexes for performance
// Index for product analytics queries (getBatchProductAnalytics)
orderSchema.index({ "lineItems.productId": 1, status: 1, paymentStatus: 1 });
orderSchema.index({ product: 1, status: 1, paymentStatus: 1 });

// Index for vendor metrics queries (getVendorMetrics)
orderSchema.index({ "lineItems.vendorId": 1, status: 1, paymentStatus: 1 });
orderSchema.index({ seller: 1, status: 1, paymentStatus: 1 });

// Index for buyer order history
orderSchema.index({ buyer: 1, createdAt: -1 });

// Index for order status tracking
orderSchema.index({ status: 1, createdAt: -1 });

// Add hooks before creating the model
orderSchema.post("save", async function (doc) {
  if (doc.buyer) {
    await mongoose
      .model("User")
      .updateOne({ _id: doc.buyer }, { $inc: { totalTransactions: 1 } });
  }
});

orderSchema.pre("save", async function (next) {
  if (this.isNew && this.product && this.quantity) {
    const product = await mongoose.model("Product").findById(this.product);
    if (!product || !(product as any).isAvailable || !(product as any).isAvailable()) {
      throw new Error("Product is not available");
    }
    if ((product as any).quantity < this.quantity) {
      throw new Error("Insufficient product quantity");
    }
  }
  next();
});

orderSchema.methods = {
  async processPayment(): Promise<void> {
    // Payment processing logic
    this.paymentStatus = "completed";
    await this.save();
  },

  async updateStatus(newStatus: string): Promise<void> {
    const validTransitions: Record<string, string[]> = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "disputed"],
      delivered: ["disputed"],
      disputed: ["cancelled", "delivered"],
    };

    if (!validTransitions[this.status].includes(newStatus)) {
      throw new Error("Invalid status transition");
    }

    this.status = newStatus;
    await this.save();
  },
};

export default mongoose.model<IOrder>("Order", orderSchema);
