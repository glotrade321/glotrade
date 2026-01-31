// apps/api/src/services/NotificationService.ts
import { Model } from "mongoose";
import { BaseService } from "./BaseService";
import { NotificationTemplates } from "./NotificationTemplates";
import { realTimeNotificationService } from "./RealTimeNotificationService";
import EmailService from "./EmailService";
import {
  INotification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  CreateNotificationOptions,
  UpdateNotificationOptions,
  NotificationFilters,
  NotificationStats,
  NotificationPreferences,
  DeliveryResult
} from "../types/notification.types";
import Notification from "../models/Notification";

export class NotificationService extends BaseService<INotification> {
  protected model: Model<INotification>;

  constructor() {
    super(Notification);
    this.model = Notification;
  }

  /**
   * Create a new notification with template processing
   */
  async createNotification(options: CreateNotificationOptions): Promise<INotification> {
    const template = NotificationTemplates.getTemplate(options.type);
    if (!template) {
      throw new Error(`Notification template not found for type: ${options.type}`);
    }

    // Format title and message using template
    const title = NotificationTemplates.formatTitle(template, options.data || {});
    const message = NotificationTemplates.formatMessage(template, options.data || {});

    // Determine channels based on template defaults and user preferences
    const channels = options.channels || template.defaultChannels;
    const channelConfigs = channels.map(channelType => ({
      type: channelType,
      enabled: true,
      config: {},
      status: 'active' as const
    }));

    // Create notification
    const notification = await this.model.create({
      userId: options.userId,
      type: options.type,
      title,
      message,
      data: options.data || {},
      priority: options.priority || template.priority,
      channels: channelConfigs,
      expiresAt: options.expiresAt
    });

    // Send real-time notification if user is connected
    try {
      realTimeNotificationService.sendNotificationToUser(options.userId.toString(), notification);
    } catch (error) {
      console.error('Failed to send real-time notification:', error);
    }

    // Send email if channel is enabled
    if (channels.includes('email') && process.env.EMAIL_ENABLED !== 'false') {
      this.sendEmailNotification(options.userId.toString(), title, message).catch(err => {
        console.error('Failed to send notification email:', err);
      });
    }

    return notification;
  }

  /**
   * Helper to send email notification
   */
  private async sendEmailNotification(userId: string, subject: string, html: string): Promise<void> {
    try {
      const user = await this.model.db.model('User').findById(userId);
      if (user && user.email) {
        await EmailService.sendEmail({
          to: user.email,
          subject,
          html: `<p>${html}</p>`
        });
      }
    } catch (error) {
      console.error(`Error sending email notification to user ${userId}:`, error);
    }
  }

  /**
   * Create order lifecycle notifications
   */
  async createOrderNotification(
    type: 'order_placed' | 'order_confirmed' | 'order_processing' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'order_disputed' | 'order_refunded',
    orderData: {
      orderId: string;
      orderNumber?: string;
      totalAmount?: number;
      currency?: string;
      status?: string;
      buyerId: string;
      sellerId: string;
      productId?: string;
      productTitle?: string;
      quantity?: number;
    }
  ): Promise<{ buyerNotification?: INotification; sellerNotification?: INotification }> {
    const notifications: { buyerNotification?: INotification; sellerNotification?: INotification } = {};

    // Create buyer notification
    if (orderData.buyerId) {
      notifications.buyerNotification = await this.createNotification({
        userId: orderData.buyerId,
        type,
        title: '', // Will be formatted by template
        message: '', // Will be formatted by template
        data: {
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          totalAmount: orderData.totalAmount,
          currency: orderData.currency,
          status: orderData.status,
          productTitle: orderData.productTitle,
          quantity: orderData.quantity
        }
      });
    }

    // Create seller notification for certain types
    // Skip if seller is the same as buyer (avoid double notifications in single-vendor/testing)
    if (orderData.sellerId && orderData.sellerId.toString() !== orderData.buyerId.toString() && ['order_placed', 'order_disputed', 'order_cancelled'].includes(type)) {
      notifications.sellerNotification = await this.createNotification({
        userId: orderData.sellerId,
        type: type === 'order_placed' ? 'new_order' : type,
        title: '', // Will be formatted by template
        message: '', // Will be formatted by template
        data: {
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          totalAmount: orderData.totalAmount,
          currency: orderData.currency,
          buyerId: orderData.buyerId,
          productTitle: orderData.productTitle,
          quantity: orderData.quantity
        }
      });
    }

    return notifications;
  }

  /**
   * Create payment notifications
   */
  async createPaymentNotification(
    type: 'payment_pending' | 'payment_confirmed' | 'payment_failed' | 'payment_refunded' | 'payout_processed',
    paymentData: {
      paymentId: string;
      orderId: string;
      amount: number;
      currency: string;
      method: string;
      status: string;
      transactionId?: string;
      userId: string;
    }
  ): Promise<INotification> {
    // Generate orderNumber from orderId (last 6 characters for user-friendliness)
    const orderNumber = paymentData.orderId.slice(-6);

    return await this.createNotification({
      userId: paymentData.userId,
      type,
      title: '', // Will be formatted by template
      message: '', // Will be formatted by template
      data: {
        paymentId: paymentData.paymentId,
        orderId: paymentData.orderId,
        orderNumber, // Add orderNumber for templates
        amount: paymentData.amount,
        currency: paymentData.currency,
        method: paymentData.method,
        status: paymentData.status,
        transactionId: paymentData.transactionId
      }
    });
  }

