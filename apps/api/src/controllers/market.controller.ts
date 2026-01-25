// src/controllers/market.controller.ts
// Express types handled by any
import mongoose from "mongoose";
import { BaseController } from "./BaseController";
import { IProduct, ProductCondition } from "../types/product.types";
import { MarketService } from "../services/MarketService";
import { ValidationError } from "../utils/errors";
import { IUser } from "../types/user.types";

// Extend Request to include user
interface AuthRequest {
  user?: IUser;
  [key: string]: any;
}

interface ReviewRequest {
  body: {
    rating: number;
    comment?: string;
  };
  params: {
    productId: string;
  };
  user?: IUser;
  [key: string]: any;
}

interface SearchRequest {
  query: {
    query?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    location?: string;
    sort?: string;
    page?: string;
    limit?: string;
    brand?: string;
    ratingMin?: string;
    verifiedSeller?: string;
    freeShipping?: string;
    etaMaxDays?: string;
    discountMin?: string;
    createdSinceDays?: string;
    // dynamic attributes prefixed with attr_
    [key: string]: any;
  };
}

interface CategoryRequest {
  body: {
    name: string;
    description?: string;
    parentId?: string;
  };
  [key: string]: any;
}

interface AnalyticsRequest {
  params: {
    productId: string;
  };
  [key: string]: any;
}

interface SellerProductsRequest {
  params: {
    sellerId: string;
  };
  query: {
    status?: string;
    page?: string;
    limit?: string;
  };
  [key: string]: any;
}

interface PriceHistoryRequest {
  params: {
    productId: string;
  };
  query: {
    period?: string;
  };
  [key: string]: any;
}

export class MarketController extends BaseController<IProduct> {
  private marketService: MarketService;

  constructor() {
    const marketService = new MarketService();
    super(marketService);
    this.marketService = marketService;
  }

