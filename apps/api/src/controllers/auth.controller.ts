// Express types handled by any
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { ValidationError } from "../utils/errors";
import { WalletService } from "../services/WalletService";
import { UserService } from "../services/UserService";
import ReferralService from "../services/ReferralService";
import CommissionService from "../services/CommissionService";
import EmailService from "../services/EmailService";


export class AuthController {
  private walletService: WalletService;
  private userService: UserService;

  constructor() {
    this.walletService = new WalletService();
    this.userService = new UserService();
  }

  register = async (req: any, res: any, next: any) => {
    try {
      const { email, username, password, accountType, businessInfo, referralCode } = req.body || {};
      if (!email || !username || !password) throw new ValidationError("Missing fields");

      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedUsername = String(username).trim();

      // Sanitize optional address; avoid creating empty-string duplicates
      const rawAddress = typeof req.body?.address === 'string' ? String(req.body.address).trim() : undefined;
      const address = rawAddress && rawAddress.length > 0 ? rawAddress.toLowerCase() : undefined;

      // Check duplicates individually to return precise errors
      const emailDoc = await User.findOne({ email: normalizedEmail });
      const usernameDoc = await User.findOne({ username: normalizedUsername });

      let addressDoc = null;
      if (address) {
        addressDoc = await User.findOne({ address });
      }

      if (emailDoc) throw new ValidationError('email already exists');
      if (usernameDoc) throw new ValidationError('username already exists');
      if (address && addressDoc) throw new ValidationError('address already exists');

      // Validate referral code if provided
      if (referralCode) {
        const isValid = await ReferralService.validateReferralCode(referralCode);
        if (!isValid) {
          throw new ValidationError('Invalid referral code');
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const verifyToken = crypto.randomBytes(24).toString("hex");

      // Normalize accountType
      const normalizedAccountType = accountType === 'individual' ? 'individual' : 'business';

      const createDoc: any = {
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        verifyToken,
        verifyTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        accountType: normalizedAccountType
      };

      if (normalizedAccountType === 'business' && businessInfo) {
        createDoc.businessInfo = {
          companyName: String(businessInfo.companyName || '').trim(),
          taxId: String(businessInfo.taxId || '').trim(),
          businessType: String(businessInfo.businessType || 'Wholesaler'),
          registrationNumber: String(businessInfo.registrationNumber || '').trim(),
          website: String(businessInfo.website || '').trim(),
          industry: String(businessInfo.industry || '').trim(),
          yearEstablished: Number(businessInfo.yearEstablished) || undefined,
          isVerified: false // Always false initially
        };

        // Generate referral code for Sales Agents
        if (businessInfo.businessType === 'Sales Agent') {
          const agentReferralCode = await ReferralService.generateReferralCode('temp');
          createDoc.businessInfo.referralCode = agentReferralCode;
          createDoc.businessInfo.agentStats = {
            totalReferrals: 0,
            activeReferrals: 0,
            totalCommissionEarned: 0,
            pendingCommission: 0,
            tier: 'Bronze'
          };
        }

        // Track referral if code was provided
        if (referralCode) {
          createDoc.businessInfo.referredBy = referralCode.toUpperCase();
        }

        // Initialize Distributor Stats
        if (businessInfo.businessType === 'Distributor') {
          const nextDate = new Date();
          // Use default 90 days if config not loaded yet, though config should be available
          const intervalDays = parseInt(process.env.DISTRIBUTOR_REWARD_INTERVAL_DAYS || '90', 10);
          nextDate.setDate(nextDate.getDate() + intervalDays);

          createDoc.businessInfo.distributorStats = {
            nextRewardDate: nextDate,
            totalRewardsEarned: 0
          };
        }
      }

      // Only add address if it's provided
      if (address) {
        createDoc.address = address;
      }

      const user = await User.create(createDoc);

      // Track referral after user creation
      if (referralCode) {
        try {
          const referral = await ReferralService.trackReferral(
            referralCode,
            user._id.toString(),
            {
              source: req.headers['referer'] || 'direct',
              ipAddress: req.ip,
              userAgent: req.headers['user-agent']
            }
          );

          // Create registration commission if configured
          if (referral) {
            await CommissionService.calculateRegistrationCommission(referral._id.toString());
          }
        } catch (referralError) {
          console.warn('Failed to track referral:', referralError);
          // Don't fail registration if referral tracking fails
        }
      }

      // Create wallets for new user
      try {
        const isWholesaler = accountType === 'business' && businessInfo?.businessType === 'Wholesaler';
        if (!isWholesaler) {
          await this.walletService.createUserWallets(user._id.toString());
        }
      } catch (error) {
        console.warn(`Failed to create wallets for new user ${user._id}:`, error);
        // Don't fail registration if wallet creation fails, just log the warning
      }

      const origin = process.env.APP_ORIGIN || "http://localhost:3000";
      const url = `${origin}/auth/verify?token=${verifyToken}`;

      // Fire-and-forget email sending
      if (process.env.NODE_ENV !== 'test') {
        EmailService.sendVerificationEmail(normalizedEmail, url).catch(err =>
          console.warn("Verification email failed to send:", err)
        );
      }

      const token = jwt.sign(
        { id: user._id, role: (user as any).role || 'buyer' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Set secure cookie
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        status: "success",
        token,
        data: {
          token, // Restore for frontend compatibility
          id: user._id,
          email,
          username,
          businessInfo: (user as any).businessInfo
        }
      });
    } catch (e) {
      next(e);
    }
  };

  login = async (req: any, res: any, next: any) => {
    try {
      const { email, username, password } = req.body || {};

      // Support both email and username login
      let user;
      if (email) {
        user = await User.findOne({ email });
      } else if (username) {
        user = await User.findOne({ username });
      } else {
        throw new ValidationError("Email or username is required");
      }

      if (!user || !(user as any).passwordHash) throw new ValidationError("Invalid credentials");

      // Check if account is marked for deletion
      if ((user as any).isDeletionRequested) {
        // Generate reactivation token and send email
        const reactivationToken = crypto.randomBytes(24).toString("hex");
        (user as any).verifyToken = reactivationToken;
        (user as any).verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

        // Send reactivation email
        const origin = process.env.APP_ORIGIN || "http://localhost:3000";
        const reactivationUrl = `${origin}/auth/reactivate?token=${reactivationToken}`;

        EmailService.sendReactivationEmail(user.email, reactivationUrl, (user as any).deletionCount || 1).catch(err =>
          console.error('Failed to send reactivation email:', err)
        );

        await user.save();
        throw new ValidationError("Account is marked for deletion. A reactivation email has been sent to your email address.");
      }

      const ok = await bcrypt.compare(password, (user as any).passwordHash);
      if (!ok) throw new ValidationError("Invalid credentials");

      // Ensure user has walletId (for existing users who might not have it)
      try {
        const isWholesaler = (user as any).businessInfo?.businessType === 'Wholesaler';

        if (!isWholesaler) {
          const walletId = await this.userService.ensureWalletId(user._id.toString());
          (user as any).walletId = walletId;
          console.log(`Ensured walletId ${walletId} for user ${user.email}`);

          // Refresh user object to get updated data
          const refreshedUser = await User.findById(user._id);
          if (refreshedUser) {
            Object.assign(user, refreshedUser.toObject());
          }
        }
      } catch (error) {
        console.warn(`Failed to ensure walletId for user ${user._id}:`, error);
      }

      // Ensure user has wallets created (auto-create if they don't exist)
      try {
        const isWholesaler = (user as any).businessInfo?.businessType === 'Wholesaler';
        if (!isWholesaler) {
          await this.walletService.getWalletSummary(user._id.toString(), "user");
        }
      } catch (error) {
        console.warn(`Failed to ensure wallets for user ${user._id}:`, error);
        // Don't fail login if wallet creation fails, just log the warning
      }

      // Generate JWT token for authentication
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          username: user.username,
          role: (user as any).role || 'buyer'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set secure cookie
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        status: 'success',
        token,
        data: {
          token, // Restore for frontend compatibility
          id: user._id,
          email: user.email,
          username: user.username,
          role: (user as any).role || 'buyer',
          assignedRoles: (user as any).assignedRoles || [],
          isEmailVerified: (user as any).emailVerified,
          firstName: (user as any).firstName,
          lastName: (user as any).lastName,
          isSuperAdmin: (user as any).isSuperAdmin || false,
          walletId: (user as any).walletId,
          businessInfo: (user as any).businessInfo,
        }
      });
    } catch (e) { next(e); }
  };

