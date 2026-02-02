// src/services/MarketService.ts
import { Model, Types } from "mongoose";
import { BaseService } from "./BaseService";
import {
  IProduct,
  SearchFilters,
  ProductAnalytics,
  ProductCondition,
  ProductStatus,
} from "../types/product.types";
import { ICategory, IProductReview } from "../types/market.types";
import Product from "../models/Product";
import Category from "../models/Category";
import ProductReview from "../models/ProductReview";
import { ValidationError } from "../utils/errors";
import mongoose from "mongoose";
import { cacheService } from "./CacheService";

export class MarketService extends BaseService<IProduct> {
  protected model: Model<IProduct>;

  constructor() {
    // super(Product);
    // this.model = Product;
    super(Product as Model<IProduct>); // Explicit type casting
    this.model = Product as Model<IProduct>;
  }

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    // Validate required fields
    if (!productData.title || !productData.price || !productData.seller) {
      throw new ValidationError("Missing required product fields");
    }

    // Create product with initial values
    const product = await this.create({
      ...productData,
      views: 0,
      likes: 0,
      status: ProductStatus.ACTIVE, // Use enum value
    });

    return product;
  }

  async getProductDetails(productId: string): Promise<IProduct> {
    const product = await (this.model as any)
      .findById(productId)
      .populate({ path: "seller", select: "username store isVerified reputation" });

    if (product) {
      // Increment views count when product is viewed
      await this.model.findByIdAndUpdate(productId, { $inc: { views: 1 } });
    }

    return product as IProduct;
  }

  async updateCategory(categoryId: string, updateData: any): Promise<any> {
    const updated = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      throw new ValidationError("Category not found");
    }
    return updated as unknown as ICategory;
  }

  async featureProduct(productId: string): Promise<IProduct> {
    const product = await this.findById(productId);
    product.featured = true;
    return product.save();
  }

  async updateProduct(
    productId: string,
    sellerId: string,
    updateData: Partial<IProduct>
  ): Promise<IProduct> {
    const product = await this.findById(productId);

    if (product.seller.toString() !== sellerId) {
      throw new ValidationError("Not authorized to update this product");
    }

    return this.update(productId, updateData);
  }

  async searchProducts(filters: SearchFilters): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      condition,
      location,
      sort,
      page = 1,
      limit = 10,
      brand,
      ratingMin,
      verifiedSeller,
      freeShipping,
      etaMaxDays,
      discountMin,
      attributes,
      createdSinceDays,
      sellerId,
    } = filters;

    // Build query
    const queryObj: Record<string, any> = { status: ProductStatus.ACTIVE };

    if (query) {
      queryObj.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ];
    }

    if (category) {
      // Expand category filter to include descendants (supports name or slug input)
      try {
        const allCats = await Category.find({ isActive: true });
        const root = (allCats as any).find((c: any) => c.slug === category) ||
          (allCats as any).find((c: any) => (c.name || "") === category);
        if (root) {
          const byParent = new Map<string, any[]>();
          (allCats as any).forEach((c: any) => {
            if (!c.parentId) return;
            const list = byParent.get(c.parentId) || [];
            list.push(c);
            byParent.set(c.parentId, list);
          });
          const names: string[] = [root.name];
          const queue: string[] = [root.slug];
          while (queue.length) {
            const parentSlug = queue.shift() as string;
            const children = byParent.get(parentSlug) || [];
            for (const child of children) {
              names.push(child.name);
              queue.push(child.slug);
            }
          }
          queryObj.category = { $in: names };
        } else {
          queryObj.category = category;
        }
      } catch {
        queryObj.category = category;
      }
    }
    if (brand) queryObj.brand = brand;
    if (condition) queryObj.condition = condition;
    if (location) queryObj["location.country"] = location;
    if (sellerId) {
      try {
        queryObj["seller"] = new Types.ObjectId(String(sellerId));
      } catch {
        queryObj["seller"] = sellerId;
      }
    }
    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = minPrice;
      if (maxPrice) queryObj.price.$lte = maxPrice;
    }

    if (discountMin) {
      queryObj.discount = { $gte: discountMin };
    }

    if (createdSinceDays && createdSinceDays > 0) {
      const since = new Date();
      since.setDate(since.getDate() - createdSinceDays);
      queryObj.createdAt = { $gte: since };
    }

    if (freeShipping) {
      queryObj["shippingOptions"] = { $elemMatch: { cost: { $eq: 0 } } };
    }

    if (etaMaxDays) {
      queryObj["shippingOptions"] = queryObj["shippingOptions"] || { $elemMatch: {} };
      queryObj["shippingOptions"].$elemMatch.estimatedDays = { $lte: etaMaxDays };
    }

    if (attributes) {
      Object.entries(attributes as Record<string, string | string[]>).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          queryObj[`attributes.${key}`] = { $in: value };
        } else {
          queryObj[`attributes.${key}`] = value;
        }
      });
    }

    // Add verifiedSeller filter to the main query
    if (verifiedSeller) {
      // We'll need to use aggregation for this since it requires a join
      // For now, we'll handle it differently - fetch verified seller IDs first
      const verifiedSellers = await mongoose.model("User").find({
        role: "seller",
        isVerified: true
      }).select("_id").lean();

      const verifiedSellerIds = verifiedSellers.map(s => s._id);
      queryObj.seller = { $in: verifiedSellerIds };
    }

    // Add ratingMin filter to the main query
    if (typeof ratingMin === 'number') {
      queryObj.rating = { $gte: ratingMin };
    }

    const skip = (page - 1) * limit;
    const queryExec = this.model
      .find(queryObj)
      .sort(sort || "-createdAt") // Default sort: newest products first
      .skip(skip)
      .limit(limit)
      .populate({
        path: "seller",
        select: "username reputation role isVerified",
      });

    const [products, totalDocs] = await Promise.all([
      queryExec,
      this.model.countDocuments(queryObj),
    ]);

    return {
      products: products as unknown as IProduct[],
      total: totalDocs,
      page,
      totalPages: Math.ceil(totalDocs / limit),
    };
  }

  async getCategories(): Promise<ICategory[]> {
    const CACHE_KEY = "market:categories";
    const cached = await cacheService.get<ICategory[]>(CACHE_KEY);
    if (cached) return cached;

    const categories = await Category.find({ isActive: true }).sort("name");
    const result = categories as unknown as ICategory[];
    
    // Cache for 5 minutes
    await cacheService.set(CACHE_KEY, result, 300);
    
    return result;
  }

  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    if (!categoryData?.name) {
      throw new ValidationError("Category name is required");
    }
    const slug = (categoryData.name as string)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const created = await Category.create({ ...categoryData, slug });
    return created as unknown as ICategory;
  }

  async getPriceHistory(
    productId: string,
    period: string = "1month"
  ): Promise<{
    history: Array<{ date: Date; price: number }>;
    average: number;
    min: number;
    max: number;
  }> {
    // Implement price history tracking
    return {
      history: [],
      average: 0,
      min: 0,
      max: 0,
    };
  }

  async getFeaturedProducts(limit: number = 10): Promise<IProduct[]> {
    return this.model
      .find({ status: ProductStatus.ACTIVE, featured: true })
      .sort("-views")
      .limit(limit)
      .populate("seller", "username reputation");
  }

  async addProductReview(
    productId: string,
    userId: string,
    reviewData: { rating: number; comment?: string }
  ): Promise<IProductReview> {
    const product = await this.findById(productId);
    if (!product) {
      throw new ValidationError("Product not found");
    }
    const created = await ProductReview.create({
      product: productId,
      user: userId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });

    // Update product rating after adding review
    await this.updateProductRating(productId);

    return created as unknown as IProductReview;
  }

  async getProductReviews(
    productId: string,
    options: { page: number; limit: number }
  ): Promise<{
    reviews: IProductReview[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const query = { product: productId } as Record<string, unknown>;
    const [reviews, total] = await Promise.all([
      ProductReview.find(query)
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .populate("user", "username reputation"),
      ProductReview.countDocuments(query),
    ]);
    return {
      reviews: reviews as unknown as IProductReview[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReviewById(reviewId: string): Promise<IProductReview | null> {
    const review = await ProductReview.findById(reviewId);
    return review as unknown as IProductReview;
  }

  async updateProductReview(
    reviewId: string,
    updateData: { rating: number; comment?: string }
  ): Promise<IProductReview> {
    const updatedReview = await ProductReview.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      throw new ValidationError("Review not found");
    }

    // Update product rating after updating review
    await this.updateProductRating(updatedReview.product.toString());

    return updatedReview as unknown as IProductReview;
  }

  /**
   * Delete a product review and update product rating
   */
  async deleteProductReview(reviewId: string): Promise<void> {
    const review = await ProductReview.findById(reviewId);
    if (!review) {
      throw new ValidationError("Review not found");
    }

    const productId = review.product.toString();
    await ProductReview.findByIdAndDelete(reviewId);

    // Update product rating after deleting review
    await this.updateProductRating(productId);
  }

  async getUserReviews(
    userId: string,
    options: { page: number; limit: number }
  ): Promise<{
    reviews: IProductReview[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      ProductReview.find({ user: userId })
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .populate("product", "title images")
        .populate("user", "username"),
      ProductReview.countDocuments({ user: userId }),
    ]);

    return {
      reviews: reviews as unknown as IProductReview[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSellerProducts(
    sellerId: string,
    options: {
      status?: string;
      page: number;
      limit: number;
    }
  ): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { status, page = 1, limit = 10 } = options;
    const query: any = { seller: sellerId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.model.find(query).sort("-createdAt").skip(skip).limit(limit),
      this.model.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductAnalytics(productId: string): Promise<ProductAnalytics> {
    const product = await this.findById(productId);
    // Implement analytics calculation
    return {
      views: product.views,
      likes: product.likes,
      totalSales: 0,
      revenue: 0,
      averageRating: 0,
      reviewCount: 0,
      conversionRate: 0,
      viewsOverTime: [],
      salesOverTime: [],
    };
  }

  async getRecommendations(
    productId: string,
    options: { limit?: number; recentBrands?: string[]; recentCategories?: string[] } = {}
  ): Promise<IProduct[]> {
    const { limit = 12, recentBrands = [], recentCategories = [] } = options;

    const current = await this.model.findById(productId);
    if (!current) {
      throw new ValidationError("Product not found");
    }

    const candidateSets: IProduct[][] = [];

    // 1) Similar category
    const sameCategory = await this.model
      .find({ status: ProductStatus.ACTIVE, category: current.category, _id: { $ne: current._id } })
      .sort("-views")
      .limit(Math.ceil(limit / 2));
    candidateSets.push(sameCategory);

    // 2) Same brand if available
    if ((current as any).brand) {
      const sameBrand = await this.model
        .find({ status: ProductStatus.ACTIVE, brand: (current as any).brand, _id: { $ne: current._id } })
        .sort("-views")
        .limit(Math.ceil(limit / 3));
      candidateSets.push(sameBrand);
    }

    // 3) Sibling categories (share the same parent as current.category)
    try {
      const allCats = await Category.find({ isActive: true });
      const nameToCat = new Map<string, any>();
      const byParent = new Map<string, any[]>();
      (allCats as any).forEach((c: any) => {
        nameToCat.set(c.name, c);
        if (c.parentId) {
          const list = byParent.get(c.parentId) || [];
          list.push(c);
          byParent.set(c.parentId, list);
        }
      });
      const curCat = nameToCat.get(current.category as any);
      if (curCat && curCat.parentId) {
        const siblings = (byParent.get(curCat.parentId) || []).filter((c: any) => c.name !== current.category);
        const siblingNames = siblings.map((c: any) => c.name);
        if (siblingNames.length) {
          const siblingProducts = await this.model
            .find({ status: ProductStatus.ACTIVE, category: { $in: siblingNames } })
            .sort("-views")
            .limit(Math.ceil(limit / 3));
          candidateSets.push(siblingProducts);
        }
      }
    } catch {
      // ignore category graph failures
    }

    // 4) Recent brand/category affinities (from client hints)
    if (recentBrands.length) {
      const rb = await this.model
        .find({ status: ProductStatus.ACTIVE, brand: { $in: recentBrands }, _id: { $ne: current._id } })
        .sort("-views")
        .limit(Math.ceil(limit / 4));
      candidateSets.push(rb);
    }
    if (recentCategories.length) {
      const rc = await this.model
        .find({ status: ProductStatus.ACTIVE, category: { $in: recentCategories }, _id: { $ne: current._id } })
        .sort("-views")
        .limit(Math.ceil(limit / 4));
      candidateSets.push(rc);
    }

    // 5) Featured/trending fallback
    const featured = await this.model
      .find({ status: ProductStatus.ACTIVE, featured: true, _id: { $ne: current._id } })
      .sort("-views")
      .limit(limit);
    candidateSets.push(featured);

    // Interleave and dedupe
    const byId = new Set<string>();
    const interleaved: IProduct[] = [];
    let i = 0;
    // Find the max length among candidate arrays
    const maxLen = candidateSets.reduce((m, arr) => Math.max(m, arr.length), 0);
    while (interleaved.length < limit && i < maxLen) {
      for (const set of candidateSets) {
        const item = set[i];
        if (!item) continue;
        const idStr = (item as any)._id.toString();
        if (!byId.has(idStr)) {
          byId.add(idStr);
          interleaved.push(item);
          if (interleaved.length >= limit) break;
        }
      }
      i += 1;
    }

    return interleaved;
  }

  /**
   * Update product rating based on current reviews
   */
  async updateProductRating(productId: string): Promise<void> {
    try {
      const reviews = await ProductReview.find({ product: productId });
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      await this.model.findByIdAndUpdate(productId, { rating: averageRating });
    } catch (error) {
      console.error('Error updating product rating:', error);
    }
  }

  /**
   * Get comprehensive vendor metrics
   */
  async getVendorMetrics(sellerId: string): Promise<{
    soldCount: number;
    totalRevenue: number;
    averageRating: number;
    totalViews: number;
    activeSince: Date;
    totalProducts: number;
  }> {
    try {
      console.log(`🔍 Getting vendor metrics for sellerId: ${sellerId}`);

      // Use aggregation to calculate sold count and revenue efficiently
      const salesMetrics = await mongoose.model("Order").aggregate([
        {
          $match: {
            $or: [
              { seller: new mongoose.Types.ObjectId(sellerId) },
              { "lineItems.vendorId": new mongoose.Types.ObjectId(sellerId) }
            ],
            status: { $in: ["delivered", "shipped"] },
            paymentStatus: "completed"
          }
        },
        {
          $group: {
            _id: null,
            soldCount: { $sum: { $ifNull: ["$quantity", 1] } },
            totalRevenue: { $sum: "$totalPrice" }
          }
        }
      ]);

      const soldCount = salesMetrics.length > 0 ? salesMetrics[0].soldCount : 0;
      const totalRevenue = salesMetrics.length > 0 ? salesMetrics[0].totalRevenue : 0;

      console.log(`💰 Sold count: ${soldCount}, Revenue: ${totalRevenue}`);

      // Get product metrics using aggregation
      const productMetrics = await this.model.aggregate([
        {
          $match: { seller: new mongoose.Types.ObjectId(sellerId) }
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalRating: { $sum: { $ifNull: ["$rating", 0] } },
            totalViews: { $sum: { $ifNull: ["$views", 0] } },
            minCreatedAt: { $min: "$createdAt" }
          }
        }
      ]);

      const totalProducts = productMetrics.length > 0 ? productMetrics[0].totalProducts : 0;
      const averageRating = productMetrics.length > 0 && totalProducts > 0
        ? Math.round((productMetrics[0].totalRating / totalProducts) * 10) / 10
        : 0;
      const totalViews = productMetrics.length > 0 ? productMetrics[0].totalViews : 0;
      const activeSince = productMetrics.length > 0 ? productMetrics[0].minCreatedAt : new Date();

      const result = {
        soldCount,
        totalRevenue,
        averageRating,
        totalViews,
        activeSince,
        totalProducts
      };

      console.log(`📊 Final metrics:`, result);
      return result;
    } catch (error) {
      console.error('❌ Error getting vendor metrics:', error);
      return {
        soldCount: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalViews: 0,
        activeSince: new Date(),
        totalProducts: 0
      };
    }
  }


}
