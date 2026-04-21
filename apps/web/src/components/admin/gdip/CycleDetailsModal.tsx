"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Activity, TrendingUp, DollarSign, Package } from "lucide-react";
import { apiGet } from "@/utils/api";
import { translate } from "@/utils/translate";

interface CycleDetailsModalProps {
    cycleId: string;
    onClose: () => void;
}

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    gdcNumber: number;
    status: string;
    startDate: string;
    endDate: string;
    commodityType: string;
    commodityQuantity: number;
    purchasePrice: number;
    salePrice?: number;
    actualProfitRate: number;
    estimatedProfitRate: number;
    currentProfit?: number;
    tradingCosts: number;
    totalCapital: number;
    profitDistributed: boolean;
}

export default function CycleDetailsModal({ cycleId, onClose }: CycleDetailsModalProps) {
    const [loading, setLoading] = useState(true);
    const [cycle, setCycle] = useState<TradeCycle | null>(null);

    useEffect(() => {
        if (cycleId) {
            fetchDetails();
        }
    }, [cycleId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: TradeCycle }>(
                `/api/v1/gdip/admin/cycle/${cycleId}`
            );
            if (response.success) {
                setCycle(response.data);
            }
        } catch (err) {
            console.error("Error fetching cycle details:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusDescription = (status: string) => {
        if (status === "completed") return translate("gdip.admin.cycleDetails.completed");
        if (status === "active") return translate("gdip.admin.cycleDetails.active");
        if (status === "processing") return translate("gdip.admin.cycleDetails.processing");
        if (status === "scheduled") return translate("gdip.admin.cycleDetails.scheduled");
        return translate("gdip.admin.cycleDetails.notStarted");
    };

    if (!cycleId) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        Trade Cycle Details
                        {cycle && <span className="text-gray-500 font-normal">#{cycle.cycleId}</span>}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : cycle ? (
                    <div className="p-6 space-y-8">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${cycle.status === "completed" ? "bg-green-50 border-green-100" :
                            cycle.status === "active" ? "bg-blue-50 border-blue-100" :
                                "bg-yellow-50 border-yellow-100"
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${cycle.status === "completed" ? "bg-green-100 text-green-600" :
                                    cycle.status === "active" ? "bg-blue-100 text-blue-600" :
                                        "bg-yellow-100 text-yellow-600"
                                    }`}>
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 capitalize">{cycle.status} Cycle</p>
                                    <p className="text-sm text-gray-600">
                                        {getStatusDescription(cycle.status)}
                                    </p>
                                </div>
                            </div>
                            {cycle.status === "completed" && (
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Actual ROI</p>
                                    <p className="text-xl font-bold text-green-600">+{cycle.actualProfitRate}%</p>
                                </div>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* General Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Trade Specs
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">GDC Cluster</span>
                                        <span className="font-medium text-gray-900">GDC-{cycle.gdcNumber}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Commodity</span>
                                        <span className="font-medium text-gray-900">{cycle.commodityType}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Quantity</span>
                                        <span className="font-medium text-gray-900">{cycle.commodityQuantity} units</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Capital Deployed</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(cycle.totalCapital)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Financials
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Purchase Price</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(cycle.purchasePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Sale Price</span>
                                        <span className="font-medium text-gray-900">{cycle.salePrice ? formatCurrency(cycle.salePrice) : "Pending"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Trading Costs</span>
                                        <span className={`font-medium ${cycle.tradingCosts > 0 ? "text-red-600" : "text-gray-900"}`}>
                                            {cycle.tradingCosts > 0 ? `-${formatCurrency(cycle.tradingCosts)}` : formatCurrency(0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                        <span className="text-gray-900 font-medium">
                                            {cycle.status === "active" ? translate("gdip.common.accruedProfit") : "Net Profit"}
                                        </span>
                                        <span className="font-bold text-green-600">
                                            {cycle.status === "active"
                                                ? formatCurrency(cycle.currentProfit || 0)
                                                : cycle.salePrice
                                                ? formatCurrency(cycle.salePrice - cycle.purchasePrice - cycle.tradingCosts)
                                                : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Timeline
                            </h3>
                            <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-600 uppercase font-bold mb-1">Start Date</p>
                                    <p className="font-medium text-blue-900">{formatDate(cycle.startDate)}</p>
                                </div>
                                <div className="flex-1 border-b-2 border-dashed border-blue-200 mx-4 relative top-1"></div>
                                <div className="text-right">
                                    <p className="text-xs text-blue-600 uppercase font-bold mb-1">End Date</p>
                                    <p className="font-medium text-blue-900">{formatDate(cycle.endDate)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Status */}
                        {cycle.status === "completed" && (
                            <div className={`p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${cycle.profitDistributed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                }`}>
                                {cycle.profitDistributed
                                    ? "✓ Profits have been distributed to investors"
                                    : "⚠ Profits pending distribution"}
                            </div>
                        )}
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
