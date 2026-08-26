"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Activity, TrendingUp, DollarSign, Package, ShieldCheck, History, UserCheck } from "lucide-react";
import { apiGet } from "@/utils/api";
import { translate } from "@/utils/translate";

interface CycleDetailsModalProps {
    cycleId: string;
    onClose: () => void;
}

interface TradeCycleAdminActor {
    adminId?: string;
    name?: string;
    email?: string;
    role?: string;
    at?: string;
    action?: string;
}

interface TradeCycleAuditLog {
    action: string;
    performedBy?: {
        adminId?: string;
        name?: string;
        email?: string;
        role?: string;
    };
    details?: string;
    timestamp: string;
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
    executedByAdmin?: TradeCycleAdminActor;
    approvedByAdmin?: TradeCycleAdminActor;
    lastModifiedByAdmin?: TradeCycleAdminActor;
    auditLogs?: TradeCycleAuditLog[];
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

                        {/* Manager Action Audit & Blame Trail */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-3 shadow-inner">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck size={14} className="text-amber-400" /> Manager Audit & Execution Trail (Blame Log)
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono">Traceability</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {/* Executed By */}
                                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cycle Execution / Launch</span>
                                    {cycle.executedByAdmin ? (
                                        <div>
                                            <div className="font-bold text-amber-300">{cycle.executedByAdmin.name}</div>
                                            <span className="text-[10px] text-slate-400 block truncate" title={cycle.executedByAdmin.email}>
                                                {cycle.executedByAdmin.email}
                                            </span>
                                            <div className="mt-1 flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase border border-amber-500/30">
                                                    {cycle.executedByAdmin.role || "GDIP Manager"}
                                                </span>
                                            </div>
                                            {cycle.executedByAdmin.at && (
                                                <span className="text-[9px] text-slate-500 block mt-1 font-mono">
                                                    {new Date(cycle.executedByAdmin.at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="font-semibold text-slate-300">Automated Scheduler</span>
                                            <span className="text-[10px] text-slate-500 block">Launched by platform cron scheduler</span>
                                        </div>
                                    )}
                                </div>

                                {/* Profit Distribution / Approval */}
                                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Settlement Approval</span>
                                    {cycle.approvedByAdmin ? (
                                        <div>
                                            <div className="font-bold text-green-400">{cycle.approvedByAdmin.name}</div>
                                            <span className="text-[10px] text-slate-400 block truncate" title={cycle.approvedByAdmin.email}>
                                                {cycle.approvedByAdmin.email}
                                            </span>
                                            <div className="mt-1 flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[9px] font-bold uppercase border border-green-500/30">
                                                    {cycle.approvedByAdmin.role || "Admin"}
                                                </span>
                                            </div>
                                            {cycle.approvedByAdmin.at && (
                                                <span className="text-[9px] text-slate-500 block mt-1 font-mono">
                                                    {new Date(cycle.approvedByAdmin.at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    ) : cycle.profitDistributed ? (
                                        <div>
                                            <span className="font-semibold text-emerald-400">Automated Settlement</span>
                                            <span className="text-[10px] text-slate-500 block">Profits disbursed directly to investor wallets</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="font-semibold text-amber-400">Pending Settlement</span>
                                            <span className="text-[10px] text-slate-500 block">Awaiting cycle completion</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Chronology Log */}
                            {cycle.auditLogs && cycle.auditLogs.length > 0 && (
                                <div className="pt-2 border-t border-slate-800">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                                        <History size={12} className="text-amber-400" /> Action Chronology ({cycle.auditLogs.length}):
                                    </span>
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {cycle.auditLogs.map((log: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="p-2 bg-slate-950/90 rounded-lg border border-slate-800 flex items-start justify-between text-[11px] gap-2"
                                            >
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-amber-300">{log.performedBy?.name || "Manager"}</span>
                                                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono">
                                                            {log.performedBy?.role || "admin"}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1 rounded">
                                                            {log.action}
                                                        </span>
                                                    </div>
                                                    {log.details && (
                                                        <p className="text-slate-300 text-[10px] leading-relaxed break-words">{log.details}</p>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
