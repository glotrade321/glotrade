import { Request, Response, NextFunction } from "express";
import BazaarConfig from "../models/BazaarConfig";
import BazaarBooking from "../models/BazaarBooking";
import { PaystackProvider } from "../services/providers/PaystackProvider";
import emailService from "../services/EmailService";
import crypto from "crypto";

const paystackProvider = new PaystackProvider();

// Helper to get or initialize singleton config
async function getOrCreateConfig() {
  let config = await BazaarConfig.findOne();
  if (!config) {
    config = await BazaarConfig.create({
      isPortalActive: true,
      ticketSalesActive: true,
      exhibitorApplicationsActive: true,
      sponsorshipActive: true,
      inactiveMessage:
        "GloTrade Bazaar Abuja 2026 portal is currently inactive. Stay tuned for official date announcements!",
      eventTitle: "GloTrade Bazaar Abuja 2026",
      eventDateLabel: "12 September 2026",
      eventVenue: "Harrow Park, Abuja",
      whatsappNumber: "2347044600924",
      email: "glotradebazaar@glotrade.online",
    });
  }
  return config;
}

// Generate unique Ticket Code (8 chars)
function generateTicketCode(): string {
  return "GTB-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

// Helper to extract authenticated manager/admin details for action blame/audit tracking
function extractAdminActor(req: Request) {
  const user = (req as any).user;
  if (!user) return null;
  const name =
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    user.email ||
    "Admin Manager";
  return {
    adminId: String(user._id || user.id || ""),
    name,
    email: user.email || "",
    role: user.role || "bazaar_manager",
  };
}

export class BazaarController {
  // Public: Get portal config & seasonal status
  static async getPublicConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await getOrCreateConfig();
      res.json({ status: "success", data: config });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Update portal config & seasonal controls
  static async updateAdminConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        isPortalActive,
        ticketSalesActive,
        exhibitorApplicationsActive,
        sponsorshipActive,
        inactiveMessage,
        eventTitle,
        eventDateLabel,
        eventVenue,
        whatsappNumber,
        email,
        bankName,
        bankAccountName,
        bankAccountNumber,
      } = req.body;

      const config = await getOrCreateConfig();

      if (typeof isPortalActive === "boolean") config.isPortalActive = isPortalActive;
      if (typeof ticketSalesActive === "boolean") config.ticketSalesActive = ticketSalesActive;
      if (typeof exhibitorApplicationsActive === "boolean")
        config.exhibitorApplicationsActive = exhibitorApplicationsActive;
      if (typeof sponsorshipActive === "boolean") config.sponsorshipActive = sponsorshipActive;

      if (inactiveMessage !== undefined) config.inactiveMessage = inactiveMessage;
      if (eventTitle !== undefined) config.eventTitle = eventTitle;
      if (eventDateLabel !== undefined) config.eventDateLabel = eventDateLabel;
      if (eventVenue !== undefined) config.eventVenue = eventVenue;
      if (whatsappNumber !== undefined) config.whatsappNumber = whatsappNumber;
      if (email !== undefined) config.email = email;
      if (bankName !== undefined) config.bankName = bankName;
      if (bankAccountName !== undefined) config.bankAccountName = bankAccountName;
      if (bankAccountNumber !== undefined) config.bankAccountNumber = bankAccountNumber;

      config.updatedAt = new Date();
      if ((req as any).user) {
        config.updatedBy = (req as any).user._id || (req as any).user.email;
      }

      await config.save();
      res.json({ status: "success", data: config, message: "Bazaar settings updated" });
    } catch (err) {
      next(err);
    }
  }

  // Public: Initialize ticket/stall/sponsorship booking & Paystack checkout
  static async initializeBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await getOrCreateConfig();

      if (!config.isPortalActive) {
        return res.status(403).json({
          status: "fail",
          message: config.inactiveMessage || "Bazaar portal is currently inactive.",
        });
      }

      const {
        type = "ticket",
        packageId,
        packageName,
        amount = 0,
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        notes,
        returnUrl,
        paymentMethod,
        isManualBankTransfer,
      } = req.body;

      // Validate portal feature status
      if (type === "ticket" && !config.ticketSalesActive) {
        return res.status(400).json({ status: "fail", message: "Ticket sales are currently closed." });
      }
      if (type === "exhibitor" && !config.exhibitorApplicationsActive) {
        return res.status(400).json({ status: "fail", message: "Exhibitor stall applications are closed." });
      }
      if (type === "sponsorship" && !config.sponsorshipActive) {
        return res.status(400).json({ status: "fail", message: "Sponsorship applications are closed." });
      }

      if (!customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ status: "fail", message: "Name, email, and phone number are required." });
      }

      const prefix = type === "ticket" ? "TK" : type === "exhibitor" ? "EX" : type === "sponsorship" ? "SP" : "CT";
      const reference = `BZ-${prefix}-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      const ticketCode = generateTicketCode();

      const booking = await BazaarBooking.create({
        reference,
        ticketCode,
        type,
        packageId: packageId || "general",
        packageName: packageName || "General Ticket",
        amount: Number(amount),
        currency: "NGN",
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        notes,
        paymentStatus: Number(amount) <= 0 ? "paid" : "pending",
        checkInStatus: "pending",
      });

      // Check if this is a manual bank transfer request
      const isManual =
        paymentMethod === "bank_transfer" ||
        paymentMethod === "manual" ||
        isManualBankTransfer === true ||
        (typeof notes === "string" && notes.includes("[Manual Bank Transfer Enquiry]"));

      // If free ticket, contact inquiry, or manual bank transfer
      if (isManual || Number(amount) <= 0) {
        if (Number(amount) <= 0 && type !== "contact") {
          emailService.sendBazaarConfirmationEmail(booking).catch((emailErr) => {
            console.error("Failed to send bazaar confirmation email for free ticket:", emailErr);
          });
        }

        return res.json({
          status: "success",
          data: {
            booking,
            free: Number(amount) <= 0,
            manual: isManual,
            reference: booking.reference,
            ticketCode: booking.ticketCode,
          },
        });
      }

      // Initialize Paystack payment
      try {
        const callback = returnUrl || `${req.protocol}://${req.get("host")}/bazaar/callback`;
        const paystackResult = await paystackProvider.initialize({
          orderId: booking.reference,
          provider: "paystack",
          amount: Number(amount) * 100, // convert NGN to kobo
          currency: "NGN",
          customer: { email: customerEmail, name: customerName },
          returnUrl: `${callback}?reference=${booking.reference}`,
          metadata: {
            type: "bazaar",
            bookingId: (booking._id as any).toString(),
            bookingType: type,
            reference: booking.reference,
            ticketCode: booking.ticketCode,
            phone: customerPhone,
          },
        });

        booking.paystackReference = paystackResult.reference;
        booking.paystackUrl = paystackResult.url;
        await booking.save();

        return res.json({
          status: "success",
          data: {
            authorizationUrl: paystackResult.url,
            paystackReference: paystackResult.reference,
            reference: booking.reference,
            ticketCode: booking.ticketCode,
            booking,
          },
        });
      } catch (paystackErr: any) {
        console.error("Paystack initialization failed for Bazaar booking:", paystackErr);
        return res.status(400).json({
          status: "fail",
          message: paystackErr?.message || "Paystack payment initialization unavailable. Please use Bank Transfer / WhatsApp option.",
          data: {
            booking,
            reference: booking.reference,
            ticketCode: booking.ticketCode,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  // Public: Verify payment status by reference or ticket code
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = String(req.query.reference || req.params.reference || "").trim();
      if (!reference) {
        return res.status(400).json({ status: "fail", message: "Reference or Ticket Code is required." });
      }

      const booking = await BazaarBooking.findOne({
        $or: [
          { reference },
          { paystackReference: reference },
          { ticketCode: reference.toUpperCase() },
        ],
      });

      if (!booking) {
        return res.status(404).json({ status: "fail", message: "Booking reference or ticket code not found." });
      }

      if (booking.paymentStatus === "paid") {
        return res.json({ status: "success", data: { booking, paid: true } });
      }

      // If booking was initialized with Paystack, attempt verification
      if (booking.paystackReference) {
        try {
          const verifyRes = await paystackProvider.verify(booking.paystackReference);
          if (verifyRes?.paid) {
            booking.paymentStatus = "paid";
            await booking.save();

            // Send confirmation email with ticket code
            emailService.sendBazaarConfirmationEmail(booking).catch((emailErr) => {
              console.error("Failed to send bazaar confirmation email:", emailErr);
            });

            return res.json({ status: "success", data: { booking, paid: true } });
          }
        } catch (paystackErr: any) {
          console.warn("Paystack verification check returned error or was unavailable:", paystackErr?.message || paystackErr);
        }
      }

      return res.json({ status: "success", data: { booking, paid: false } });
    } catch (err) {
      next(err);
    }
  }

  // Public: Submit general contact message
  static async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ status: "fail", message: "Name, email, and message are required." });
      }

      const reference = `BZ-CT-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      const ticketCode = generateTicketCode();

      const booking = await BazaarBooking.create({
        reference,
        ticketCode,
        type: "contact",
        packageId: "contact",
        packageName: subject || "Contact Inquiry",
        amount: 0,
        currency: "NGN",
        customerName: name,
        customerEmail: email,
        customerPhone: phone || "N/A",
        notes: message,
        paymentStatus: "paid",
        checkInStatus: "pending",
      });

      res.json({ status: "success", data: booking, message: "Enquiry submitted successfully." });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Get overall statistics
  static async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
      const totalRevenueRes = await BazaarBooking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalRevenue = totalRevenueRes[0]?.total || 0;

      const totalTickets = await BazaarBooking.countDocuments({ type: "ticket" });
      const totalTicketsPaid = await BazaarBooking.countDocuments({ type: "ticket", paymentStatus: "paid" });
      const totalPending = await BazaarBooking.countDocuments({ paymentStatus: "pending" });
      const totalExhibitors = await BazaarBooking.countDocuments({ type: "exhibitor" });
      const totalSponsorships = await BazaarBooking.countDocuments({ type: "sponsorship" });
      const totalContacts = await BazaarBooking.countDocuments({ type: "contact" });
      const totalCheckedIn = await BazaarBooking.countDocuments({ checkInStatus: "checked_in" });

      res.json({
        status: "success",
        data: {
          totalRevenue,
          totalTickets,
          totalTicketsPaid,
          totalPending,
          totalExhibitors,
          totalSponsorships,
          totalContacts,
          totalCheckedIn,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Get paginated bookings with search & filters
  static async getAdminBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string;
      const paymentStatus = req.query.paymentStatus as string;
      const checkInStatus = req.query.checkInStatus as string;
      const search = req.query.search as string;

      const query: any = {};

      if (type && type !== "all") query.type = type;
      if (paymentStatus && paymentStatus !== "all") query.paymentStatus = paymentStatus;
      if (checkInStatus && checkInStatus !== "all") query.checkInStatus = checkInStatus;

      if (search) {
        query.$or = [
          { customerName: { $regex: search, $options: "i" } },
          { customerEmail: { $regex: search, $options: "i" } },
          { customerPhone: { $regex: search, $options: "i" } },
          { reference: { $regex: search, $options: "i" } },
          { ticketCode: { $regex: search, $options: "i" } },
          { businessName: { $regex: search, $options: "i" } },
        ];
      }

      const total = await BazaarBooking.countDocuments(query);
      const bookings = await BazaarBooking.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        status: "success",
        data: {
          bookings,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Update booking status or notes (with Manager Action Audit Blame Tracking)
  static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { paymentStatus, checkInStatus, notes } = req.body;

      const booking = await BazaarBooking.findById(id);
      if (!booking) {
        return res.status(404).json({ status: "fail", message: "Booking not found." });
      }

      const actor = extractAdminActor(req);
      const previousStatus = booking.paymentStatus;
      const previousCheckIn = booking.checkInStatus;

      if (!booking.auditLogs) {
        booking.auditLogs = [];
      }

      if (paymentStatus && paymentStatus !== previousStatus) {
        booking.paymentStatus = paymentStatus;
        if (paymentStatus === "paid" && actor) {
          booking.paymentApprovedBy = { ...actor, at: new Date() };
          booking.auditLogs.push({
            action: "PAYMENT_MARKED_PAID",
            performedBy: actor,
            details: `Payment status updated from '${previousStatus}' to 'PAID'`,
            timestamp: new Date(),
          });
        } else if (actor) {
          booking.auditLogs.push({
            action: "PAYMENT_STATUS_CHANGE",
            performedBy: actor,
            details: `Payment status updated from '${previousStatus}' to '${paymentStatus}'`,
            timestamp: new Date(),
          });
        }
      }

      if (checkInStatus && checkInStatus !== previousCheckIn) {
        booking.checkInStatus = checkInStatus;
        if (checkInStatus === "checked_in") {
          if (!booking.checkInTime) {
            booking.checkInTime = new Date();
          }
          if (actor) {
            booking.checkedInBy = { ...actor, at: new Date() };
            booking.auditLogs.push({
              action: "GATE_CHECK_IN",
              performedBy: actor,
              details: `Guest admitted & checked in at gate`,
              timestamp: new Date(),
            });
          }
        } else if (actor) {
          booking.auditLogs.push({
            action: "CHECK_IN_STATUS_CHANGE",
            performedBy: actor,
            details: `Gate check-in status reset to '${checkInStatus}'`,
            timestamp: new Date(),
          });
        }
      }

      if (notes !== undefined && notes !== booking.notes) {
        booking.notes = notes;
        if (actor) {
          booking.auditLogs.push({
            action: "NOTES_UPDATED",
            performedBy: actor,
            details: `Booking notes/special requests updated`,
            timestamp: new Date(),
          });
        }
      }

      if (actor) {
        booking.lastModifiedBy = { ...actor, action: "UPDATE_BOOKING", at: new Date() };
      }

      await booking.save();

      // Trigger ticket email if payment was just changed to paid
      if (previousStatus !== "paid" && paymentStatus === "paid") {
        emailService.sendBazaarConfirmationEmail(booking).catch((emailErr) => {
          console.error("Failed to send ticket email on admin mark paid:", emailErr);
        });
      }

      res.json({ status: "success", data: booking, message: "Booking updated successfully." });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Create manual ticket / exhibitor / sponsorship booking with Manager Actor Tagging
  static async createManualBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        type = "ticket",
        packageId = "general",
        packageName = "General Ticket",
        amount = 0,
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        paymentStatus = "paid",
        notes = "Manual bank transfer registration via admin",
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ status: "fail", message: "Customer name, email, and phone number are required." });
      }

      const actor = extractAdminActor(req);
      const prefix = type === "ticket" ? "TK" : type === "exhibitor" ? "EX" : type === "sponsorship" ? "SP" : "CT";
      const reference = `BZ-${prefix}-M-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      const ticketCode = generateTicketCode();

      const registeredBy = actor ? { ...actor, at: new Date() } : undefined;
      const paymentApprovedBy = actor && paymentStatus === "paid" ? { ...actor, at: new Date() } : undefined;
      const auditLogs = actor
        ? [
            {
              action: "MANUAL_REGISTRATION",
              performedBy: actor,
              details: `Manual registration created for ${packageName} (₦${Number(amount).toLocaleString("en-NG")}) - Status: ${paymentStatus.toUpperCase()}`,
              timestamp: new Date(),
            },
          ]
        : [];

      const booking = await BazaarBooking.create({
        reference,
        ticketCode,
        type,
        packageId,
        packageName,
        amount: Number(amount),
        currency: "NGN",
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        notes,
        paymentStatus,
        checkInStatus: "pending",
        registeredBy,
        paymentApprovedBy,
        auditLogs,
      });

      let emailSent = false;
      if (paymentStatus === "paid") {
        try {
          await emailService.sendBazaarConfirmationEmail(booking);
          emailSent = true;
        } catch (emailErr) {
          console.error("Failed to send manual bazaar confirmation email:", emailErr);
        }
      }

      res.status(201).json({
        status: "success",
        message: `Booking created successfully.${emailSent ? " Ticket confirmation email dispatched." : ""}`,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin: Resend ticket confirmation email with Audit Blame Logging
  static async resendConfirmationEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const booking = await BazaarBooking.findById(id);
      if (!booking) {
        return res.status(404).json({ status: "fail", message: "Booking record not found." });
      }

      const actor = extractAdminActor(req);
      if (actor) {
        if (!booking.auditLogs) {
          booking.auditLogs = [];
        }
        booking.auditLogs.push({
          action: "RESEND_CONFIRMATION_EMAIL",
          performedBy: actor,
          details: `Ticket confirmation pass resent to ${booking.customerEmail}`,
          timestamp: new Date(),
        });
        booking.lastModifiedBy = { ...actor, action: "RESEND_EMAIL", at: new Date() };
        await booking.save();
      }

      await emailService.sendBazaarConfirmationEmail(booking);
      res.json({
        status: "success",
        message: `Ticket confirmation email resent to ${booking.customerEmail}`,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin / Gate Check-in: Verify & check in ticket with Scanner Blame Tracking
  static async checkInTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ status: "fail", message: "Ticket code or reference is required." });
      }

      const booking = await BazaarBooking.findOne({
        $or: [
          { ticketCode: code.toUpperCase().trim() },
          { reference: code.trim() },
        ],
      });

      if (!booking) {
        return res.status(404).json({ status: "fail", message: "Invalid Ticket Code or Reference." });
      }

      if (booking.paymentStatus !== "paid") {
        return res.status(400).json({
          status: "fail",
          message: `Ticket payment is ${booking.paymentStatus.toUpperCase()}. Entry denied.`,
          booking,
        });
      }

      if (booking.checkInStatus === "checked_in") {
        return res.status(400).json({
          status: "fail",
          message: `Ticket ALREADY CHECKED IN at ${booking.checkInTime ? new Date(booking.checkInTime).toLocaleTimeString() : "earlier"}${
            booking.checkedInBy?.name ? ` by ${booking.checkedInBy.name}` : ""
          }.`,
          booking,
        });
      }

      const actor = extractAdminActor(req);
      booking.checkInStatus = "checked_in";
      booking.checkInTime = new Date();

      if (actor) {
        booking.checkedInBy = { ...actor, at: new Date() };
        if (!booking.auditLogs) {
          booking.auditLogs = [];
        }
        booking.auditLogs.push({
          action: "GATE_CHECK_IN",
          performedBy: actor,
          details: `Validated QR code and granted entrance at Harrow Park gate`,
          timestamp: new Date(),
        });
        booking.lastModifiedBy = { ...actor, action: "GATE_CHECK_IN", at: new Date() };
      }

      await booking.save();

      res.json({
        status: "success",
        message: `VALID TICKET! ${booking.customerName} checked in successfully.`,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Super Admin: Delete single booking
  static async deleteBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await BazaarBooking.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ status: "fail", message: "Booking record not found." });
      }
      res.json({
        status: "success",
        message: "Booking record deleted successfully.",
        data: deleted,
      });
    } catch (err) {
      next(err);
    }
  }

  // Super Admin: Bulk delete multiple bookings
  static async bulkDeleteBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ status: "fail", message: "Please provide an array of booking IDs to delete." });
      }

      const result = await BazaarBooking.deleteMany({ _id: { $in: ids } });
      res.json({
        status: "success",
        message: `Successfully deleted ${result.deletedCount} booking record(s).`,
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      next(err);
    }
  }
}
