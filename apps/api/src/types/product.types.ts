import { Document, Schema } from "mongoose";

// Enums
export enum ProductCondition {
  NEW = "new",
  USED = "used",
  REFURBISHED = "refurbished",
}

export enum ProductStatus {
  ACTIVE = "active",
  SOLD = "sold",
  SUSPENDED = "suspended",
}

// Product-related interfaces
export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  location?: string;
  sort?: string;
  page?: number;
  limit?: number;
  // Extended filters
  brand?: string;
  ratingMin?: number;
  verifiedSeller?: boolean;
  freeShipping?: boolean;
  etaMaxDays?: number;
  discountMin?: number;
  attributes?: Record<string, string | string[]>;
  // Time window filter: fetch items created within last N days
  createdSinceDays?: number;
  sellerId?: string;
}

export interface ProductAnalytics {
  views: number;
  likes: number;
  totalSales: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
  conversionRate: number;
  viewsOverTime: {
    date: Date;
    count: number;
  }[];
  salesOverTime: {
    date: Date;
    count: number;
    revenue: number;
  }[];
}

export interface IProductAdminActor {
  adminId?: string;
  name?: string;
  email?: string;
  role?: string;
  at?: Date;
  action?: string;
}

export interface IProductAuditLogEntry {
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

export interface IProductBase {
  seller: Schema.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  images: string[];
  condition: ProductCondition;
  location: {
    country: string;
    city?: string;
    coordinates?: [number, number];
  };
  status: ProductStatus;
  tags: string[];
  quantity: number;
  minOrderQuantity: number;
  views: number;
  likes: number;
  rating?: number;
  featured?: boolean;
  brand?: string;
  attributes?: Record<string, string | string[]>;
  specifications?: Record<string, any>;
  shippingOptions?: {
    method: string;
    cost: number;
    estimatedDays: number;
  }[];
  discount?: number;
  bulkPricing?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    pricePerUnit?: number;
    discountPercent?: number;
  }>;
  variants?: Array<{
    sku?: string;
    price?: number; // optional override
    quantity: number;
    attributes: Record<string, string>;
  }>;
  // Audit & Manager Blame Fields
  createdByAdmin?: IProductAdminActor;
  lastModifiedByAdmin?: IProductAdminActor;
  auditLogs?: IProductAuditLogEntry[];
}

export interface IProductMethods {
  updateViews(): Promise<void>;
  isAvailable(): Promise<boolean>;
  calculateRating(): Promise<number>;
}

export interface IProduct extends IProductBase, Document {
  createdAt: Date;
  updatedAt: Date;
  updateViews(): Promise<void>;
  isAvailable(): Promise<boolean>;
  calculateRating(): Promise<number>;
}
