// yarn dev
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { connectDB } from "./config/db";
import { cacheService } from "./services/CacheService";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import tokenRoutes from "./routes/token.routes";
import marketRoutes from "./routes/market.routes";
import paymentRoutes from "./routes/payment.routes";
import vendorRoutes from "./routes/vendor.routes";
import sellerRoutes from "./routes/seller.routes";
import payoutRoutes from "./routes/payout.routes";
import orderRoutes from "./routes/order.routes";
import voucherRoutes from "./routes/voucher.routes";
import walletRoutes from "./routes/wallet.routes";
import withdrawalRoutes from "./routes/withdrawal.routes";
import notificationRoutes from "./routes/notification.routes";
import realtimeRoutes from "./routes/realtime.routes";
import userPreferencesRoutes from "./routes/userPreferences.routes";
import avatarRoutes from "./routes/avatar.routes";
import productImageRoutes from "./routes/productImage.routes";
import securityReportRoutes from "./routes/securityReport.routes";
import businessDocumentRoutes from "./routes/businessDocument.routes";
import fileUploadRoutes from "./routes/fileUpload.routes";
import bannerRoutes from "./routes/banner.routes";
import creditRequestRoutes from "./routes/creditRequest.routes";
import referralRoutes from "./routes/referral.routes";
import commissionRoutes from "./routes/commission.routes";
import adminCommissionRoutes from "./routes/admin/commission.routes";
import gdipRoutes from "./routes/gdip.routes";
import insuranceRoutes from "./routes/insurance.routes";
import imageRoutes from "./routes/image.routes";
import supportRoutes from "./routes/support.routes";
import productManagerRoutes from "./routes/productManager.routes";
import managerRoutes from "./routes/manager.routes";
import orderManagerRoutes from "./routes/orderManager.routes";

import { errorHandler } from "./middleware/errorHandler";
import { initScheduledJobs } from "./jobs/scheduler";

// Load environment variables
// Configured at top of file

const app = express();
const IS_PROD = process.env.NODE_ENV === "production";

// Global header middleware
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Security middleware
// Configure CORS to support credentials by reflecting a specific allowed origin (not "*")
const rawAllowedOrigins = process.env.CORS_ORIGIN || "http://localhost:3000";
const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)
  .flatMap((o) => {
    // If it's a localhost entry, ensure it works with http (and https if needed)
    if (o.includes("localhost")) {
      if (o.startsWith("http")) return [o];
      return [`http://${o}`, `https://${o}`]; // Allow both for localhost dev setups
    }

    // For non-localhost, handle www and protocol
    let domain = o;
    let protocol = "https"; // Default to https

    if (o.startsWith("http://")) {
      protocol = "http";
      domain = o.slice(7);
    } else if (o.startsWith("https://")) {
      protocol = "https";
      domain = o.slice(8);
    }

    // Normalize: remove trailing slash if present
    if (domain.endsWith("/")) domain = domain.slice(0, -1);

    const isWww = domain.startsWith("www.");
    const baseDomain = isWww ? domain.slice(4) : domain;

    // Return both http and https, www and non-www variants
    return [
      `http://${baseDomain}`,
      `https://${baseDomain}`,
      `http://www.${baseDomain}`,
      `https://www.${baseDomain}`
    ];
  });

console.log("🔒 CORS Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin), e.g., server-to-server or curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Check for trailing slash mismatch
      const originNoSlash = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      if (allowedOrigins.includes(originNoSlash)) return callback(null, true);

      console.warn(`⚠️ CORS Blocked: Origin '${origin}' not in allowed list:`, allowedOrigins);
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "http://localhost:8080", ...allowedOrigins],
        "upgrade-insecure-requests": IS_PROD ? [] : null,
      },
    },
  })
);

// Rate limiting (skip in development to avoid 429s during SSR/HMR and local testing)
const redisClient = cacheService.getClient();
const useRedisRateLimitStore = cacheService.isRedisReady();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: IS_PROD ? 300 : 100000, // generous in dev; higher headroom in prod
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !IS_PROD,
  message: "Too many requests, please try again shortly.",
  store: useRedisRateLimitStore && redisClient
    ? new RedisStore({
      // @ts-expect-error - ioredis types mismatch with rate-limit-redis but it works
      sendCommand: (...args: string[]) => redisClient.call(...args),
      prefix: "rl:", // Rate Limiter prefix
    })
    : undefined, // Falls back to default MemoryStore
});

// Apply global rate limiter
app.use(limiter);

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

import cookieParser from "cookie-parser";

// ... imports

// Body parsing
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get("/health", (req: any, res: any) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Base route
app.get("/", (req: any, res: any) => {
  res.json({
    message: "Glotrade International API",
    version: "1.0.0",
    documentation: process.env.NODE_ENV === 'production'
      ? 'https://glotrade-ecom.onrender.com/api-docs'
      : `http://localhost:${process.env.PORT || 8080}/api-docs`,
  });
});

// Added /v1 to all routes for future versioning support
// API routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/tokens", tokenRoutes);
app.use("/api/v1/market", marketRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/sellers", sellerRoutes);
app.use("/api/v1/payouts", payoutRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/vouchers", voucherRoutes);
app.use("/api/v1/wallets", walletRoutes);
app.use("/api/v1/withdrawals", withdrawalRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/realtime", realtimeRoutes);
app.use("/api/v1/user-preferences", userPreferencesRoutes);
app.use("/api/v1/avatars", avatarRoutes);
app.use("/api/v1/product-images", productImageRoutes);
app.use("/api/v1/security-reports", securityReportRoutes);
app.use("/api/v1/business-documents", businessDocumentRoutes);
app.use("/api/v1/files", fileUploadRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/credit-requests", creditRequestRoutes);
app.use("/api/v1/referrals", referralRoutes);
app.use("/api/v1/commissions", commissionRoutes);
app.use("/api/v1/admin/commissions", adminCommissionRoutes);
app.use("/api/v1/gdip", gdipRoutes);
app.use("/api/v1/insurance", insuranceRoutes);
app.use("/api/v1/images", imageRoutes);
app.use("/api/v1/support", supportRoutes);
app.use("/api/v1/admin/product-managers", productManagerRoutes);
app.use("/api/v1/admin/managers", managerRoutes);
app.use("/api/v1/order-manager", orderManagerRoutes);



// 404 handler
app.use("*", (req: any, res: any) => {
  res.status(404).json({
    status: "error",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handling middleware
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize scheduled jobs
    initScheduledJobs();

    // Start the server
    app.listen(PORT, () => {
      console.log(`🌐 Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔒 Security: Helmet enabled`);
      console.log(
        `📝 Logging: Morgan ${NODE_ENV === "production" ? "combined" : "dev"
        } mode`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();

export default app;
