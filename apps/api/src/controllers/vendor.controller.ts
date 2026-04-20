// Express types handled by any
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import { ValidationError } from "../utils/errors";
import Product from "../models/Product";
import Order from "../models/Order";
import Payout from "../models/Payout";
import Seller from "../models/Seller";
import { PaystackProvider } from "../services/providers/PaystackProvider";
import { InventoryService } from "../services/InventoryService";

export class VendorController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  // Helper function to create URL-friendly slugs
  private slugify(input: string): string {
    return String(input).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }

  become = async (req: any, res: any, next: any) => {
    try {
      // SINGLE VENDOR MODE: Disable vendor registration
      throw new ValidationError("Vendor registration is currently disabled.");

      /*
      if (!req.user) throw new ValidationError("Authentication required");
      
      // Extract all form data from enhanced vendor application
      const { 
        storeName, 
        description, 
        logoUrl, 
        payoutProvider, 
        bankCode, 
        accountNumber, 
        accountName,
        // Enhanced form fields
        country,
        businessType,
        cacType,
        cacNumber,
        businessLicense,
        taxId,
        businessAddress,
        businessCity,
        businessState,
        businessPhone,
        businessEmail,
        industry,
        businessRegistrationDate
      } = req.body || {};
      
      if (!storeName) throw new ValidationError("storeName required");
      
      // Create recipient if provided - only for supported payment providers
      let recipientCode: string | undefined = undefined;
      
      // Only create Paystack recipient for Nigerian vendors (Paystack only supports NGN)
      if (payoutProvider === "paystack" && country === "NG" && bankCode && accountNumber && accountName) {
        try {
          const p = new PaystackProvider();
          const out = await p.createRecipient({ name: accountName, accountNumber, bankCode });
          recipientCode = out.recipientCode;
        } catch (error) {
          console.error("Failed to create Paystack recipient:", error);
          throw new ValidationError("Failed to create payment recipient. Please check your bank details.");
        }
      }
      
      // For non-Nigerian countries, we'll store the payment details but not create a recipient yet
      // This allows the form to be submitted successfully, and recipients can be created later
      // when the vendor actually needs to receive payments

      // STEP 1: Update User.store (maintain backward compatibility)
      await mongoose.model("User").updateOne(
        { _id: req.user.id },
        {
          $set: {
            role: "seller",
            store: {
              name: String(storeName),
              description: description || "",
              logoUrl: logoUrl || "",
              payout: {
                provider: payoutProvider,
                recipientCode: recipientCode || undefined,
                // Store payment details for non-Nigerian countries
                bankCode: bankCode || undefined,
                accountNumber: accountNumber || undefined,
                accountName: accountName || undefined,
                country: country || undefined
              },
            },
          },
        }
      );

      // STEP 2: Create Seller collection document (NEW - for admin approval workflow)
      const slug = this.slugify(storeName);
      
      // Check if Seller document already exists
      let sellerDoc = await Seller.findOne({ userId: req.user.id });
      
      if (sellerDoc) {
        // Update existing Seller document
        sellerDoc = await Seller.findOneAndUpdate(
          { userId: req.user.id },
          {
            slug,
            name: storeName,
            description: description || "",
            logoUrl: logoUrl || "",
            country: country || "NG", // Default to Nigeria if not specified
            status: "pending", // Always set to pending for admin approval
            kyc: {
              businessType: businessType || "individual",
              cacType: cacType || null,
              cacNumber: cacNumber || null,
              businessLicense: businessLicense || null,
              taxId: taxId || null,
              businessAddress: businessAddress || null,
              businessCity: businessCity || null,
              businessState: businessState || null,
              businessPhone: businessPhone || null,
              businessEmail: businessEmail || null
            },
            business: {
              industry: industry || null,
              registrationDate: businessRegistrationDate || null,
              payoutProvider: payoutProvider || null
            },
            payoutMethods: [{
              provider: payoutProvider || "manual",
              country: country || "NG",
              currency: country === "NG" ? "NGN" : "XOF",
              bankCode: bankCode || null,
              accountNumber: accountNumber || null,
              accountName: accountName || null,
              recipientCode: recipientCode || null
            }]
          },
          { new: true, upsert: true }
        );
      } else {
        // Create new Seller document
        sellerDoc = await Seller.create({
          userId: req.user.id,
          slug,
          name: storeName,
          description: description || "",
          logoUrl: logoUrl || "",
          country: country || "NG",
          status: "pending", // Requires admin approval
          kyc: {
            businessType: businessType || "individual",
            cacType: cacType || null,
            cacNumber: cacNumber || null,
            businessLicense: businessLicense || null,
            taxId: taxId || null,
            businessAddress: businessAddress || null,
            businessCity: businessCity || null,
            businessState: businessState || null,
            businessPhone: businessPhone || null,
            businessEmail: businessEmail || null
          },
          business: {
            industry: industry || null,
            registrationDate: businessRegistrationDate || null,
            payoutProvider: payoutProvider || null
          },
          payoutMethods: [{
            provider: payoutProvider || "manual",
            country: country || "NG",
            currency: country === "NG" ? "NGN" : "XOF",
            bankCode: bankCode || null,
            accountNumber: accountNumber || null,
            accountName: accountName || null,
            recipientCode: recipientCode || null
          }]
        });
      }

      // STEP 3: Get updated user data
      const fresh = await mongoose.model("User").findById(req.user.id);
      
      // STEP 4: Return both User and Seller data
      res.json({ 
        status: "success", 
        data: { 
          user: fresh,
          seller: sellerDoc,
          message: "Vendor application submitted successfully. Your application is pending admin approval."
        } 
      });
      */
    } catch (e) {
      next(e as any);
    }
  };

  // Get vendor application status
  getApplicationStatus = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");

      const sellerDoc = await Seller.findOne({ userId: req.user.id });

      if (!sellerDoc) {
        return res.json({
          status: "success",
          data: {
            status: "not_applied",
            message: "No vendor application found"
          }
        });
      }

      res.json({
        status: "success",
        data: {
          status: sellerDoc.status,
          seller: sellerDoc,
          message: sellerDoc.status === "pending"
            ? "Your application is pending admin approval"
            : sellerDoc.status === "approved"
              ? "Your application has been approved! You can now start selling."
              : "Your application was rejected. Please contact support for more information."
        }
      });

    } catch (e) {
      next(e as any);
    }
  };

  overview = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = req.user.id as any;
      const [totalProducts, ordersAgg, payoutsAgg] = await Promise.all([
        Product.countDocuments({ seller: vendorId }),
        Order.aggregate([
          { $match: { "lineItems.vendorId": new mongoose.Types.ObjectId(String(vendorId)) } },
          { $unwind: "$lineItems" },
          { $match: { "lineItems.vendorId": new mongoose.Types.ObjectId(String(vendorId)) } },
          { $group: { _id: null, orders: { $addToSet: "$_id" }, revenue: { $sum: { $multiply: ["$lineItems.qty", "$lineItems.unitPrice"] } } } },
          { $project: { _id: 0, ordersCount: { $size: "$orders" }, revenue: 1 } },
        ]),
        Payout.aggregate([
          { $match: { vendorId: new mongoose.Types.ObjectId(String(vendorId)) } },
          { $group: { _id: "$status", amountNet: { $sum: "$amountNet" } } },
        ]),
      ]);
      const ordersCount = ordersAgg?.[0]?.ordersCount || 0;
      const revenue = ordersAgg?.[0]?.revenue || 0;
      const payoutByStatus = payoutsAgg.reduce<Record<string, number>>((acc, it) => { acc[String(it._id)] = it.amountNet; return acc; }, {} as any);
      res.json({ status: "success", data: { totalProducts, ordersCount, revenue, payouts: payoutByStatus } });
    } catch (e) { next(e as any); }
  };

  listOrders = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = String(req.user.id);
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
      const skip = (page - 1) * limit;

      // Simple approach: find orders that have lineItems with this vendorId
      const baseMatch = { "lineItems.vendorId": vendorId };

      const [items, total] = await Promise.all([
        Order.find(baseMatch)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('buyer', 'username email')
          .lean(),
        Order.countDocuments(baseMatch),
      ]);

      // Transform the data to match expected format
      const transformedItems = items.map(order => ({
        _id: order._id,
        createdAt: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingDetails: order.shippingDetails,
        buyer: order.buyer,
        lineItems: (order.lineItems || []).filter((li: any) => String(li.vendorId) === vendorId)
      }));

      res.json({
        status: "success",
        data: {
          items: transformedItems,
          page,
          limit,
          total
        }
      });
    } catch (e) {
      next(e as any);
    }
  };

  updateOrderStatus = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = new mongoose.Types.ObjectId(String(req.user.id));
      const { id } = req.params as any;
      const { status } = req.body || {};
      if (!status) throw new ValidationError("status required");
      const order = await Order.findById(id);
      if (!order) throw new ValidationError("Order not found");
      const isVendorInOrder = (order as any).lineItems?.some((li: any) => String(li.vendorId) === String(vendorId));
      if (!isVendorInOrder) throw new ValidationError("Not authorized for this order");
      await (order as any).updateStatus(String(status));
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e as any); }
  };

  analytics = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = new mongoose.Types.ObjectId(String(req.user.id));
      const since = new Date(String(req.query.since || new Date(Date.now() - 30 * 86400000)));
      const byDay = await Order.aggregate([
        { $match: { createdAt: { $gte: since }, "lineItems.vendorId": vendorId } },
        { $unwind: "$lineItems" },
        { $match: { "lineItems.vendorId": vendorId } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: { $multiply: ["$lineItems.qty", "$lineItems.unitPrice"] } }, orders: { $addToSet: "$_id" } } },
        { $project: { _id: 0, day: "$_id", revenue: 1, orders: { $size: "$orders" } } },
        { $sort: { day: 1 } },
      ]);
      const topProducts = await Order.aggregate([
        { $match: { createdAt: { $gte: since }, "lineItems.vendorId": vendorId } },
        { $unwind: "$lineItems" },
        { $match: { "lineItems.vendorId": vendorId } },
        { $group: { _id: "$lineItems.productId", qty: { $sum: "$lineItems.qty" }, revenue: { $sum: { $multiply: ["$lineItems.qty", "$lineItems.unitPrice"] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]);
      res.json({ status: "success", data: { byDay, topProducts } });
    } catch (e) { next(e as any); }
  };

  salesBreakdown = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = new mongoose.Types.ObjectId(String(req.user.id));

      // Get sales breakdown by order status
      const salesByStatus = await Order.aggregate([
        { $match: { "lineItems.vendorId": vendorId } },
        { $unwind: "$lineItems" },
        { $match: { "lineItems.vendorId": vendorId } },
        {
          $group: {
            _id: "$status",
            revenue: { $sum: { $multiply: ["$lineItems.qty", "$lineItems.unitPrice"] } },
            orderCount: { $addToSet: "$_id" }
          }
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            revenue: 1,
            orderCount: { $size: "$orderCount" }
          }
        },
        { $sort: { status: 1 } }
      ]);

      // Calculate totals
      const totalRevenue = salesByStatus.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = salesByStatus.reduce((sum, item) => sum + item.orderCount, 0);

      // Organize by status
      const breakdown = {
        pending: { revenue: 0, orders: 0 },
        processing: { revenue: 0, orders: 0 },
        shipped: { revenue: 0, orders: 0 },
        delivered: { revenue: 0, orders: 0 },
        cancelled: { revenue: 0, orders: 0 },
        disputed: { revenue: 0, orders: 0 }
      };

      salesByStatus.forEach(item => {
        if (breakdown[item.status as keyof typeof breakdown]) {
          breakdown[item.status as keyof typeof breakdown] = {
            revenue: item.revenue,
            orders: item.orderCount
          };
        }
      });

      // Calculate pending (pending + processing) and completed (shipped + delivered)
      const pendingRevenue = breakdown.pending.revenue + breakdown.processing.revenue;
      const pendingOrders = breakdown.pending.orders + breakdown.processing.orders;
      const completedRevenue = breakdown.shipped.revenue + breakdown.delivered.revenue;
      const completedOrders = breakdown.shipped.orders + breakdown.delivered.orders;



      res.json({
        status: "success",
        data: {
          totalRevenue,
          totalOrders,
          pending: { revenue: pendingRevenue, orders: pendingOrders },
          completed: { revenue: completedRevenue, orders: completedOrders },
          breakdown
        }
      });
    } catch (e) { next(e as any); }
  };

  listProducts = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");

      const query = req.user.role === 'admin' || req.user.role === 'product_manager' || req.user.isSuperAdmin
        ? {}
        : { seller: new mongoose.Types.ObjectId(req.user.id) };

      const products = await Product.find(query).sort({ createdAt: -1 });
      res.json({ status: "success", data: products });
    } catch (e) {
      next(e as any);
    }
  };

  productManagerOverview = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const staleDate = new Date(now);
      staleDate.setDate(now.getDate() - 30);

      const lowStockThreshold = Math.min(Math.max(Number(req.query.lowStockThreshold) || 5, 1), 100);
      const query = req.user.role === 'admin' || req.user.role === 'product_manager' || req.user.isSuperAdmin
        ? {}
        : { seller: new mongoose.Types.ObjectId(req.user.id) };

      const [overview] = await Product.aggregate([
        { $match: query },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalProducts: { $sum: 1 },
                  activeProducts: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                  suspendedProducts: { $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] } },
                  soldProducts: { $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] } },
                  outOfStock: { $sum: { $cond: [{ $lte: ["$quantity", 0] }, 1, 0] } },
                  lowStock: {
                    $sum: {
                      $cond: [
                        { $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", lowStockThreshold] }] },
                        1,
                        0,
                      ],
                    },
                  },
                  addedThisMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0] } },
                  updatedThisWeek: { $sum: { $cond: [{ $gte: ["$updatedAt", weekAgo] }, 1, 0] } },
                  needsImages: {
                    $sum: {
                      $cond: [{ $eq: [{ $size: { $ifNull: ["$images", []] } }, 0] }, 1, 0],
                    },
                  },
                  needsDescription: {
                    $sum: {
                      $cond: [
                        { $lt: [{ $strLenCP: { $trim: { input: { $ifNull: ["$description", ""] } } } }, 40] },
                        1,
                        0,
                      ],
                    },
                  },
                  staleProducts: { $sum: { $cond: [{ $lt: ["$updatedAt", staleDate] }, 1, 0] } },
                  totalViews: { $sum: { $ifNull: ["$views", 0] } },
                  inventoryUnits: { $sum: { $ifNull: ["$quantity", 0] } },
                },
              },
              { $project: { _id: 0 } },
            ],
            attentionQueue: [
              {
                $addFields: {
                  missingImages: { $eq: [{ $size: { $ifNull: ["$images", []] } }, 0] },
                  shortDescription: { $lt: [{ $strLenCP: { $trim: { input: { $ifNull: ["$description", ""] } } } }, 40] },
                  stale: { $lt: ["$updatedAt", staleDate] },
                },
              },
              {
                $match: {
                  $or: [
                    { quantity: { $lte: lowStockThreshold } },
                    { missingImages: true },
                    { shortDescription: true },
                    { stale: true },
                    { status: { $ne: "active" } },
                  ],
                },
              },
              { $sort: { quantity: 1, updatedAt: 1 } },
              { $limit: 8 },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  status: 1,
                  quantity: 1,
                  price: 1,
                  currency: 1,
                  images: 1,
                  updatedAt: 1,
                  issue: {
                    $switch: {
                      branches: [
                        { case: { $lte: ["$quantity", 0] }, then: "Out of stock" },
                        { case: { $lte: ["$quantity", lowStockThreshold] }, then: "Low stock" },
                        { case: "$missingImages", then: "Needs images" },
                        { case: "$shortDescription", then: "Improve description" },
                        { case: { $ne: ["$status", "active"] }, then: "Not active" },
                        { case: "$stale", then: "Review listing" },
                      ],
                      default: "Needs review",
                    },
                  },
                },
              },
            ],
            recentUpdates: [
              { $sort: { updatedAt: -1 } },
              { $limit: 8 },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  status: 1,
                  quantity: 1,
                  price: 1,
                  currency: 1,
                  images: 1,
                  updatedAt: 1,
                },
              },
            ],
            categoryBreakdown: [
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 8 },
              { $project: { _id: 0, category: "$_id", count: 1 } },
            ],
          },
        },
      ]);

      const summary = overview?.summary?.[0] || {
        totalProducts: 0,
        activeProducts: 0,
        suspendedProducts: 0,
        soldProducts: 0,
        outOfStock: 0,
        lowStock: 0,
        addedThisMonth: 0,
        updatedThisWeek: 0,
        needsImages: 0,
        needsDescription: 0,
        staleProducts: 0,
        totalViews: 0,
        inventoryUnits: 0,
      };

      res.json({
        status: "success",
        data: {
          summary,
          attentionQueue: overview?.attentionQueue || [],
          recentUpdates: overview?.recentUpdates || [],
          categoryBreakdown: overview?.categoryBreakdown || [],
          lowStockThreshold,
        },
      });
    } catch (e) {
      next(e as any);
    }
  };

  createProduct = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");

      const body = req.body || {};

      // Validate required fields
      if (!body.title || !body.price || !body.description) {
        throw new ValidationError("Title, price, and description are required");
      }

      // Validate images array if provided
      if (body.images && Array.isArray(body.images)) {
        // Filter out empty strings and validate URLs
        body.images = body.images
          .filter((url: string) => url && url.trim().length > 0)
          .filter((url: string) => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          });
      }

      // Create product
      const doc = await Product.create({
        ...body,
        seller: req.user.id,
        status: body.status || 'active',
        views: 0,
        likes: 0,
        rating: 0,
      });

      res.status(201).json({
        status: "success",
        data: {
          product: doc,
          message: "Product created successfully. You can now upload images using the product-images endpoints."
        }
      });
    } catch (e) {
      next(e as any);
    }
  };
  updateProduct = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const id = req.params.id;
      const body = req.body || {};

      // Allow admins and product managers to update any product, regular users can only update their own
      const query = req.user.role === 'admin' || req.user.role === 'product_manager' || req.user.isSuperAdmin
        ? { _id: id }
        : { _id: id, seller: req.user.id };

      const doc = await Product.findOneAndUpdate(query, body, { new: true });
      if (!doc) throw new ValidationError("Product not found");
      res.json({ status: "success", data: doc });
    } catch (e) {
      next(e as any);
    }
  };
  deleteProduct = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const id = req.params.id;

      // Allow admins and product managers to delete any product, regular users can only delete their own
      const query = req.user.role === 'admin' || req.user.role === 'product_manager' || req.user.isSuperAdmin
        ? { _id: id }
        : { _id: id, seller: req.user.id };

      await Product.deleteOne(query);
      res.json({ status: "success", data: { ok: true } });
    } catch (e) {
      next(e as any);
    }
  };

  listPayouts = async (req: any, res: any, next: any) => {
    try { if (!req.user) throw new ValidationError("Authentication required"); const vendorId = req.user.id as any; const payouts = await Payout.find({ vendorId }).sort({ createdAt: -1 }); res.json({ status: "success", data: payouts }); } catch (e) { next(e as any); }
  };

  // Inventory management methods
  getLowStockItems = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = req.user.id as any;
      const threshold = Number(req.query.threshold) || 5;

      const products = await Product.find({
        seller: vendorId,
        quantity: { $lte: threshold, $gt: 0 },
        status: "active"
      }).select('_id title quantity price images');

      res.json({
        status: "success",
        data: products.map(p => ({
          id: p._id,
          title: p.title,
          currentStock: p.quantity,
          price: p.price,
          image: p.images?.[0],
          status: p.quantity === 0 ? 'out_of_stock' : 'low_stock'
        }))
      });
    } catch (e) { next(e as any); }
  };

  adjustStock = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = req.user.id as any;
      const { productId, adjustment, reason } = req.body || {};

      if (!productId || adjustment === undefined || !reason) {
        throw new ValidationError("productId, adjustment, and reason are required");
      }

      // Verify product belongs to vendor, or user is an admin/product manager
      const query = req.user.role === 'admin' || req.user.role === 'product_manager' || req.user.isSuperAdmin
        ? { _id: productId }
        : { _id: productId, seller: vendorId };

      const product = await Product.findOne(query);
      if (!product) {
        throw new ValidationError("Product not found or access denied");
      }

      const result = await this.inventoryService.adjustStock(
        productId,
        adjustment,
        reason
      );

      res.json({ status: "success", data: result });
    } catch (e) { next(e as any); }
  };

  getStockMovements = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = req.user.id as any;
      const { productId } = req.params;

      // Verify product belongs to vendor, or user is an admin/product manager
      const query = req.user.role === 'admin' || req.user.role === 'product_manager' || req.user.isSuperAdmin
        ? { _id: productId }
        : { _id: productId, seller: vendorId };

      const product = await Product.findOne(query);
      if (!product) {
        throw new ValidationError("Product not found or access denied");
      }

      const movements = await this.inventoryService.getStockMovementHistory(productId);
      res.json({ status: "success", data: movements });
    } catch (e) { next(e as any); }
  };

  bulkUpdateStock = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) throw new ValidationError("Authentication required");
      const vendorId = req.user.id as any;
      const { updates } = req.body || {};

      if (!Array.isArray(updates) || updates.length === 0) {
        throw new ValidationError("updates array is required");
      }

      const results = [];
      for (const update of updates) {
        const { productId, adjustment, reason } = update;

        if (!productId || adjustment === undefined || !reason) {
          results.push({ productId, success: false, error: "Missing required fields" });
          continue;
        }

        try {
          // Verify product belongs to vendor, or user is an admin/product manager
          const query = req.user.role === 'admin' || req.user.role === 'product_manager' || req.user.isSuperAdmin
            ? { _id: productId }
            : { _id: productId, seller: vendorId };

          const product = await Product.findOne(query);
          if (!product) {
            results.push({ productId, success: false, error: "Product not found or access denied" });
            continue;
          }

          const result = await this.inventoryService.adjustStock(productId, adjustment, reason);
          results.push({ productId, success: true, data: result });
        } catch (error: any) {
          results.push({ productId, success: false, error: error.message });
        }
      }

      res.json({ status: "success", data: { results } });
    } catch (e) { next(e as any); }
  };
}

export default new VendorController();