  /**
   * Create product notifications
   */
  async createProductNotification(
    type: 'product_created' | 'product_updated' | 'product_out_of_stock' | 'product_back_in_stock' | 'price_changed' | 'new_review',
    productData: {
      productId: string;
      productTitle: string;
      price?: number;
      oldPrice?: number;
      quantity?: number;
      category?: string;
      sellerId: string;
      rating?: number;
    }
  ): Promise<INotification> {
    return await this.createNotification({
      userId: productData.sellerId,
      type,
      title: '', // Will be formatted by template
      message: '', // Will be formatted by template
      data: {
        productId: productData.productId,
        productTitle: productData.productTitle,
        price: productData.price,
        oldPrice: productData.oldPrice,
        newPrice: productData.price,
        quantity: productData.quantity,
        category: productData.category,
        rating: productData.rating
      }
    });
  }

  /**
   * Create security notifications
   */
  async createSecurityNotification(
    type: 'login_alert' | 'password_changed' | 'suspicious_activity',
    securityData: {
      userId: string;
      ipAddress?: string;
      location?: string;
      deviceInfo?: string;
      timestamp: Date;
      action: string;
    }
  ): Promise<INotification> {
    return await this.createNotification({
      userId: securityData.userId,
      type,
      title: '', // Will be formatted by template
      message: '', // Will be formatted by template
      data: {
        ipAddress: securityData.ipAddress,
        location: securityData.location,
        deviceInfo: securityData.deviceInfo,
        timestamp: securityData.timestamp,
        action: securityData.action
      }
    });
  }

  /**
   * Get user notifications with filtering
   */
  async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<{ notifications: INotification[]; total: number }> {
    const query: any = { userId };

    // Apply filters
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const total = await this.model.countDocuments(query);
    const notifications = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.offset || 0);

    return { notifications, total };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await this.model.findOneAndUpdate(
      { _id: notificationId, userId },
      {
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { userId, status: 'unread' },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId: string, userId: string): Promise<INotification> {
    const notification = await this.model.findOneAndUpdate(
      { _id: notificationId, userId },
      { status: 'archived' },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return notification;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await this.model.deleteOne({ _id: notificationId, userId });

    if (result.deletedCount === 0) {
      throw new Error('Notification not found or access denied');
    }
  }

  /**
   * Get notification statistics for user
   */
  async getUserNotificationStats(userId: string): Promise<NotificationStats> {
    const stats = await this.model.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
          byType: { $push: '$type' },
          byPriority: { $push: '$priority' }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
        byType: {} as Record<NotificationType, number>,
        byPriority: {} as Record<NotificationPriority, number>,
        byChannel: {} as Record<NotificationChannel, number>
      };
    }

    const stat = stats[0];

    // Count by type
    const byType: Record<string, number> = {};
    stat.byType.forEach((type: string) => {
      byType[type] = (byType[type] || 0) + 1;
    });

    // Count by priority
    const byPriority: Record<string, number> = {};
    stat.byPriority.forEach((priority: string) => {
      byPriority[priority] = (byPriority[priority] || 0) + 1;
    });

    return {
      total: stat.total,
      unread: stat.unread,
      read: stat.read,
      archived: stat.archived,
      byType,
      byPriority,
      byChannel: {} as Record<NotificationChannel, number> // TODO: Implement channel statistics
    };
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.model.countDocuments({ userId, status: 'unread' });
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    return { deletedCount: result.deletedCount };
  }

  /**
   * Bulk create notifications for multiple users
   */
  async bulkCreateNotifications(
    notifications: Array<CreateNotificationOptions & { userId: string }>
  ): Promise<INotification[]> {
    const createdNotifications: INotification[] = [];

    for (const notificationData of notifications) {
      try {
        const notification = await this.createNotification(notificationData);
        createdNotifications.push(notification);
      } catch (error) {
        console.error(`Failed to create notification for user ${notificationData.userId}:`, error);
        // Continue with other notifications
      }
    }

    return createdNotifications;
  }

  /**
   * Send notification to admin team
   */
  async sendAdminNotification(notificationData: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<void> {
    try {
      // Find all admin users
      const adminUsers = await this.model.db.model('User').find({
        $or: [
          { role: 'admin' },
          { isAdmin: true },
          { isSuperAdmin: true }
        ]
      });

      if (adminUsers.length === 0) {
        console.warn('No admin users found to send notification to');
        return;
      }

      // Create notifications for all admin users
      const adminNotifications = adminUsers.map(adminUser => ({
        userId: adminUser._id,
        type: notificationData.type as NotificationType,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        priority: 'high' as NotificationPriority,
        channels: ['in_app'] as NotificationChannel[]
      }));

      await this.bulkCreateNotifications(adminNotifications);
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }
}
