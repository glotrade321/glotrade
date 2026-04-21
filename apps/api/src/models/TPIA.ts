import mongoose, { Document, Schema } from "mongoose";

/**
 * TPIA = Trade Partners Insured Alliance
 * Each TPIA represents a ₦1,000,000 commodity-backed investment block
 */
export interface ITPIA extends Document {
  // Identification
  tpiaNumber: number; // Sequential: 1, 2, 3, ... (e.g., TPIA-1, TPIA-2)
  tpiaId: string; // Formatted: "TPIA-{number}" (e.g., "TPIA-1")

  // Ownership
  partnerId: Schema.Types.ObjectId; // Reference to User
  partnerName: string; // Company/Individual name
  partnerEmail: string;

  // GDC Assignment
  gdcId: Schema.Types.ObjectId; // Reference to GDC
  gdcNumber: number; // Which GDC batch (10, 20, 30, etc.)
  positionInGDC: number; // Position 1-10 within the GDC

  // Financial Details
  purchasePrice: number; // Initial investment (₦1,000,000)
  currentValue: number; // Current NAV-based value
  totalProfitEarned: number; // Cumulative profits
  compoundedValue: number; // If using TPM mode

  // Trade Cycle Tracking
  currentCycleId?: Schema.Types.ObjectId; // Active trade cycle
  cyclesCompleted: number; // Number of 37-day cycles completed
  nextCycleStartDate?: Date; // When next cycle begins
  lastCycleEndDate?: Date; // When last cycle ended
  lastCycleProfit?: number; // Profit from last cycle

  // Profit Mode
  profitMode: "TPM" | "EPS"; // TPM = Compounding, EPS = Withdrawal

  // Insurance
  insuranceCertificateNumber: string; // "TPIA-{number}-{13 unique digits}"
  insuranceProvider?: string;
  insuranceCoverageAmount: number; // Usually matches purchasePrice
  insuranceExpiryDate?: Date;
  insuranceStatus: "active" | "expired" | "claimed" | "pending";

  // Commodity Backing
  commodityType: string; // e.g., "Rice", "Sugar", "Wheat"
  commodityQuantity: number; // Units allocated
  commodityUnit: string; // e.g., "bags", "tons"
  warehouseLocation?: string;
  warehouseCertificateNumber?: string;

  // Lifecycle Status
  status: "pending" | "active" | "matured" | "suspended" | "liquidated" | "voided";
  activatedAt?: Date;
  maturityDate?: Date; // 13 months from activation (optional)

  // Documents & Certificates
  documents: {
    insuranceCertificate?: string; // URL to PDF
    warehouseCertificate?: string; // URL to PDF
    purchaseAgreement?: string; // URL to PDF
    commodityAllocation?: string; // URL to PDF
  };

