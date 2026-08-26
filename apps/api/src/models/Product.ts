// src/models/Product.ts
import mongoose, { Schema } from "mongoose";
import {
  IProduct,
  ProductCondition,
  ProductStatus,
} from "../types/product.types";

const productSchema = new Schema<IProduct>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "NGN",
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: String,
    images: [
      {
        type: String,
        required: true,
      },
    ],
    condition: {
      type: String,
      enum: Object.values(ProductCondition),
      required: true,
    },
    location: {
      country: {
        type: String,
        required: true,
      },
      city: String,
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
    tags: [String],
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    views: {
      type: Number,
      default: 0, // Every new product starts with 0 views
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // Optional structured metadata for richer filtering
    brand: { type: String },
    attributes: {
      type: Map,
      of: [String],
    },
    specifications: {
      type: Schema.Types.Mixed,
    },
    shippingOptions: [
      {
        method: { type: String },
        cost: { type: Number, default: 0 },
        estimatedDays: { type: Number },
      },
    ],
    discount: { type: Number, default: 0, min: 0, max: 100 },
    bulkPricing: [
      {
        minQuantity: { type: Number, required: true, min: 1 },
        maxQuantity: { type: Number, min: 1 },
        pricePerUnit: { type: Number, min: 0 },
        discountPercent: { type: Number, min: 0, max: 100 },
      },
    ],
    variants: [
      new Schema(
        {
          sku: { type: String },
          price: { type: Number },
          quantity: { type: Number, required: true, min: 0 },
          attributes: { type: Map, of: String, required: true },
        },
        { _id: false }
      ),
    ],
    // Audit & Manager Blame Fields
    createdByAdmin: {
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

// Implement methods defined in IProductMethods
productSchema.methods.updateViews = async function (): Promise<void> {
  this.views += 1; // Increment views by 1
  await this.save(); // Save to database
};

productSchema.methods.isAvailable = async function (): Promise<boolean> {
  return this.status === ProductStatus.ACTIVE && this.quantity > 0;
};

productSchema.methods.calculateRating = async function (): Promise<number> {
  const reviews = await mongoose
    .model("ProductReview")
    .find({ product: this._id });
  if (!reviews.length) return 0;
  return (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  );
};

// Add indexes for performance
productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ discount: -1 });
productSchema.index({ rating: -1 });

// Validation middleware
productSchema.pre("save", async function (next) {
  if (this.isModified("price") && this.price < 0) {
    throw new Error("Price cannot be negative");
  }
  if (this.isModified("quantity") && this.quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }
  if (this.isModified("minOrderQuantity") && this.minOrderQuantity < 1) {
    throw new Error("Minimum order quantity must be at least 1");
  }
  next();
});

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
