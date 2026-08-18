import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBazaarBooking extends Document {
  reference: string;
  ticketCode: string;
  type: "ticket" | "exhibitor" | "sponsorship" | "contact";
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessName?: string;
  notes?: string;
  paymentStatus: "pending" | "paid" | "failed";
  checkInStatus: "pending" | "checked_in";
  checkInTime?: Date;
  paystackReference?: string;
  paystackUrl?: string;
  rawWebhook?: any;
  createdAt: Date;
  updatedAt: Date;
}

const BazaarBookingSchema: Schema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    ticketCode: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["ticket", "exhibitor", "sponsorship", "contact"],
      required: true,
    },
    packageId: { type: String, required: true },
    packageName: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "NGN" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, required: true },
    businessName: { type: String },
    notes: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    checkInStatus: {
      type: String,
      enum: ["pending", "checked_in"],
      default: "pending",
      index: true,
    },
    checkInTime: { type: Date },
    paystackReference: { type: String },
    paystackUrl: { type: String },
    rawWebhook: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const BazaarBooking: Model<IBazaarBooking> =
  (mongoose.models.BazaarBooking as Model<IBazaarBooking>) ||
  mongoose.model<IBazaarBooking>("BazaarBooking", BazaarBookingSchema);

export default BazaarBooking;