  // Product Listing Management
  createListing = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?._id) {
        throw new ValidationError("User not authenticated");
      }

      const productData = {
        ...req.body,
        seller: req.user._id.toString(),
      };

      const product = await this.marketService.createProduct(productData);

      res.status(201).json({
        status: "success",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  updateListing = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { id } = req.params;

      if (!req.user?._id) {
        throw new ValidationError("User not authenticated");
      }

      const product = await this.marketService.updateProduct(
        id,
        req.user._id.toString(),
        req.body
      );

      res.status(200).json({
        status: "success",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  // Search and Filtering
  searchProducts = async (
    req: SearchRequest,
    res: any,
    next: any
  ) => {
    try {
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
        createdSinceDays,
        ...rest
      } = req.query;

      const searchResults = await this.marketService.searchProducts({
        query: query as string,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        condition: condition as ProductCondition,
        location: location as string,
        sort: sort as string,
        page: Number(page),
        limit: Number(limit),
        brand: brand as string,
        ratingMin: ratingMin ? Number(ratingMin) : undefined,
        verifiedSeller: verifiedSeller === 'true',
        freeShipping: freeShipping === 'true',
        etaMaxDays: etaMaxDays ? Number(etaMaxDays) : undefined,
        discountMin: discountMin ? Number(discountMin) : undefined,
        createdSinceDays: createdSinceDays ? Number(createdSinceDays) : undefined,
        sellerId: rest?.sellerId as string | undefined,
        attributes: Object.fromEntries(
          Object.entries(rest).filter(([k]) => k.startsWith('attr_')).map(([k, v]) => [k.replace('attr_', ''), String(v)])
        )
      });

      res.status(200).json({
        status: "success",
        data: searchResults,
      });
    } catch (error) {
      next(error);
    }
  };

  // Category Management
  getCategories = async (req: any, res: any, next: any) => {
    try {
      const categories = await this.marketService.getCategories();

      res.status(200).json({
        status: "success",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductDetails = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const product = await this.marketService.getProductDetails(req.params.id);
      res.status(200).json({
        status: "success",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: any, res: any, next: any) => {
    try {
      const category = await this.marketService.updateCategory(
        req.params.id,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  featureProduct = async (req: any, res: any, next: any) => {
    try {
      const product = await this.marketService.featureProduct(req.params.id);
      res.status(200).json({
        status: "success",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (
    req: CategoryRequest,
    res: any,
    next: any
  ) => {
    try {
      const { name, description, parentId } = req.body;

      if (!name) {
        throw new ValidationError("Category name is required");
      }

      const category = await this.marketService.createCategory({
        name,
        description,
        parentId,
      });

      res.status(201).json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  // Price Tracking
  getPriceHistory = async (
    req: PriceHistoryRequest,
    res: any,
    next: any
  ) => {
    try {
      const { productId } = req.params;
      const { period = "1month" } = req.query;

      const priceHistory = await this.marketService.getPriceHistory(
        productId,
        period as string
      );

      res.status(200).json({
        status: "success",
        data: priceHistory,
      });
    } catch (error) {
      next(error);
    }
  };

  // Featured Products
  getFeaturedProducts = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { limit = 10 } = req.query;
      const featuredProducts = await this.marketService.getFeaturedProducts(
        Number(limit)
      );

      res.status(200).json({
        status: "success",
        data: featuredProducts,
      });
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { productId } = req.params;
      const { limit, recentBrands, recentCategories } = req.query;
      const products = await this.marketService.getRecommendations(productId, {
        limit: limit ? Number(limit) : 12,
        recentBrands: recentBrands ? String(recentBrands).split(",").filter(Boolean) : [],
        recentCategories: recentCategories ? String(recentCategories).split(",").filter(Boolean) : [],
      });
      res.status(200).json({ status: "success", data: products });
    } catch (error) {
      next(error);
    }
  };

  // Product Reviews
  addReview = async (req: ReviewRequest, res: any, next: any) => {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;

      if (!req.user?._id) {
        throw new ValidationError("User not authenticated");
      }

      // Validate rating
      if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new ValidationError("Valid rating between 1-5 is required");
      }

      const review = await this.marketService.addProductReview(
        productId,
        req.user._id.toString(),
        {
          rating: Number(rating),
          comment,
        }
      );

      res.status(201).json({
        status: "success",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (
    req: any & { params: { productId: string; reviewId: string } },
    res: any,
    next: any
  ) => {
    try {
      const { productId, reviewId } = req.params;
      const { rating, comment } = req.body;

      if (!req.user?._id) {
        throw new ValidationError("User not authenticated");
      }

      // Validate rating
      if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new ValidationError("Valid rating between 1-5 is required");
      }

      // Check if user owns this review
      const existingReview = await this.marketService.getReviewById(reviewId);
      if (!existingReview) {
        throw new ValidationError("Review not found");
      }

      if (existingReview.user.toString() !== req.user._id.toString()) {
        throw new ValidationError("You can only edit your own reviews");
      }

      if (existingReview.product.toString() !== productId) {
        throw new ValidationError("Review does not match product");
      }

      const updatedReview = await this.marketService.updateProductReview(
        reviewId,
        {
          rating: Number(rating),
          comment,
        }
      );

      res.status(200).json({
        status: "success",
        data: updatedReview,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductReviews = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "10", 10);

      const reviews = await this.marketService.getProductReviews(productId, {
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({
        status: "success",
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserReviews = async (
    req: any & { query: { page?: string; limit?: string } },
    res: any,
    next: any
  ) => {
    try {
      if (!req.user?._id) {
        throw new ValidationError("User not authenticated");
      }

      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "10", 10);

      const reviews = await this.marketService.getUserReviews(req.user._id.toString(), {
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({
        status: "success",
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (
    req: any & { params: { productId: string; reviewId: string } },
    res: any,
    next: any
  ) => {
    try {
      const { productId, reviewId } = req.params;

      if (!req.user?._id) {
        throw new ValidationError("User not authenticated");
      }

      // Check if user owns this review
      const existingReview = await this.marketService.getReviewById(reviewId);
      if (!existingReview) {
        throw new ValidationError("Review not found");
      }

      if (existingReview.user.toString() !== req.user._id.toString()) {
        throw new ValidationError("You can only delete your own reviews");
      }

      if (existingReview.product.toString() !== productId) {
        throw new ValidationError("Review does not match product");
      }

      await this.marketService.deleteProductReview(reviewId);

      res.status(200).json({
        status: "success",
        data: { message: "Review deleted successfully" },
      });
    } catch (error) {
      next(error);
    }
  };

  // Seller Management
  getSellerProducts = async (
    req: SellerProductsRequest,
    res: any,
    next: any
  ) => {
    try {
      const { sellerId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      const products = await this.marketService.getSellerProducts(sellerId, {
        status: status as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({
        status: "success",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  // Analytics
  getProductAnalytics = async (
    req: AnalyticsRequest,
    res: any,
    next: any
  ) => {
    try {
      const { productId } = req.params;
      const analytics = await this.marketService.getProductAnalytics(productId);

      res.status(200).json({
        status: "success",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get product analytics including sales data
  getBatchProductAnalytics = async (req: any, res: any, next: any) => {
    try {
      const { productIds } = req.query;

      if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({
          status: "error",
          message: "productIds array is required"
        });
      }

      // Convert all productIds to ObjectId
      const productObjectIds = productIds.map((id: string) => new mongoose.Types.ObjectId(id));

      // Fetch all products in one query using Product model directly
      const Product = mongoose.model("Product");
      const products = await Product.find({
        _id: { $in: productObjectIds }
      }).lean();

      // Create a map for quick lookup
      const productMap = new Map(products.map(p => [p._id.toString(), p]));

      // Single aggregation to get sales data for ALL products at once
      const salesData = await mongoose.model("Order").aggregate([
        {
          $match: {
            $or: [
              { product: { $in: productObjectIds } },
              { "lineItems.productId": { $in: productObjectIds } }
            ],
            status: { $in: ["delivered", "shipped"] },
            paymentStatus: "completed"
          }
        },
        {
          $unwind: {
            path: "$lineItems",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            $or: [
              { product: { $in: productObjectIds } },
              { "lineItems.productId": { $in: productObjectIds } }
            ]
          }
        },
        {
          $group: {
            _id: {
              $ifNull: ["$lineItems.productId", "$product"]
            },
            sales: { $sum: { $ifNull: ["$lineItems.qty", 1] } },
            revenue: { $sum: { $ifNull: ["$lineItems.unitPrice", "$totalPrice"] } }
          }
        }
      ]);

      // Create a map of sales data by productId
      const salesMap = new Map(
        salesData.map(s => [s._id.toString(), { sales: s.sales, revenue: s.revenue }])
      );

      // Build analytics array
      const analytics = productIds.map((productId: string) => {
        const product = productMap.get(productId);
        const sales = salesMap.get(productId);

        if (!product) {
          return {
            productId,
            views: 0,
            rating: 0,
            discount: 0,
            sales: 0,
            revenue: 0
          };
        }

        return {
          productId,
          views: product.views || 0,
          rating: product.rating || 0,
          discount: product.discount || 0,
          sales: sales?.sales || 0,
          revenue: sales?.revenue || 0
        };
      });

      res.status(200).json({
        status: "success",
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  };


}
