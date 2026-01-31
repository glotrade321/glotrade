// apps/api/src/services/NotificationTemplates.ts
import {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationTemplate
} from '../types/notification.types';

export class NotificationTemplates {
  private static templates: Map<NotificationType, NotificationTemplate> = new Map();

  static initialize(): void {
    // 1. ORDER LIFECYCLE TEMPLATES (HIGHEST PRIORITY)
    this.templates.set('order_placed', {
      type: 'order_placed',
      title: 'Order Placed successfully',
      message: 'Your order for "{productTitle}" (ID: #{orderNumber}) has been placed successfully. Amount: {currency} {totalAmount}',
      priority: 'high',
      defaultChannels: ['in_app', 'email'],
      variables: ['orderNumber', 'currency', 'totalAmount', 'productTitle']
    });

    this.templates.set('order_confirmed', {
      type: 'order_confirmed',
      title: 'Order Confirmed',
      message: 'Order #{orderNumber} for "{productTitle}" has been confirmed and is being processed',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['orderNumber', 'productTitle']
    });

    this.templates.set('order_processing', {
      type: 'order_processing',
      title: 'Order Processing',
      message: 'Order #{orderNumber} ("{productTitle}") is now being prepared for shipping',
      priority: 'medium',
      defaultChannels: ['in_app'],
      variables: ['orderNumber', 'productTitle']
    });

    this.templates.set('order_shipped', {
      type: 'order_shipped',
      title: 'Order Shipped!',
      message: 'Great news! Order #{orderNumber} for "{productTitle}" has been shipped and is on its way!',
      priority: 'high',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['orderNumber', 'productTitle']
    });

    this.templates.set('order_delivered', {
      type: 'order_delivered',
      title: 'Order Delivered',
      message: 'Order #{orderNumber} for "{productTitle}" has been delivered. Enjoy!',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['orderNumber', 'productTitle']
    });

    this.templates.set('order_cancelled', {
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: 'Order #{orderNumber} has been cancelled. Refund will be processed within 3-5 business days',
      priority: 'high',
      defaultChannels: ['in_app', 'email'],
      variables: ['orderNumber']
    });

    this.templates.set('order_disputed', {
      type: 'order_disputed',
      title: 'Order Dispute Filed',
      message: 'A dispute has been filed for order #{orderNumber}. Our team will review and contact you soon',
      priority: 'urgent',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['orderNumber']
    });

    this.templates.set('order_refunded', {
      type: 'order_refunded',
      title: 'Refund Processed',
      message: 'Refund of {currency} {amount} for order #{orderNumber} has been processed',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['currency', 'amount', 'orderNumber']
    });

    // 2. PAYMENT LIFECYCLE TEMPLATES (HIGH PRIORITY)
    this.templates.set('payment_pending', {
      type: 'payment_pending',
      title: 'Payment Pending',
      message: 'Payment of {currency} {amount} for order #{orderNumber} is pending confirmation',
      priority: 'high',
      defaultChannels: ['in_app', 'email'],
      variables: ['currency', 'amount', 'orderNumber']
    });

    this.templates.set('payment_confirmed', {
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: 'Payment of {currency} {amount} for order for "{productTitle}" (#{orderNumber}) has been confirmed',
      priority: 'high',
      defaultChannels: ['in_app', 'email'],
      variables: ['currency', 'amount', 'orderNumber', 'productTitle']
    });

    this.templates.set('payment_failed', {
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Payment of {currency} {amount} for order #{orderNumber} has failed. Please try again',
      priority: 'urgent',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['currency', 'amount', 'orderNumber']
    });

    this.templates.set('payment_refunded', {
      type: 'payment_refunded',
      title: 'Payment Refunded',
      message: 'Refund of {currency} {amount} has been processed for order #{orderNumber}',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['currency', 'amount', 'orderNumber']
    });

    this.templates.set('payout_processed', {
      type: 'payout_processed',
      title: 'Payout Processed',
      message: 'Payout of {currency} {amount} has been processed to your account',
      priority: 'high',
      defaultChannels: ['in_app', 'email'],
      variables: ['currency', 'amount']
    });

    // 2.5. WALLET TRANSACTION TEMPLATES (HIGH PRIORITY)
    this.templates.set('wallet_transfer_received', {
      type: 'wallet_transfer_received',
      title: 'Money Received',
      message: 'You received {currency} {amount} from {senderName}',
      priority: 'high',
      defaultChannels: ['in_app', 'push', 'email'],
      variables: ['currency', 'amount', 'senderName', 'transactionId']
    });

    this.templates.set('wallet_transfer_sent', {
      type: 'wallet_transfer_sent',
      title: 'Transfer Sent',
      message: 'You sent {currency} {amount} to {recipientName}',
      priority: 'medium',
      defaultChannels: ['in_app', 'push'],
      variables: ['currency', 'amount', 'recipientName', 'transactionId']
    });

    this.templates.set('wallet_deposit_success', {
      type: 'wallet_deposit_success',
      title: 'Deposit Successful',
      message: 'Your wallet has been credited with {currency} {amount}',
      priority: 'high',
      defaultChannels: ['in_app', 'push', 'email'],
      variables: ['currency', 'amount', 'transactionId']
    });

    this.templates.set('wallet_deposit_failed', {
      type: 'wallet_deposit_failed',
      title: 'Deposit Failed',
      message: 'Your deposit of {currency} {amount} failed. Please try again',
      priority: 'urgent',
      defaultChannels: ['in_app', 'push', 'email'],
      variables: ['currency', 'amount', 'transactionId', 'reason']
    });

    this.templates.set('wallet_withdrawal_success', {
      type: 'wallet_withdrawal_success',
      title: 'Withdrawal Successful',
      message: 'Withdrawal of {currency} {amount} has been processed to your bank account',
      priority: 'high',
      defaultChannels: ['in_app', 'push', 'email'],
      variables: ['currency', 'amount', 'transactionId']
    });

    this.templates.set('wallet_withdrawal_failed', {
      type: 'wallet_withdrawal_failed',
      title: 'Withdrawal Failed',
      message: 'Your withdrawal of {currency} {amount} failed. Please check your bank details',
      priority: 'urgent',
      defaultChannels: ['in_app', 'push', 'email'],
      variables: ['currency', 'amount', 'transactionId', 'reason']
    });

    this.templates.set('wallet_frozen', {
      type: 'wallet_frozen',
      title: 'Wallet Frozen',
      message: 'Your wallet has been frozen. Contact support for assistance',
      priority: 'urgent',
      defaultChannels: ['in_app', 'push', 'email'],
      variables: ['reason', 'adminNotes']
    });

    this.templates.set('wallet_unfrozen', {
      type: 'wallet_unfrozen',
      title: 'Wallet Unfrozen',
      message: 'Your wallet has been unfrozen and is now active',
      priority: 'high',
      defaultChannels: ['in_app', 'push', 'email'],
      variables: ['reason']
    });

    this.templates.set('wallet_low_balance', {
      type: 'wallet_low_balance',
      title: 'Low Balance Alert',
      message: 'Your {currency} wallet balance is low: {currency} {amount}',
      priority: 'medium',
      defaultChannels: ['in_app', 'push'],
      variables: ['currency', 'amount']
    });

    // 3. PRODUCT UPDATE TEMPLATES (MEDIUM PRIORITY)
    this.templates.set('product_created', {
      type: 'product_created',
      title: 'New Product Available',
      message: 'New product "{productTitle}" is now available in {category}',
      priority: 'low',
      defaultChannels: ['in_app'],
      variables: ['productTitle', 'category']
    });

    this.templates.set('product_updated', {
      type: 'product_updated',
      title: 'Product Updated',
      message: 'Product "{productTitle}" has been updated with new information',
      priority: 'low',
      defaultChannels: ['in_app'],
      variables: ['productTitle']
    });

    this.templates.set('product_out_of_stock', {
      type: 'product_out_of_stock',
      title: 'Product Out of Stock',
      message: 'Product "{productTitle}" is currently out of stock',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['productTitle']
    });

    this.templates.set('product_back_in_stock', {
      type: 'product_back_in_stock',
      title: 'Product Back in Stock!',
      message: 'Great news! "{productTitle}" is back in stock. Order now before it sells out!',
      priority: 'medium',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['productTitle']
    });

    this.templates.set('price_changed', {
      type: 'price_changed',
      title: 'Price Change Alert',
      message: 'Price for "{productTitle}" has changed from {oldPrice} to {newPrice}',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['productTitle', 'oldPrice', 'newPrice']
    });

    this.templates.set('new_review', {
      type: 'new_review',
      title: 'New Review Received',
      message: 'You received a new {rating}-star review for "{productTitle}"',
      priority: 'low',
      defaultChannels: ['in_app'],
      variables: ['rating', 'productTitle']
    });

    // 4. SECURITY    // WALLET TEMPLATES

    // Withdrawal notifications
    this.templates.set('withdrawal_requested', {
      type: 'withdrawal_requested',
      title: 'Withdrawal Request Submitted',
      message: 'Your withdrawal request for {currency} {amount} has been submitted and is pending approval',
      priority: 'high',
      defaultChannels: ['in_app', 'email'],
      variables: ['currency', 'amount', 'reference']
    });

    this.templates.set('withdrawal_approved', {
      type: 'withdrawal_approved',
      title: 'Withdrawal Approved',
      message: 'Your withdrawal request for {currency} {amount} has been approved and is being processed',
      priority: 'high',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['currency', 'amount', 'reference']
    });

    this.templates.set('withdrawal_rejected', {
      type: 'withdrawal_rejected',
      title: 'Withdrawal Request Rejected',
      message: 'Your withdrawal request for {currency} {amount} has been rejected. Reason: {reason}',
      priority: 'urgent',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['currency', 'amount', 'reference', 'reason']
    });

    this.templates.set('withdrawal_completed', {
      type: 'withdrawal_completed',
      title: 'Withdrawal Completed',
      message: '{currency} {amount} has been successfully transferred to your bank account',
      priority: 'high',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['currency', 'amount', 'reference', 'bankName']
    });

    this.templates.set('withdrawal_failed', {
      type: 'withdrawal_failed',
      title: 'Withdrawal Failed',
      message: 'Your withdrawal request for {currency} {amount} has failed. The funds have been returned to your wallet',
      priority: 'urgent',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['currency', 'amount', 'reference', 'reason']
    });

    // WALLET TEMPLATES (existing) (MEDIUM PRIORITY)
    this.templates.set('login_alert', {
      type: 'login_alert',
      title: 'New Login Detected',
      message: 'New login detected from {location} at {timestamp}. If this wasn\'t you, please secure your account',
      priority: 'high',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['location', 'timestamp']
    });

    this.templates.set('password_changed', {
      type: 'password_changed',
      title: 'Password Changed',
      message: 'Your password was changed successfully at {timestamp}',
      priority: 'high',
      defaultChannels: ['in_app', 'email'],
      variables: ['timestamp']
    });

    this.templates.set('suspicious_activity', {
      type: 'suspicious_activity',
      title: 'Suspicious Activity Detected',
      message: 'We detected suspicious activity on your account. Please verify your recent actions',
      priority: 'urgent',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: []
    });

    // 5. COMMUNICATION & BUSINESS TEMPLATES
    this.templates.set('message_received', {
      type: 'message_received',
      title: 'New Message',
      message: 'You have a new message from {sender} regarding {subject}',
      priority: 'medium',
      defaultChannels: ['in_app', 'push'],
      variables: ['sender', 'subject']
    });

    this.templates.set('support_ticket', {
      type: 'support_ticket',
      title: 'Support Ticket Update',
      message: 'Your support ticket #{ticketId} has been updated: {status}',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['ticketId', 'status']
    });

    this.templates.set('announcement', {
      type: 'announcement',
      title: 'Important Announcement',
      message: '{title}: {message}',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['title', 'message']
    });

    this.templates.set('new_order', {
      type: 'new_order',
      title: 'New Order Received',
      message: 'You received a new order for "{productTitle}" (#{orderNumber}) for {currency} {totalAmount}',
      priority: 'high',
      defaultChannels: ['in_app', 'email', 'push'],
      variables: ['orderNumber', 'currency', 'totalAmount', 'productTitle']
    });

    this.templates.set('low_stock', {
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Product "{productTitle}" is running low on stock. Current quantity: {quantity}',
      priority: 'medium',
      defaultChannels: ['in_app', 'email'],
      variables: ['productTitle', 'quantity']
    });

    this.templates.set('revenue_milestone', {
      type: 'revenue_milestone',
      title: 'Revenue Milestone Reached!',
      message: 'Congratulations! You\'ve reached {currency} {amount} in total revenue',
      priority: 'low',
      defaultChannels: ['in_app', 'email'],
      variables: ['currency', 'amount']
    });

    this.templates.set('promotion', {
      type: 'promotion',
      title: 'Special Promotion',
      message: '{promotionTitle}: {promotionDescription}',
      priority: 'low',
      defaultChannels: ['in_app', 'email'],
      variables: ['promotionTitle', 'promotionDescription']
    });
  }

