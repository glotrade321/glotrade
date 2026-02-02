"use client";

import { useEffect, useState } from "react";
import { X, Shield, TrendingUp, Calendar, Package, FileText } from "lucide-react";
import { apiGet } from "@/utils/api";
import { formatCurrency } from "@/utils/format";

interface TPIADetailsModalProps {
    tpiaId: string;
    onClose: () => void;
}

interface TPIADetails {
    tpia: {
        _id: string;
        tpiaId: string;
        partnerName: string;
        partnerEmail: string;
        currentValue: number;
        purchasePrice: number;
        profitMode: string;
        status: string;
        purchasedAt: string;
        commodityType: string;
        insuranceCertificateNumber: string;
        totalProfitEarned: number;
        estimatedProfit?: number;
        cyclesCompleted: number;
    };
    gdc: {
        gdcNumber: number;
        status: string;
        primaryCommodity: string;
    };
    insurance: {
        policyType: string;
        coverageAmount: number;
        status: string;
        expiryDate: string;
    } | null;
    currentCycle: {
        cycleId: string;
        startDate: string;
        endDate: string;
        status: string;
    } | null;
}

export default function TPIADetailsModal({ tpiaId, onClose }: TPIADetailsModalProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<TPIADetails | null>(null);

    useEffect(() => {
        if (tpiaId) {
            fetchDetails();
        }
    }, [tpiaId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: TPIADetails }>(
                `/api/v1/gdip/tpia/${tpiaId}`
            );
            if (response.success) {
                setData(response.data);
            }
        } catch (err) {
            console.error("Error fetching TPIA details:", err);
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (!tpiaId) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-20">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex flex-wrap items-center gap-1.5 sm:gap-2 pr-2">
                        <span>GDC Investment Block</span>
                        {data && <span className="text-gray-500 font-normal text-sm sm:text-base">#{data.tpia.tpiaId}</span>}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : data ? (
                    <div className="p-6 space-y-8">
                        <div className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${data.tpia.status === "active" ? "bg-green-50 border border-green-100" :
                            data.tpia.status === "pending" ? "bg-yellow-50 border border-yellow-100" :
                                "bg-gray-50 border border-gray-100"
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${data.tpia.status === "active" ? "bg-green-100" : "bg-yellow-100"
                                    }`}>
                                    <Shield className={`w-5 h-5 ${data.tpia.status === "active" ? "text-green-600" : "text-yellow-600"
                                        }`} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-gray-900 capitalize leading-none text-sm sm:text-base">{data.tpia.status} Status</p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {data.tpia.status === "active"
                                            ? "Investment is active and trading"
                                            : "Waiting for GDC cluster formation"}
                                    </p>
                                </div>
                            </div>
                            <div className="sm:text-right flex sm:flex-col justify-between items-end sm:items-end border-t sm:border-t-0 border-gray-200/50 pt-3 sm:pt-0">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">Current Value</p>
                                <p className="text-lg sm:text-xl font-extrabold text-gray-900">{formatCurrency(data.tpia.currentValue)}</p>
                            </div>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Investment Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Investment Details
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Commodity</span>
                                        <span className="font-medium text-gray-900">{data.tpia.commodityType}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Initial Capital</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(data.tpia.purchasePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Purchase Date</span>
                                        <span className="font-medium text-gray-900">{formatDate(data.tpia.purchasedAt)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Profit Mode</span>
                                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            {data.tpia.profitMode === "TPM" ? "Compounding (TPM)" : "Payout (EPS)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Performance
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Profit Earned</span>
                                        <span className="font-bold text-green-600">+{formatCurrency(data.tpia.estimatedProfit || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Cycles Completed</span>
                                        <span className="font-medium text-gray-900">{data.tpia.cyclesCompleted}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Active Cycle</span>
                                        <span className="font-medium text-gray-900">
                                            {data.currentCycle ? `#${data.currentCycle.cycleId}` : "None"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Insurance Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Insurance & GDC
                                </h3>
                                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700">Certificate No.</span>
                                        <span className="font-medium text-blue-900 text-xs">
                                            {data.tpia.insuranceCertificateNumber}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700">GDC Cluster</span>
                                        <span className="font-medium text-blue-900">GDC-{data.gdc.gdcNumber}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700">Coverage</span>
                                        <span className="font-medium text-blue-900">
                                            {data.insurance ? formatCurrency(data.insurance.coverageAmount) : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Partner Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Partner Info
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-medium text-gray-900">{data.tpia.partnerName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium text-gray-900 truncate max-w-[150px]" title={data.tpia.partnerEmail}>
                                            {data.tpia.partnerEmail}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        Failed to load details
                    </div>
                )}
            </div>
        </div>
    );
}
