"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import {
    ArrowLeft,
    ClipboardCheck,
    CheckCircle2,
    Clock,
    Sparkles,
    Activity,
    Trophy,
    Search,
    TrendingUp
} from "lucide-react";
import { translate } from "@/utils/translate";

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    gdcId: string;
    gdcNumber: number;
    tpiaCount: number;
    startDate: string;
    endDate: string;
    duration: number;
    actualDuration?: number;
    status: string;
    totalCapital: number;
    targetProfitRate: number;
    actualProfitRate: number;
    totalProfitGenerated: number;
    commodityType: string;
    purchasePrice: number;
    salePrice?: number;
    roi: number;
    performanceRating?: string;
    profitDistributed: boolean;
    distributionDate?: string;
}

export default function TradeCyclesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState<TradeCycle[]>([]);
    const [filteredCycles, setFilteredCycles] = useState<TradeCycle[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        fetchCycles();
    }, []);

    useEffect(() => {
        filterCycles();
    }, [statusFilter, cycles]);

    const fetchCycles = async () => {
        try {
            setLoading(true);
            // Get all TPIAs first
            const tpiasResponse = await apiGet<{ success: boolean; count: number; data: any[] }>(
                "/api/v1/gdip/tpias"
            );

            if (tpiasResponse.success && tpiasResponse.data.length > 0) {
                // Get cycles for first TPIA (they all share same GDC cycles)
                const firstTPIA = tpiasResponse.data[0];
                const cyclesResponse = await apiGet<{ success: boolean; count: number; data: TradeCycle[] }>(
                    `/api/v1/gdip/tpia/${firstTPIA._id}/cycles`,
                    { query: { limit: 50 } }
                );

                if (cyclesResponse.success) {
                    setCycles(cyclesResponse.data);
                    setFilteredCycles(cyclesResponse.data);
                }
            }
        } catch (err: any) {
            console.error("Error fetching cycles:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterCycles = () => {
        if (statusFilter === "all") {
            setFilteredCycles(cycles);
        } else {
            setFilteredCycles(cycles.filter((cycle) => cycle.status === statusFilter));
        }
    };

    const formatCurrency = (amount: number, minimumFractionDigits = 0) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits,
            maximumFractionDigits: minimumFractionDigits,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).toUpperCase();
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const calculateEstimatedProfit = (cycle: TradeCycle) => {
        if (cycle.status !== 'active') return 0;
        const totalProfitTarget = (cycle.targetProfitRate / 100) * cycle.totalCapital;
        const remaining = getDaysRemaining(cycle.endDate);
        const progress = Math.max(0, Math.min(1, (37 - remaining) / 37));
        return totalProfitTarget * progress;
    };

    const calculateCycleProgress = (cycle: TradeCycle) => {
        if (cycle.status === "completed") return 100;
        if (cycle.status !== "active") return 0;

        const start = new Date(cycle.startDate).getTime();
        const end = new Date(cycle.endDate).getTime();
        const now = Date.now();

        if (isNaN(start) || isNaN(end) || end <= start) {
            return 0;
        }

        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    };

    const getCycleProgressLabel = (cycle: TradeCycle) => {
        if (cycle.status === "completed") return translate("gdip.cycles.card.sequenceComplete");
        if (cycle.status === "active") return translate("gdip.cycles.card.active", { percent: calculateCycleProgress(cycle).toFixed(1) });
        if (cycle.status === "scheduled") return translate("gdip.cycles.card.scheduled");
        if (cycle.status === "processing") return translate("gdip.cycles.card.processing");
        return translate("gdip.cycles.card.notStarted");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "completed":
                return "bg-blue-100 text-blue-700";
            case "scheduled":
                return "bg-yellow-100 text-yellow-700";
            case "processing":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPerformanceColor = (rating?: string) => {
        switch (rating) {
            case "excellent":
                return "text-green-600";
            case "good":
                return "text-blue-600";
            case "average":
                return "text-yellow-600";
            case "poor":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-xs uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {translate("gdip.cycles.backToDashboard")}
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase mb-2">
                        {translate("gdip.cycles.title")}
                    </h1>
                    <p className="text-gray-500 font-medium sm:text-lg">
                        {translate("gdip.cycles.subtitle")}
                    </p>
                </div>

                {/* Stats Summary */}
                {cycles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm group hover:border-blue-200 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                    <Activity size={16} />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.cycles.stats.globalCycles")}</p>
                            </div>
                            <p className="text-3xl font-black text-gray-900 leading-none">{cycles.length}</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm group hover:border-emerald-200 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                    <CheckCircle2 size={16} />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.cycles.stats.matured")}</p>
                            </div>
                            <p className="text-3xl font-black text-emerald-600 leading-none">
                                {cycles.filter((c) => c.status === "completed").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm group hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                    <TrendingUp size={16} />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.cycles.stats.activeVelocity")}</p>
                            </div>
                            <p className="text-3xl font-black text-indigo-600 leading-none">
                                {cycles.filter((c) => c.status === "active").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm group hover:border-purple-200 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                                    <Trophy size={16} />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.cycles.stats.avgGrowth")}</p>
                            </div>
                            <p className="text-3xl font-black text-purple-600 leading-none">
                                {(
                                    cycles
                                        .filter((c) => c.status === "completed")
                                        .reduce((sum, c) => sum + c.roi, 0) /
                                    cycles.filter((c) => c.status === "completed").length || 0
                                ).toFixed(1)}
                                <span className="text-sm ml-1">%</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.cycles.filters.label")}</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-xs text-gray-900 appearance-none cursor-pointer"
                            >
                                <option value="all">{translate("gdip.cycles.filters.options.all")}</option>
                                <option value="scheduled">{translate("gdip.cycles.filters.options.scheduled")}</option>
                                <option value="active">{translate("gdip.cycles.filters.options.active")}</option>
                                <option value="processing">{translate("gdip.cycles.filters.options.processing")}</option>
                                <option value="completed">{translate("gdip.cycles.filters.options.completed")}</option>
                            </select>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {translate("gdip.cycles.filters.showing", { count: filteredCycles.length })}
                        </p>
                    </div>
                </div>

                {/* Cycles Timeline */}
                {filteredCycles.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ClipboardCheck className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 uppercase">{translate("gdip.cycles.empty.title")}</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">{translate("gdip.cycles.empty.subtitle")}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredCycles.map((cycle, index) => (
                            <div
                                key={cycle._id}
                                className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden"
                            >
                                {/* Background Decorative Icon */}
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-transform pointer-events-none">
                                    <Sparkles className="w-40 h-40 text-gray-900" />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none mb-1 w-full">{translate("gdip.cycles.card.sequenceIdentifier")}</p>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{cycle.cycleId}</h3>
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${cycle.status === "active"
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                                : cycle.status === "completed"
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                                    : cycle.status === "scheduled"
                                                        ? "bg-amber-500 text-white shadow-lg shadow-amber-100"
                                                        : "bg-purple-600 text-white shadow-lg shadow-purple-100"
                                                }`}>
                                                {translate("gdip.status." + cycle.status)}
                                            </span>
                                            {cycle.performanceRating && (
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-900 text-white`}>
                                                    {translate("gdip.cycles.card.performance", { rating: translate("gdip.status." + cycle.performanceRating) })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2">
                                                <Activity size={10} className="text-blue-500" />
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{translate("gdip.cycles.card.node")}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <Activity size={10} className="text-blue-500" />
                                                {translate("gdip.cycles.card.clusters", { number: cycle.gdcNumber, count: cycle.tpiaCount })}
                                            </div>
                                        </div>
                                    </div>

                                    {cycle.status === "active" && (
                                        <div className="text-left md:text-right p-4 bg-emerald-50 rounded-2xl border border-emerald-100 min-w-[140px]">
                                            <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">{translate("gdip.cycles.card.daysRemaining")}</p>
                                            <p className="text-3xl font-black text-emerald-600 leading-none">{getDaysRemaining(cycle.endDate)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Timeline / Velocity */}
                                <div className="mb-10 relative z-10">
                                    <div className="flex justify-between items-center mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Clock size={10} className="text-gray-400" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{translate("gdip.cycles.card.growthVelocity")}</span>
                                        </div>
                                        <span className="text-xs font-black text-blue-600 tracking-tighter uppercase">
                                            {getCycleProgressLabel(cycle)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100 shadow-inner">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${cycle.status === "completed"
                                                ? "from-blue-500 to-indigo-600"
                                                : cycle.status === "active"
                                                    ? "from-blue-500 via-indigo-500 to-emerald-500"
                                                    : "from-amber-400 to-amber-600"
                                                }`}
                                            style={{
                                                width:
                                                    cycle.status === "completed"
                                                        ? "100%"
                                                        : cycle.status === "active"
                                                            ? `${calculateCycleProgress(cycle)}%`
                                                            : "0%",
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-3 px-1">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.cycles.card.inauguration")}</p>
                                            <p className="text-[10px] font-black text-gray-900">{formatDate(cycle.startDate)}</p>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.cycles.card.cycleWindow")}</p>
                                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{translate("gdip.cycles.card.days", { count: cycle.duration })}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.cycles.card.maturityDate")}</p>
                                            <p className="text-[10px] font-black text-gray-900">{formatDate(cycle.endDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Architecture */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-gray-50 relative z-10">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">{translate("gdip.cycles.card.cycleCapital")}</p>
                                        <p className="text-base font-black text-gray-900 leading-none">{formatCurrency(cycle.totalCapital)}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">{translate("gdip.cycles.card.floorTarget")}</p>
                                        <p className="text-base font-black text-gray-900 leading-none">{cycle.targetProfitRate}% <span className="text-[10px] text-gray-400">{translate("gdip.cycles.card.roi")}</span></p>
                                    </div>
                                    {cycle.status === "active" && (
                                        <div className="md:col-span-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-indigo-600/70 uppercase tracking-widest mb-1 leading-none">{translate("gdip.cycles.card.accruedYield")}</p>
                                                <p className="text-base font-black text-indigo-600 leading-none">+{formatCurrency(calculateEstimatedProfit(cycle))}</p>
                                            </div>
                                            <TrendingUp className="text-indigo-600 opacity-20" size={24} />
                                        </div>
                                    )}
                                    {(cycle.status === "scheduled" || cycle.status === "processing") && (
                                        <div className="md:col-span-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest mb-1 leading-none">{translate("gdip.cycles.card.activationStatus")}</p>
                                                <p className="text-sm font-black text-amber-700 leading-tight">{translate("gdip.cycles.card.notAccruingYet")}</p>
                                            </div>
                                            <Clock className="text-amber-600 opacity-20" size={24} />
                                        </div>
                                    )}
                                    {cycle.status === "completed" && (
                                        <>
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest mb-1 leading-none">{translate("gdip.cycles.card.actualYield")}</p>
                                                <p className="text-base font-black text-emerald-600 leading-none">{cycle.actualProfitRate?.toFixed(1) || 0}%</p>
                                            </div>
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <p className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest mb-1 leading-none">{translate("gdip.cycles.card.netGrowth")}</p>
                                                <p className="text-base font-black text-emerald-600 leading-none">{formatCurrency(cycle.totalProfitGenerated || 0)}</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Payout Architecture */}
                                {cycle.status === "completed" && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${cycle.profitDistributed ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{translate("gdip.cycles.card.payoutArchitecture")}</span>
                                        </div>
                                        {cycle.profitDistributed ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                                                <CheckCircle2 size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                    {translate("gdip.cycles.card.disbursed", { date: cycle.distributionDate ? formatDate(cycle.distributionDate) : "" })}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                                                <Clock size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{translate("gdip.cycles.card.distributionPending")}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