  logout = async (req: any, res: any, next: any) => {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax'
      });
      res.status(200).json({ status: "success", message: "Logged out successfully" });
    } catch (e) { next(e); }
  };

  verify = async (req: any, res: any, next: any) => {
    try {
      const token = String(req.query.token || "");
      const user = await User.findOne({ verifyToken: token, verifyTokenExpires: { $gt: new Date() } });
      if (!user) throw new ValidationError("Invalid or expired token");
      (user as any).emailVerified = true; (user as any).verifyToken = undefined; (user as any).verifyTokenExpires = undefined; await user.save();
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };

  reactivate = async (req: any, res: any, next: any) => {
    try {
      // Accept token from either query params (GET) or body (POST)
      const token = String(req.query.token || req.body?.token || "");
      // console.log("Reactivation attempt - Token:", token);
      // console.log("Query params:", req.query);
      // console.log("Body:", req.body);

      if (!token) throw new ValidationError("Reactivation token is required");

      // Find user with this token
      const user = await User.findOne({
        verifyToken: token,
        verifyTokenExpires: { $gt: new Date() },
        isDeletionRequested: true
      });

      // console.log("User found:", user ? "Yes" : "No");
      if (user) {
        // console.log("User deletion status:", user.isDeletionRequested);
        // console.log("Token expires:", user.verifyTokenExpires);
        // console.log("Current time:", new Date());
      }

      if (!user) throw new ValidationError("Invalid or expired reactivation token");

      // Reactivate the account
      (user as any).isDeletionRequested = false;
      (user as any).deletionRequestedAt = undefined;
      (user as any).deletionReason = undefined;
      (user as any).gracePeriodEndsAt = undefined;
      (user as any).canDelete = true;
      (user as any).verifyToken = undefined;
      (user as any).verifyTokenExpires = undefined;

      await user.save();

      res.json({
        status: "success",
        message: "Account reactivated successfully! You can now log in again.",
        data: {
          ok: true,
          deletionCount: (user as any).deletionCount || 0
        }
      });
    } catch (e) {
      console.error("Reactivation error:", e);
      next(e);
    }
  };

  resendVerify = async (req: any, res: any, next: any) => {
    try {
      const { email } = req.body || {};
      const user = await User.findOne({ email });
      if (!user) throw new ValidationError("User not found");
      if ((user as any).emailVerified) return res.json({ status: "success", data: { ok: true } });
      const verifyToken = crypto.randomBytes(24).toString("hex");
      (user as any).verifyToken = verifyToken;
      (user as any).verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
      await user.save();
      const origin = process.env.APP_ORIGIN || "http://localhost:3000";
      const url = `${origin}/auth/verify?token=${verifyToken}`;
      EmailService.sendVerificationEmail(email, url).catch(err =>
        console.error('Failed to resend verification email:', err)
      );
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };

  changePassword = async (req: any, res: any, next: any) => {
    try {
      const { email, oldPassword, newPassword } = req.body || {};
      // Accept either authenticated Bearer user id or email in body
      const bearer = req.headers.authorization;
      let user = null as any;
      if (bearer && bearer.startsWith("Bearer ")) {
        const token = bearer.split(" ")[1];
        if (/^[a-f\d]{24}$/i.test(token)) {
          user = await User.findById(token);
        }
      }
      if (!user && email) {
        user = await User.findOne({ email });
      }
      if (!user || !(user as any).passwordHash) throw new ValidationError("Invalid account");
      if (!newPassword || String(newPassword).length < 6) throw new ValidationError("New password too short");
      const ok = await bcrypt.compare(oldPassword || "", (user as any).passwordHash);
      if (!ok) {
        (user as any).passwordChangeFailedCount = ((user as any).passwordChangeFailedCount || 0) + 1;
        (user as any).passwordChangeLastFailedAt = new Date();
        await user.save();
        throw new ValidationError("Old password incorrect");
      }
      (user as any).passwordHash = await bcrypt.hash(String(newPassword || ""), 10);
      (user as any).passwordChangedAt = new Date();
      (user as any).passwordChangeCount = ((user as any).passwordChangeCount || 0) + 1;
      await user.save();
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };

  forgotPassword = async (req: any, res: any, next: any) => {
    try {
      const { email } = req.body || {};
      if (!email) throw new ValidationError("Email is required");
      const user = await User.findOne({ email: String(email).toLowerCase().trim() });
      // Always respond success to prevent email enumeration
      if (!user) return res.json({ status: "success", data: { ok: true } });
      const resetToken = crypto.randomBytes(24).toString("hex");
      (user as any).resetToken = resetToken;
      (user as any).resetTokenExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins
      await user.save();
      const origin = process.env.APP_ORIGIN || "http://localhost:3000";
      const url = `${origin}/auth/reset?token=${resetToken}`;
      // Fire-and-forget email
      EmailService.sendPasswordResetEmail(email, url).catch(err =>
        console.warn("Password reset email failed", err)
      );
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };

  resetPassword = async (req: any, res: any, next: any) => {
    try {
      const { token, newPassword } = req.body || {};
      if (!token || !newPassword) throw new ValidationError("Missing fields");
      if (String(newPassword).length < 6) throw new ValidationError("New password too short");
      const user = await User.findOne({ resetToken: String(token), resetTokenExpires: { $gt: new Date() } });
      if (!user) throw new ValidationError("Invalid or expired token");
      (user as any).passwordHash = await bcrypt.hash(String(newPassword), 10);
      (user as any).passwordChangedAt = new Date();
      (user as any).passwordChangeCount = ((user as any).passwordChangeCount || 0) + 1;
      (user as any).resetToken = undefined;
      (user as any).resetTokenExpires = undefined;
      await user.save();
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };
}

export default new AuthController();


