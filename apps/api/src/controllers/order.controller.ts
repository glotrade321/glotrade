// src/controllers/order.controller.ts
// Express types handled by any
import { Order, Product } from "../models";
import { Types } from "mongoose";
import { NotificationService } from "../services/NotificationService";
import { InventoryService } from "../services/InventoryService";
import { WalletService } from "../services/WalletService";
import { InvoiceService } from "../services/invoice.service";
import { CreditService } from "../services/CreditService";
import { CommissionService } from "../services/CommissionService";
import path from 'path';
import fs from 'fs';

export class OrderController {
  private inventoryService: InventoryService;
  private walletService: WalletService;

  constructor() {
    this.inventoryService = new InventoryService();
    this.walletService = new WalletService();
    this.invoiceService = new InvoiceService();
    this.creditService = new CreditService();
  }

  private creditService: CreditService;

  private invoiceService: InvoiceService;

  // Create order with server-side pricing and stock checks
  create = async (req: any, res: any, next: any) => {
    try {
      const { lineItems, currency = "NGN", shippingDetails, purchaseOrderNumber, paymentMethod } = req.body || {};
      if (!Array.isArray(lineItems) || lineItems.length === 0) {
        return res.status(400).json({ status: "error", message: "lineItems required" });
      }

      // Validate shipping address is provided
      if (!shippingDetails || !shippingDetails.address || !shippingDetails.city || !shippingDetails.country) {
        return res.status(400).json({
          status: "error",
          message: "Complete shipping address is required (address, city, and country)"
        });
      }

      // Validate products and stock availability
      console.log('Order creation - lineItems received:', lineItems);
      const detailed = await Promise.all(
        lineItems.map(async (li: any) => {
          console.log(`Checking product ${li.productId} with quantity ${li.qty}`);
          const product: any = await Product.findById(li.productId).lean();
          if (!product) throw new Error(`Product not found: ${li.productId}`);
          console.log(`Product "${product.title}" - Available: ${product.quantity}, Requested: ${Number(li.qty || 1)}`);
          if (product.quantity < Number(li.qty || 1)) {
            throw new Error(`Insufficient stock for "${product.title}". Available: ${product.quantity}, Requested: ${Number(li.qty || 1)}`);
          }
          // MOQ Validation
          const requestedQty = Number(li.qty || 1);
          const moq = product.minOrderQuantity || 1;
          if (requestedQty < moq) {
            throw new Error(`Minimum order quantity for "${product.title}" is ${moq}. You requested ${requestedQty}.`);
          }
          // Calculate the actual price (with discount if applicable)
          const actualPrice = typeof product.discount === "number" && product.discount > 0
            ? Math.max(0, Math.round((product.price * (100 - product.discount)) / 100))
            : product.price;

          return {
            productId: product._id,
            vendorId: product.seller,
            qty: Number(li.qty || 1),
            unitPrice: Number(actualPrice),
            currency: product.currency || "NGN",
            productTitle: product.title,
            productImage: Array.isArray(product.images) ? product.images[0] : undefined,
            discount: product.discount || 0,
          };
        })
      );

      const totalPrice = detailed.reduce((sum: number, li: any) => sum + li.unitPrice * li.qty, 0);
      const buyer = (req as any).user?._id || req.body.buyerId;
      const guestEmail = !buyer ? req.body.email : undefined;

      // Check credit if payment method is net_terms (only for logged in users)
      if (paymentMethod === 'net_terms') {
        if (!buyer) {
          return res.status(400).json({
            status: "error",
            message: "Net Terms payment is only available for registered users"
          });
        }
        const creditCheck = await this.creditService.checkCreditAvailability(buyer, totalPrice);
        if (!creditCheck.available) {
          return res.status(400).json({
            status: "error",
            message: creditCheck.message || "Insufficient credit for Net Terms payment"
          });
        }
      }

      // Create the order
      const created = await Order.create({
        buyer,
        guestEmail: !buyer ? guestEmail : undefined,
        lineItems: detailed,
        totalPrice,
        currency,
        status: req.body.paymentStatus === "completed" ? "processing" : "pending", // Auto-process if already paid
        paymentStatus: req.body.paymentStatus || "pending",
        payoutStatus: "none",
        shippingDetails,
        purchaseOrderNumber,
        paymentMethod: paymentMethod || "card", // Default to card if not specified
        paymentReference: req.body.paymentReference,
        paidAt: req.body.paymentStatus === "completed" ? new Date() : undefined,
      });

      // Reserve credit if net terms
      if (paymentMethod === 'net_terms' && buyer) {
        await this.creditService.reserveCredit(buyer, totalPrice);
      }

      // Reserve stock for each product in the order
      try {
        for (const item of detailed) {
          await this.inventoryService.reserveStock(
            item.productId.toString(),
            item.qty,
            (created._id as any).toString()
          );
        }
      } catch (stockError: any) {
        // If stock reservation fails, delete the order and return error
        await Order.findByIdAndDelete(created._id);
        return res.status(400).json({
          status: "error",
          message: `Stock reservation failed: ${stockError.message}`
        });
      }

      // Create notification for order placed (Only for immediate payment methods or if already paid)
      try {
        const isImmediatePayment = ['wallet', 'net_terms'].includes(paymentMethod) || req.body.paymentStatus === "completed";
        if (buyer && isImmediatePayment) {
          const notificationService = new NotificationService();
          await notificationService.createOrderNotification('order_placed', {
            orderId: (created._id as any).toString(),
            orderNumber: (created._id as any).toString().slice(-6),
            totalAmount: totalPrice,
            currency,
            buyerId: (buyer as any).toString(),
            sellerId: (detailed[0]?.vendorId as any)?.toString(),
            productTitle: detailed[0]?.productTitle,
            quantity: detailed[0]?.qty
          });
        }
      } catch (error) {
        console.error('Failed to create order notification:', error);
      }

      // Auto-generate invoice
      try {
        // Only generate invoice if we have a buyer or sufficient guest info
        if (buyer) {
          const { User } = require("../models");
          const fullBuyer = await User.findById(buyer).lean();

          await this.invoiceService.generateInvoice(created, fullBuyer);

          // Update order with invoice generation time
          await Order.findByIdAndUpdate(created._id, {
            invoiceGeneratedAt: new Date()
          });
        }
      } catch (invoiceError) {
        console.error('Failed to auto-generate invoice:', invoiceError);
        // Don't fail the order creation
      }

      res.json({ status: "success", data: { orderId: created._id } });
    } catch (err: any) {
      console.error('Order creation error:', err);
      if (err.message && (err.message.includes('Insufficient stock') || err.message.includes('Product not found'))) {
        return res.status(400).json({
          status: "error",
          message: err.message
        });
      }
      next(err);
    }
  };

