// apps/api/src/services/RealTimeNotificationService.ts
import { Request, Response } from 'express';
import { EventEmitter } from 'events';
import { INotification } from '../types/notification.types';

export interface NotificationEvent {
  type: 'notification' | 'status_update' | 'count_update' | 'connection' | 'heartbeat' | 'system_message' | 'wallet_balance_update' | 'wallet_transaction_update';
  data: any;
  timestamp: Date;
}

export interface ClientConnection {
  userId: string;
  response: any;
  lastSeen: Date;
  isActive: boolean;
}

export class RealTimeNotificationService extends EventEmitter {
  private static instance: RealTimeNotificationService;
  private clientConnections: Map<string, ClientConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.startHeartbeat();
  }

  public static getInstance(): RealTimeNotificationService {
    if (!RealTimeNotificationService.instance) {
      RealTimeNotificationService.instance = new RealTimeNotificationService();
    }
    return RealTimeNotificationService.instance;
  }

  /**
   * Establish SSE connection for a user
   */
  public establishConnection(userId: string, req: any, res: any): void {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    this.sendEvent(res, {
      type: 'connection',
      data: { message: 'Connected to notification stream', userId },
      timestamp: new Date()
    });

    // Store client connection
    const connection: ClientConnection = {
      userId,
      response: res,
      lastSeen: new Date(),
      isActive: true
    };

    this.clientConnections.set(userId, connection);

    // Handle client disconnect
    (req as any).on('close', () => {
      this.removeConnection(userId);
    });

    (req as any).on('error', () => {
      this.removeConnection(userId);
    });
  }

  /**
   * Send notification to specific user
   */
  public sendNotificationToUser(userId: string, notification: INotification): void {
    const connection = this.clientConnections.get(userId);
    if (connection && connection.isActive) {
      this.sendEvent(connection.response, {
        type: 'notification',
        data: notification,
        timestamp: new Date()
      });

      // Update last seen
      connection.lastSeen = new Date();
    }
  }

  /**
   * Send notification to multiple users
   */
  public sendNotificationToUsers(userIds: string[], notification: INotification): void {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Send generic event to a specific user
   */
  public sendEventToUser(userId: string, event: NotificationEvent): void {
    const connection = this.clientConnections.get(userId);
    if (connection && connection.isActive) {
      this.sendEvent(connection.response, event);
      connection.lastSeen = new Date();
    }
  }

  /**
   * Broadcast notification to all connected users
   */
  public broadcastNotification(notification: INotification): void {
    this.clientConnections.forEach((connection, userId) => {
      if (connection.isActive) {
        this.sendEvent(connection.response, {
          type: 'notification',
          data: notification,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Update notification status for a user
   */
  public updateNotificationStatus(userId: string, notificationId: string, status: string): void {
    const connection = this.clientConnections.get(userId);
    if (connection && connection.isActive) {
      this.sendEvent(connection.response, {
        type: 'status_update',
        data: { notificationId, status, timestamp: new Date().toISOString() },
        timestamp: new Date()
      });
    }
  }

  /**
   * Update unread count for a user
   */
  public updateUnreadCount(userId: string, count: number): void {
    const connection = this.clientConnections.get(userId);
    if (connection && connection.isActive) {
      this.sendEvent(connection.response, {
        type: 'count_update',
        data: { unreadCount: count, timestamp: new Date().toISOString() },
        timestamp: new Date()
      });
    }
  }

  /**
   * Send system message to user
   */
  public sendSystemMessage(userId: string, message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    const connection = this.clientConnections.get(userId);
    if (connection && connection.isActive) {
      this.sendEvent(connection.response, {
        type: 'system_message',
        data: { message, type, timestamp: new Date().toISOString() },
        timestamp: new Date()
      });
    }
  }

  /**
   * Get active connections count
   */
  public getActiveConnectionsCount(): number {
    let count = 0;
    this.clientConnections.forEach(connection => {
      if (connection.isActive) {
        count++;
      }
    });
    return count;
  }

  /**
   * Get all active user IDs
   */
  public getActiveUserIds(): string[] {
    const activeUsers: string[] = [];
    this.clientConnections.forEach((connection, userId) => {
      if (connection.isActive) {
        activeUsers.push(userId);
      }
    });
    return activeUsers;
  }

  /**
   * Check if user is connected
   */
  public isUserConnected(userId: string): boolean {
    const connection = this.clientConnections.get(userId);
    return connection ? connection.isActive : false;
  }

  /**
   * Remove client connection
   */
  private removeConnection(userId: string): void {
    const connection = this.clientConnections.get(userId);
    if (connection) {
      connection.isActive = false;
      this.clientConnections.delete(userId);

      // Emit disconnect event
      this.emit('client_disconnected', userId);
    }
  }

  /**
   * Send SSE event to client
   */
  private sendEvent(res: any, event: NotificationEvent): void {
    try {
      const eventData = `data: ${JSON.stringify(event)}\n\n`;
      res.write(eventData);
    } catch (error) {
      // res.write can throw if the socket is closed or in a bad state
      // We don't want this to crash the process. 
      // Individual connections are cleaned up by heartbeat or close events.
    }
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clientConnections.forEach((connection, userId) => {
        if (connection.isActive) {
          try {
            this.sendEvent(connection.response, {
              type: 'heartbeat',
              data: { timestamp: new Date().toISOString() },
              timestamp: new Date()
            });
          } catch (error) {
            // Connection is broken, remove it
            this.removeConnection(userId);
          }
        }
      });
    }, 30000); // 30 seconds
  }

  /**
   * Clean up inactive connections
   */
  public cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    this.clientConnections.forEach((connection, userId) => {
      if (connection.isActive && (now.getTime() - connection.lastSeen.getTime()) > inactiveThreshold) {
        this.removeConnection(userId);
      }
    });
  }

  /**
   * Stop the service and clean up
   */
  public stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all connections
    this.clientConnections.forEach((connection) => {
      try {
        connection.response.end();
      } catch (error) {
        // Ignore errors when closing
      }
    });

    this.clientConnections.clear();
  }

  /**
   * Send wallet balance update to user
   */
  sendWalletBalanceUpdate(userId: string, balanceData: {
    currency: 'NGN' | 'ATH';
    available: number;
    frozen: number;
    total: number;
    lastUpdated: Date;
  }) {
    const event: NotificationEvent = {
      type: 'wallet_balance_update',
      data: balanceData,
      timestamp: new Date()
    };

    this.sendEventToUser(userId, event);
  }

  /**
   * Send wallet transaction update to user
   */
  sendWalletTransactionUpdate(userId: string, transactionData: {
    transactionId: string;
    type: string;
    amount: number;
    currency: 'NGN' | 'ATH';
    status: string;
    description: string;
    createdAt: Date;
  }) {
    const event: NotificationEvent = {
      type: 'wallet_transaction_update',
      data: transactionData,
      timestamp: new Date()
    };

    this.sendEventToUser(userId, event);
  }

  /**
   * Send wallet status update (frozen/unfrozen) to user
   */
  sendWalletStatusUpdate(userId: string, statusData: {
    status: 'active' | 'frozen' | 'suspended';
    reason?: string;
    adminNotes?: string;
    updatedAt: Date;
  }) {
    const event: NotificationEvent = {
      type: 'wallet_balance_update',
      data: {
        ...statusData,
        type: 'status_update'
      },
      timestamp: new Date()
    };

    this.sendEventToUser(userId, event);
  }
}

// Export singleton instance
export const realTimeNotificationService = RealTimeNotificationService.getInstance(); 