  // Audit Trail
  purchaseSource?: "wallet" | "manual_bank_deposit";
  manualPayment?: {
    amountReceived: number;
    bankReference: string;
    depositedAt: Date;
    recordedBy?: Schema.Types.ObjectId;
    recordedAt: Date;
    note?: string;
  };
  manualPaymentCorrections?: {
    correctedBy?: Schema.Types.ObjectId;
    correctedAt: Date;
    reason: string;
    previous: {
      bankReference?: string;
      depositedAt?: Date;
      note?: string;
    };
    next: {
      bankReference?: string;
      depositedAt?: Date;
      note?: string;
    };
  }[];
  voidedAt?: Date;
  voidedBy?: Schema.Types.ObjectId;
  voidReason?: string;
  originalTpiaNumber?: number;
  originalTpiaId?: string;
  purchasedAt: Date;
  createdBy?: Schema.Types.ObjectId; // Admin who created
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Generate unique 13-digit insurance certificate suffix
function generateInsuranceSuffix(): string {
  // Generate 13 random digits
  let suffix = '';
  for (let i = 0; i < 13; i++) {
    suffix += Math.floor(Math.random() * 10);
  }
  return suffix;
}

const tpiaSchema = new Schema<ITPIA>(
  {
    tpiaNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    tpiaId: {
      type: String,
      unique: true,
      index: true
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    partnerName: {
      type: String,
      required: true
    },
    partnerEmail: {
      type: String,
      required: true
    },
    gdcId: {
      type: Schema.Types.ObjectId,
      ref: "GDC",
      index: true
    },
    gdcNumber: {
      type: Number,
      index: true
    },
    positionInGDC: {
      type: Number,
      min: 1,
      max: 10
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: 1000000 // ₦1,000,000
    },
    currentValue: {
      type: Number,
      required: true,
      default: 1000000
    },
    totalProfitEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    compoundedValue: {
      type: Number,
      default: 0,
      min: 0
    },
    currentCycleId: {
      type: Schema.Types.ObjectId,
      ref: "TradeCycle"
    },
    cyclesCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    nextCycleStartDate: Date,
    lastCycleEndDate: Date,
    lastCycleProfit: Number,
    profitMode: {
      type: String,
      enum: ["TPM", "EPS"],
      default: "TPM", // Default to compounding
      required: true
    },
    insuranceCertificateNumber: {
      type: String,
      unique: true,
      index: true
    },
    insuranceProvider: String,
    insuranceCoverageAmount: {
      type: Number,
      required: true,
      default: 1000000
    },
    insuranceExpiryDate: Date,
    insuranceStatus: {
      type: String,
      enum: ["active", "expired", "claimed", "pending"],
      default: "pending"
    },
    commodityType: {
      type: String,
      required: true
    },
    commodityQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    commodityUnit: {
      type: String,
      required: true
    },
    warehouseLocation: String,
    warehouseCertificateNumber: String,
    status: {
      type: String,
      enum: ["pending", "active", "matured", "suspended", "liquidated", "voided"],
      default: "pending",
      index: true
    },
    activatedAt: Date,
    maturityDate: Date,
    documents: {
      insuranceCertificate: String,
      warehouseCertificate: String,
      purchaseAgreement: String,
      commodityAllocation: String
    },
    purchaseSource: {
      type: String,
      enum: ["wallet", "manual_bank_deposit"],
      default: "wallet",
      index: true
    },
    manualPayment: {
      amountReceived: Number,
      bankReference: {
        type: String,
        trim: true
      },
      depositedAt: Date,
      recordedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      recordedAt: Date,
      note: String
    },
    manualPaymentCorrections: [
      new Schema(
        {
          correctedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
          },
          correctedAt: {
            type: Date,
            default: Date.now
          },
          reason: {
            type: String,
            required: true,
            trim: true
          },
          previous: {
            bankReference: String,
            depositedAt: Date,
            note: String
          },
          next: {
            bankReference: String,
            depositedAt: Date,
            note: String
          }
        },
        { _id: false }
      )
    ],
    voidedAt: Date,
    voidedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    voidReason: String,
    originalTpiaNumber: Number,
    originalTpiaId: String,
    purchasedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    notes: String
  },
  { timestamps: true }
);

// Pre-save middleware to generate TPIA ID and insurance certificate number
tpiaSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Generate TPIA ID
    this.tpiaId = `TPIA-${this.tpiaNumber}`;

    // Generate insurance certificate number: TPIA-{number}-{13 digits}
    if (!this.insuranceCertificateNumber) {
      const suffix = generateInsuranceSuffix();
      this.insuranceCertificateNumber = `TPIA-${this.tpiaNumber}-${suffix}`;
    }

    // Set initial values
    if (!this.currentValue) {
      this.currentValue = this.purchasePrice;
    }
  }
  next();
});

// Indexes for efficient querying
tpiaSchema.index({ partnerId: 1, status: 1 });
tpiaSchema.index({ gdcId: 1, positionInGDC: 1 });
tpiaSchema.index({ status: 1, nextCycleStartDate: 1 });
tpiaSchema.index({ createdAt: -1 });
tpiaSchema.index({ "manualPayment.bankReference": 1 }, { sparse: true });

export default mongoose.model<ITPIA>("TPIA", tpiaSchema);