  list = async (req: any, res: any, next: any) => {
    try {
      const { buyerId, vendorId, status, paymentStatus, q: query, from, to, page = "1", limit = "10", sort = "-createdAt" } = req.query as Record<string, string>;
      const filter: any = {};
      if (buyerId) filter.buyer = buyerId;
      if (vendorId) filter["lineItems.vendorId"] = vendorId;
      if (status) filter.status = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (from || to) {
        filter.createdAt = {};
        if (from) (filter.createdAt as any).$gte = new Date(from);
        if (to) (filter.createdAt as any).$lte = new Date(to);
      }
      if (query) filter._id = query;

      const pg = Math.max(1, Number(page) || 1);
      const lm = Math.max(1, Math.min(100, Number(limit) || 10));
      const [orders, total] = await Promise.all([
        Order.find(filter).sort(sort as any).skip((pg - 1) * lm).limit(lm).lean(),
        Order.countDocuments(filter),
      ]);
      res.json({ status: "success", data: { total, page: pg, limit: lm, orders } });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: any, res: any, next: any) => {
    try {
      const id = req.params.orderId;
      let order = null as any;
      // Try full ObjectId first
      order = await Order.findById(id).lean();
      // If not found and looks like a short hex suffix (e.g., last 6 chars shown in UI), try suffix match
      if (!order && /^[a-f\d]{4,12}$/i.test(id)) {
        try {
          const found = await Order.aggregate([
            { $addFields: { _idStr: { $toString: "$_id" } } },
            { $match: { _idStr: { $regex: `${id}$`, $options: "i" } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ]);
          order = found?.[0] || null;
        } catch {
          // Fallback without $toString (older Mongo): fetch recent and match in app
          const candidates = await Order.find({}).sort({ createdAt: -1 }).limit(200).lean();
          order = candidates.find((o: any) => String(o._id).toLowerCase().endsWith(id.toLowerCase())) || null;
        }
      }
      if (!order) return res.status(404).json({ status: "error", message: "Order not found" });
      // Attach minimal buyer info for detail views
      let buyer: any = null;
      try {
        const { User } = require("../models");
        const b = await User.findById(order.buyer)
          .select({ username: 1, email: 1, phone: 1, country: 1, addresses: 1 })
          .lean();
        if (b) {
          const addrs: any[] = Array.isArray(b.addresses) ? b.addresses : [];
          const def = addrs.find((a: any) => !!a?.isDefault) || addrs[0] || {};
          buyer = {
            username: b.username,
            email: b.email,
            phone: b.phone || def.phone,
            country: b.country || def.country,
            city: def.city,
            address: def.street,
          };
        }
      } catch { }
      res.json({ status: "success", data: { ...order, buyer } });
    } catch (err) { next(err); }
  };

  // Resolve short or full id into a full _id string
  resolve = async (req: any, res: any, next: any) => {
    try {
      const key = String(req.params.key || "").trim();
      if (!key) return res.status(400).json({ status: "error", message: "key required" });
      // If it's a full 24-hex and exists, return it directly
      const direct = /^[a-f\d]{24}$/i.test(key) ? await Order.findById(key).select({ _id: 1 }).lean() : null;
      if (direct) return res.json({ status: "success", data: { orderId: String(direct._id) } });
      // Else search by suffix
      let foundId: string | null = null;
      try {
        const agg = await Order.aggregate([
          { $addFields: { _idStr: { $toString: "$_id" } } },
          { $match: { _idStr: { $regex: `${key}$`, $options: "i" } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { _idStr: 1 } },
        ]);
        foundId = agg?.[0]?._idStr || null;
      } catch {
        const candidates = await Order.find({}).sort({ createdAt: -1 }).limit(200).select({ _id: 1 }).lean();
        const hit = candidates.find((o: any) => String(o._id).toLowerCase().endsWith(key.toLowerCase()));
        foundId = hit ? String(hit._id) : null;
      }
      if (!foundId) return res.status(404).json({ status: "error", message: "Order not found" });
      res.json({ status: "success", data: { orderId: foundId } });
    } catch (err) { next(err); }
  };

  // Update order status (role checks can be added later)
  updateStatus = async (req: any, res: any, next: any) => {
    try {
      const { status } = req.body || {};
      const { orderId } = req.params;
      const valid = ["pending", "processing", "shipped", "delivered", "cancelled", "disputed"];
      if (!valid.includes(status)) return res.status(400).json({ status: "error", message: "invalid status" });

      // Get the order to find the buyer and line items
      const order = await Order.findById(orderId).select('buyer status lineItems').lean();
      if (!order) {
        return res.status(404).json({ status: "error", message: "Order not found" });
      }

      // Handle stock restoration if order is cancelled
      if (status === "cancelled" && order.lineItems && order.lineItems.length > 0) {
        try {
          for (const item of order.lineItems) {
            await this.inventoryService.releaseStock(
              item.productId.toString(),
              item.qty,
              orderId,
              "Order cancelled"
            );
          }
        } catch (stockError) {
          console.error('Failed to release stock for cancelled order:', stockError);
          // Continue with status update even if stock release fails
        }
      }

      await Order.updateOne({ _id: orderId }, { $set: { status } });

      // Handle vendor payments when order is delivered
      if (status === "delivered" && order.lineItems && order.lineItems.length > 0) {
        try {
          await this.processVendorPayments(orderId, order.lineItems);
        } catch (paymentError) {
          console.error('Failed to process vendor payments:', paymentError);
          // Continue with notification even if payment fails
        }
      }

      // Handle Sales Agent Commission when order is delivered
      if (status === "delivered" && order.buyer) {
        try {
          // Calculate commission based on product discounts
          await CommissionService.calculatePurchaseCommission(
            orderId,
            (order.buyer as any).toString(),
            0 // Order value is now calculated inside the service based on line items
          );
        } catch (commissionError) {
          console.error('Failed to process sales agent commission:', commissionError);
          // Continue - don't block the status update
        }
      }

      // Create notification for status change
      try {
        const notificationService = new NotificationService();
        const notificationType = this.getNotificationTypeForStatus(status);

        if (notificationType) {
          const firstItem = order.lineItems?.[0];
          const otherItemsCount = (order.lineItems?.length || 1) - 1;
          const displayTitle = firstItem
            ? (otherItemsCount > 0 ? `${firstItem.productTitle} and ${otherItemsCount} others` : firstItem.productTitle)
            : 'Order';

          await notificationService.createOrderNotification(notificationType as any, {
            orderId: orderId,
            orderNumber: orderId.slice(-6),
            totalAmount: 0, // We don't have this info in status update
            currency: 'NGN',
            buyerId: (order.buyer as any).toString(),
            sellerId: firstItem?.vendorId?.toString() || '',
            productTitle: displayTitle,
            quantity: 1
          });
        }
      } catch (error) {
        console.error('Failed to create status change notification:', error);
      }

      res.json({ status: "success", data: { ok: true } });
    } catch (err) { next(err); }
  };

  // Process vendor payments when order is shipped
  private async processVendorPayments(orderId: string, lineItems: any[]) {
    console.log(`Processing vendor payments for order ${orderId}`);

    // Group line items by vendor
    const vendorPayments = new Map<string, { vendorId: string; amount: number; currency: string; items: any[] }>();

    for (const item of lineItems) {
      const vendorId = item.vendorId.toString();
      const itemTotal = item.unitPrice * item.qty;

      if (vendorPayments.has(vendorId)) {
        const existing = vendorPayments.get(vendorId)!;
        existing.amount += itemTotal;
        existing.items.push(item);
      } else {
        vendorPayments.set(vendorId, {
          vendorId,
          amount: itemTotal,
          currency: item.currency || 'NGN',
          items: [item]
        });
      }
    }

    // Process payment for each vendor
    for (const [vendorId, payment] of vendorPayments) {
      try {
        console.log(`Processing payment for vendor ${vendorId}: ${payment.amount} ${payment.currency}`);

        // Convert amount to kobo for NGN
        const amountInKobo = payment.currency === 'NGN' ? Math.round(payment.amount * 100) : payment.amount;

        // Credit vendor wallet
        await this.walletService.addFunds(
          vendorId,
          amountInKobo,
          payment.currency as "NGN",
          "vendor",
          `Payment for delivered order ${orderId}`,
          {
            orderId,
            paymentType: "vendor_payment",
            items: payment.items.map(item => ({
              productId: item.productId,
              productTitle: item.productTitle,
              quantity: item.qty,
              unitPrice: item.unitPrice
            }))
          },
          null, // No session for development
          "vendor_payment"
        );

        console.log(`Successfully credited ${amountInKobo} ${payment.currency} to vendor ${vendorId}`);

      } catch (error) {
        console.error(`Failed to process payment for vendor ${vendorId}:`, error);
        // Continue with other vendors even if one fails
      }
    }

    // Update order payout status
    await Order.updateOne(
      { _id: orderId },
      { $set: { payoutStatus: "settled" } }
    );

    console.log(`Completed vendor payments for order ${orderId}`);
  }

  // Helper method to map order status to notification type
  private getNotificationTypeForStatus(status: string): string | null {
    const statusMap: Record<string, string> = {
      'processing': 'order_processing',
      'shipped': 'order_shipped',
      'delivered': 'order_delivered',
      'cancelled': 'order_cancelled',
      'disputed': 'order_disputed'
    };

    return statusMap[status] || null;
  }

  analytics = async (req: any, res: any, next: any) => {
    try {
      const { buyerId, from, to, granularity = "day" } = req.query as Record<string, string>;
      const match: any = {};
      if (buyerId) match.buyer = Types.ObjectId.isValid(buyerId) ? new Types.ObjectId(buyerId) : buyerId;
      if (from || to) {
        match.createdAt = {};
        if (from) match.createdAt.$gte = new Date(from);
        if (to) match.createdAt.$lte = new Date(to);
      }
      const groupFmt = granularity === "month" ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } } : granularity === "week" ? { $dateToString: { format: "%G-%V", date: "$createdAt" } } : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      const [summary, series, byStatus] = await Promise.all([
        Order.aggregate([{ $match: match }, { $group: { _id: null, totalOrders: { $sum: 1 }, delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } }, spendTotal: { $sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, "$totalPrice", 0] } } } }]).then(a => a[0] || { totalOrders: 0, delivered: 0, spendTotal: 0 }),
        Order.aggregate([{ $match: match }, { $group: { _id: groupFmt, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
        Order.aggregate([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }])
      ]);
      const statusBreakdown = byStatus.reduce((acc: any, r: any) => { acc[r._id] = r.count; return acc; }, {});
      const timeSeries = series.map((s: any) => ({ bucket: s._id, count: s.count }));
      const avgOrderValue = summary.totalOrders ? summary.spendTotal / summary.totalOrders : 0;
      res.json({ status: "success", data: { totalOrders: summary.totalOrders, delivered: summary.delivered, spendTotal: summary.spendTotal, avgOrderValue, statusBreakdown, timeSeries } });
    } catch (err) { next(err); }
  };

  /**
   * Generate/Regenerate invoice for an order
   */
  generateInvoice = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ status: "error", message: "Order not found" });
      }

      // Check permission (buyer, seller, or admin)
      const userId = (req as any).user._id.toString();
      const userRole = (req as any).user.role;

      if (userRole !== 'admin' &&
        order.buyer?.toString() !== userId &&
        order.seller?.toString() !== userId) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
      }

      const { User } = require("../models");
      const buyer = await User.findById(order.buyer).lean();

      const result = await this.invoiceService.generateInvoice(order, buyer);

      // Update order
      order.invoiceNumber = result.invoiceNumber;
      order.invoiceGeneratedAt = new Date();
      await order.save();

      res.json({
        status: "success",
        message: "Invoice generated successfully",
        data: {
          invoiceNumber: result.invoiceNumber,
          generatedAt: order.invoiceGeneratedAt
        }
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Download invoice PDF
   */
  downloadInvoice = async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ status: "error", message: "Order not found" });
      }

      // Check permission
      const userId = (req as any).user._id.toString();
      const userRole = (req as any).user.role;

      if (userRole !== 'admin' &&
        order.buyer?.toString() !== userId &&
        order.seller?.toString() !== userId) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
      }

      // If no invoice number, try to generate one first
      if (!order.invoiceNumber) {
        const { User } = require("../models");
        const buyer = await User.findById(order.buyer).lean();
        const result = await this.invoiceService.generateInvoice(order, buyer);
        order.invoiceNumber = result.invoiceNumber;
        order.invoiceGeneratedAt = new Date();
        await order.save();
      }

      const fileName = `${order.invoiceNumber}.pdf`;
      const filePath = path.join(process.cwd(), 'public', 'invoices', fileName);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        // Regenerate if missing
        const { User } = require("../models");
        const buyer = await User.findById(order.buyer).lean();
        await this.invoiceService.generateInvoice(order, buyer);
      }

      res.download(filePath, fileName);
    } catch (err) {
      next(err);
    }
  };


  // Delete order
  delete = async (req: any, res: any, next: any) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ status: "error", message: "Order not found" });
      }

      // Check permission: Only allow deleting if status is pending (e.g. failed payment)
      // And only by the buyer or admin
      const userId = (req as any).user?._id?.toString();
      const userRole = (req as any).user?.role;

      if (userRole !== 'admin' && order.buyer?.toString() !== userId) {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
      }

      if (order.status !== 'pending' && order.status !== 'cancelled') {
        return res.status(400).json({ status: "error", message: "Cannot delete processed order" });
      }

      // Release stock if reserved
      if (order.lineItems && order.lineItems.length > 0) {
        try {
          for (const item of order.lineItems) {
            await this.inventoryService.releaseStock(
              item.productId.toString(),
              item.qty,
              orderId,
              "Order deleted"
            );
          }
        } catch (stockError) {
          console.error('Failed to release stock for deleted order:', stockError);
        }
      }

      await Order.findByIdAndDelete(orderId);

      res.json({ status: "success", message: "Order deleted successfully" });
    } catch (err) {
      next(err);
    }
  };
}

export default new OrderController();