  static getTemplate(type: NotificationType): NotificationTemplate | undefined {
    return this.templates.get(type);
  }

  static getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  static formatMessage(template: NotificationTemplate, data: Record<string, any>): string {
    let message = template.message;

    // Replace variables with actual data
    template.variables.forEach(variable => {
      const value = data[variable];
      if (value !== undefined) {
        // Handle both {variable} and #{variable} formats
        const placeholder1 = `{${variable}}`;
        const placeholder2 = `#{${variable}}`;
        message = message.replace(new RegExp(placeholder1, 'g'), String(value));
        message = message.replace(new RegExp(placeholder2, 'g'), String(value));
      }
    });

    return message;
  }

  static formatTitle(template: NotificationTemplate, data: Record<string, any>): string {
    let title = template.title;

    // Replace variables with actual data
    template.variables.forEach(variable => {
      const value = data[variable];
      if (value !== undefined) {
        // Handle both {variable} and #{variable} formats
        const placeholder1 = `{${variable}}`;
        const placeholder2 = `#{${variable}}`;
        title = title.replace(new RegExp(placeholder1, 'g'), String(value));
        title = title.replace(new RegExp(placeholder2, 'g'), String(value));
      }
    });

    return title;
  }
}

// Initialize templates when module is imported
NotificationTemplates.initialize(); 