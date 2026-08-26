import mongoose, { Document, Schema } from "mongoose";

/**
 * TradeCycle - Represents a 37-day commodity trading cycle
 * Each cycle generates profits distributed to TPIA holders
 */
export interface ITradeCycle extends Document {
    // Identification
    cycleNumber: number; // Sequential cycle number
    cycleId: string; // Formatted: "CYCLE-{number}"

    // GDC Association
    gdcId: Schema.Types.ObjectId; // Which GDC this cycle belongs to
    gdcNumber: number;

    // Participating TPIAs
    tpiaIds: Schema.Types.ObjectId[];
    tpiaCount: number; // Should be 10 for full GDC

    // Timeline (37 days)
    startDate: Date;
    endDate: Date; // startDate + 37 days
    duration: number; // Days (default: 37)

    // Status
    status: "scheduled" | "active" | "processing" | "completed" | "failed" | "cancelled";

    // Financial Details
    totalCapital: number; // Sum of all TPIA values in this cycle
    targetProfitRate: number; // Expected profit % (default: 5%)
    actualProfitRate?: number; // Actual profit % achieved
    totalProfitGenerated: number; // Total profit in ₦

    // Commodity Trading
    commodityType: string;
    commodityQuantity: number;
    purchasePrice: number; // Total commodity purchase cost
    salePrice?: number; // Total commodity sale revenue
    tradingCosts?: number; // Storage, transport, etc.

    // Profit Distribution
    profitDistributed: boolean;
    distributionDate?: Date;
    distributionDetails: {
        tpiaId: Schema.Types.ObjectId;
        tpiaNumber: number;
        profitAmount: number;
        profitMode: "TPM" | "EPS";
        distributedAt?: Date;
    }[];

    // Performance Metrics
    actualDuration?: number; // Actual days taken
    roi: number; // Return on Investment %
    performanceRating?: "excellent" | "good" | "average" | "poor";

    // Insurance & Risk
    insuranceClaimed: boolean;
    insuranceClaimAmount?: number;
    riskEvents?: {
        type: string;
        description: string;
        impact: number;
        occurredAt: Date;
    }[];

    // Admin Controls
    executedBy?: Schema.Types.ObjectId; // Admin who executed
    approvedBy?: Schema.Types.ObjectId; // Admin who approved
    notes?: string;

    // Manager Audit & Blame Trail
    executedByAdmin?: {
        adminId?: string;
        name?: string;
        email?: string;
        role?: string;
        at?: Date;
    };
    approvedByAdmin?: {
        adminId?: string;
        name?: string;
        email?: string;
        role?: string;
        at?: Date;
    };
    lastModifiedByAdmin?: {
        adminId?: string;
        name?: string;
        email?: string;
        role?: string;
        action?: string;
        at?: Date;
    };
    auditLogs?: Array<{
        action: string;
        performedBy?: {
            adminId?: string;
            name?: string;
            email?: string;
            role?: string;
        };
        details?: string;
        timestamp: Date;
    }>;

    // Automation
    autoExecuted: boolean; // Was this cycle auto-executed by cron?
    executionLog?: string;

    createdAt: Date;
    updatedAt: Date;
}

const tradeCycleSchema = new Schema<ITradeCycle>(
    {
        cycleNumber: {
            type: Number,
            required: true,
            index: true
        },
        cycleId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        gdcId: {
            type: Schema.Types.ObjectId,
            ref: "GDC",
            required: true,
            index: true
        },
        gdcNumber: {
            type: Number,
            required: true
        },
        tpiaIds: [{
            type: Schema.Types.ObjectId,
            ref: "TPIA",
            required: true
        }],
        tpiaCount: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },
        startDate: {
            type: Date,
            required: true,
            index: true
        },
        endDate: {
            type: Date,
            required: true,
            index: true
        },
        duration: {
            type: Number,
            default: 37,
            min: 1
        },
        status: {
            type: String,
            enum: ["scheduled", "active", "processing", "completed", "failed", "cancelled"],
            default: "scheduled",
            index: true
        },
        totalCapital: {
            type: Number,
            required: true,
            min: 0
        },
        targetProfitRate: {
            type: Number,
            default: 5, // 5% per cycle
            min: 0
        },
        actualProfitRate: {
            type: Number,
            min: 0
        },
        totalProfitGenerated: {
            type: Number,
            default: 0,
            min: 0
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
        purchasePrice: {
            type: Number,
            required: true,
            min: 0
        },
        salePrice: {
            type: Number,
            min: 0
        },
        tradingCosts: {
            type: Number,
            default: 0,
            min: 0
        },
        profitDistributed: {
            type: Boolean,
            default: false,
            index: true
        },
        distributionDate: Date,
        distributionDetails: [{
            tpiaId: {
                type: Schema.Types.ObjectId,
                ref: "TPIA",
                required: true
            },
            tpiaNumber: {
                type: Number,
                required: true
            },
            profitAmount: {
                type: Number,
                required: true,
                min: 0
            },
            profitMode: {
                type: String,
                enum: ["TPM", "EPS"],
                required: true
            },
            distributedAt: Date
        }],
        actualDuration: Number,
        roi: {
            type: Number,
            default: 0,
            min: 0
        },
        performanceRating: {
            type: String,
            enum: ["excellent", "good", "average", "poor"]
        },
        insuranceClaimed: {
            type: Boolean,
            default: false
        },
        insuranceClaimAmount: {
            type: Number,
            min: 0
        },
        riskEvents: [{
            type: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            impact: {
                type: Number,
                required: true
            },
            occurredAt: {
                type: Date,
                required: true
            }
        }],
        executedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        notes: String,
        executedByAdmin: {
            adminId: { type: String },
            name: { type: String },
            email: { type: String },
            role: { type: String },
            at: { type: Date }
        },
        approvedByAdmin: {
            adminId: { type: String },
            name: { type: String },
            email: { type: String },
            role: { type: String },
            at: { type: Date }
        },
        lastModifiedByAdmin: {
            adminId: { type: String },
            name: { type: String },
            email: { type: String },
            role: { type: String },
            action: { type: String },
            at: { type: Date }
        },
        auditLogs: [{
            action: { type: String, required: true },
            performedBy: {
                adminId: { type: String },
                name: { type: String },
                email: { type: String },
                role: { type: String }
            },
            details: { type: String },
            timestamp: { type: Date, default: Date.now }
        }],
        autoExecuted: {
            type: Boolean,
            default: false
        },
        executionLog: String
    },
    { timestamps: true }
);

// Pre-save middleware
tradeCycleSchema.pre("save", async function (next) {
    if (this.isNew && !this.cycleId) {
        this.cycleId = `GDC${this.gdcNumber}-CYCLE-${this.cycleNumber}`;

        // Calculate end date if not provided
        if (!this.endDate && this.startDate) {
            const endDate = new Date(this.startDate);
            endDate.setDate(endDate.getDate() + this.duration);
            this.endDate = endDate;
        }
    }

    // Calculate ROI if profit is generated
    if (this.totalProfitGenerated > 0 && this.totalCapital > 0) {
        this.roi = (this.totalProfitGenerated / this.totalCapital) * 100;
        this.actualProfitRate = this.roi;
    }

    next();
});

// Indexes
tradeCycleSchema.index({ gdcId: 1, cycleNumber: 1 });
tradeCycleSchema.index({ status: 1, startDate: 1 });
tradeCycleSchema.index({ status: 1, endDate: 1 });
tradeCycleSchema.index({ profitDistributed: 1 });
tradeCycleSchema.index({ createdAt: -1 });

export default mongoose.model<ITradeCycle>("TradeCycle", tradeCycleSchema);
