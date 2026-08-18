import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBazaarConfig extends Document {
  isPortalActive: boolean;
  ticketSalesActive: boolean;
  exhibitorApplicationsActive: boolean;
  sponsorshipActive: boolean;
  inactiveMessage: string;
  eventTitle: string;
  eventDateLabel: string;
  eventVenue: string;
  whatsappNumber?: string;
  email?: string;
  updatedAt: Date;
  updatedBy?: string;
}

const BazaarConfigSchema: Schema = new Schema(
  {
    isPortalActive: { type: Boolean, default: true },
    ticketSalesActive: { type: Boolean, default: true },
    exhibitorApplicationsActive: { type: Boolean, default: true },
    sponsorshipActive: { type: Boolean, default: true },
    inactiveMessage: {
      type: String,
      default:
        "GloTrade Bazaar Abuja 2026 portal is currently inactive. Stay tuned for official announcements!",
    },
    eventTitle: { type: String, default: "GloTrade Bazaar Abuja 2026" },
    eventDateLabel: { type: String, default: "12 September 2026" },
    eventVenue: { type: String, default: "Harrow Park, Abuja" },
    whatsappNumber: { type: String, default: "2348000000000" },
    email: { type: String, default: "enquiries@glotrade.online" },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

const BazaarConfig: Model<IBazaarConfig> =
  (mongoose.models.BazaarConfig as Model<IBazaarConfig>) ||
  mongoose.model<IBazaarConfig>("BazaarConfig", BazaarConfigSchema);

export default BazaarConfig;
