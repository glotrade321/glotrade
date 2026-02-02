// apps/api/src/routes/realtime.routes.ts
import { Router } from 'express';
import { realTimeNotificationService } from '../services/RealTimeNotificationService';
import { auth } from '../middleware/auth';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = Router();
const userService = new UserService();

// Handle preflight for SSE endpoint
router.options('/notifications/stream', (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  res.status(200).end();
});

// SSE endpoint for real-time notifications (no auth middleware - handles auth via query param)
router.get('/notifications/stream', async (req: any, res: any) => {
  try {
    // console.log('SSE connection attempt:', req.query);

    // Get token from query parameter
    const token = req.query.token as string;
    if (!token) {
      // console.log('No token provided');
      return res.status(401).json({ error: 'Token required' });
    }

    // console.log('Token received:', token.substring(0, 20) + '...');

    // Handle different token types (JWT or MongoDB ObjectId)
    let userId: string;

    if (/^[a-f\d]{24}$/i.test(token)) {
      // MongoDB ObjectId - use directly as userId
      userId = token;
    } else {
      // JWT token - decode to get userId
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        // console.log('JWT decoded successfully:', { id: decoded.id, email: decoded.email });
      } catch (jwtError) {
        // console.log('JWT verification failed:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }

      if (!decoded.id) {
        // console.log('No ID in decoded token');
        return res.status(401).json({ error: 'Invalid token payload' });
      }
      userId = decoded.id;
    }

    // Get user
    // console.log('Looking up user with ID:', userId);
    const user = await userService.findById(userId);
    if (!user) {
      // console.log('User not found for ID:', userId);
      return res.status(401).json({ error: 'User not found' });
    }
    // console.log('User found:', { id: user.id, email: user.email, role: user.role });

    // Establish SSE connection via service
    // The service handles headers, initial message, and centralized heartbeats
    realTimeNotificationService.establishConnection(user.id, req, res);

  } catch (error) {
    console.error('SSE connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply authentication middleware for other endpoints
router.use(auth(userService));

// Health check endpoint for real-time service
router.get('/notifications/health', (req: any, res: any) => {
  const activeConnections = realTimeNotificationService.getActiveConnectionsCount();
  const activeUsers = realTimeNotificationService.getActiveUserIds();

  res.json({
    status: 'healthy',
    activeConnections,
    activeUsers,
    timestamp: new Date().toISOString()
  });
});

// Get connection status for a user
router.get('/notifications/status', (req: any, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const isConnected = realTimeNotificationService.isUserConnected(req.user.id);

  res.json({
    connected: isConnected,
    userId: req.user.id,
    timestamp: new Date().toISOString()
  });
});

export default router; 