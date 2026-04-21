"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import { ArrowLeft, Inbox, Search, Filter, Sparkles } from "lucide-react";
import { translate } from "@/utils/translate";

interface TPIA {
    _id: string;
    tpiaId: string;
    tpiaNumber: number;
    partnerName: string;
    gdcNumber: number;
    positionInGDC: number;
    purchasePrice: number;
    currentValue: number;
    totalProfitEarned: number;
    estimatedProfit?: number;
    profitMode: "TPM" | "EPS";
    status: string;
    cyclesCompleted: number;
    insuranceCertificateNumber: string;
    commodityType: string;
    purchasedAt: string;
    currentCycleId?: {
        startDate: string;
        endDate: string;
        status: string;
        targetProfitRate: number;
    };
    gdcFill?: {
        currentFill: number;
        capacity: number;
        slotsRemaining: number;
        status: string;
    };
}

export default function AllTPIAsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tpias, setTPIAs] = useState<TPIA[]>([]);
    const [filteredTPIAs, setFilteredTPIAs] = useState<TPIA[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [modeFilter, setModeFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchTPIAs();
    }, []);

    useEffect(() => {
        filterTPIAs();
    }, [statusFilter, modeFilter, searchQuery, tpias]);

    const fetchTPIAs = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; count: number; data: TPIA[] }>("/api/v1/gdip/tpias");

            if (response.success) {
                setTPIAs(response.data);
                setFilteredTPIAs(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching TPIAs:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterTPIAs = () => {
        let filtered = [...tpias];

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((tpia) => tpia.status === statusFilter);
        }

        // Mode filter
        if (modeFilter !== "all") {
            filtered = filtered.filter((tpia) => tpia.profitMode === modeFilter);
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (tpia) =>
                    tpia.tpiaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tpia.insuranceCertificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredTPIAs(filtered);
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

    const isCycleActive = (tpia: TPIA) => tpia.currentCycleId?.status === "active";

    const calculateCycleProgress = (tpia: TPIA) => {
        if (!isCycleActive(tpia) || !tpia.currentCycleId?.startDate || !tpia.currentCycleId?.endDate) {
            return 0;
        }

        const start = new Date(tpia.currentCycleId.startDate).getTime();
        const end = new Date(tpia.currentCycleId.endDate).getTime();
        const now = Date.now();

        if (isNaN(start) || isNaN(end) || end <= start) {
            return 0;
        }

        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    };

    const getCycleState = (tpia: TPIA) => {
        if (isCycleActive(tpia)) {
            return translate("gdip.common.cycleActive");
        }

        if (tpia.currentCycleId?.status === "scheduled") {
            return translate("gdip.common.cycleScheduled");
        }

        if (tpia.gdcFill) {
            return translate("gdip.common.waitingForGDCFilled", { current: tpia.gdcFill.currentFill, total: tpia.gdcFill.capacity });
        }

        return translate("gdip.common.waitingForGDC");
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
                        {translate("gdip.tpias.backToDashboard")}
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase mb-2">
                        {translate("gdip.tpias.title")}
                    </h1>
                    <p className="text-gray-500 font-medium sm:text-lg">
                        {translate("gdip.tpias.subtitle")}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{translate("gdip.tpias.filters.searchLabel")}</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={translate("gdip.tpias.filters.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{translate("gdip.tpias.filters.statusLabel")}</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm text-gray-900 appearance-none cursor-pointer"
                            >
                                <option value="all">{translate("gdip.tpias.filters.statusOptions.all")}</option>
                                <option value="pending">{translate("gdip.tpias.filters.statusOptions.pending")}</option>
                                <option value="active">{translate("gdip.tpias.filters.statusOptions.active")}</option>
                                <option value="matured">{translate("gdip.tpias.filters.statusOptions.matured")}</option>
                                <option value="suspended">{translate("gdip.tpias.filters.statusOptions.suspended")}</option>
                            </select>
                        </div>

                        {/* Mode Filter */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{translate("gdip.tpias.filters.modeLabel")}</label>
                            <select
                                value={modeFilter}
                                onChange={(e) => setModeFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm text-gray-900 appearance-none cursor-pointer"
                            >
                                <option value="all">{translate("gdip.tpias.filters.modeOptions.all")}</option>
                                <option value="TPM">{translate("gdip.tpias.filters.modeOptions.TPM")}</option>
                                <option value="EPS">{translate("gdip.tpias.filters.modeOptions.EPS")}</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {translate("gdip.tpias.filters.results", { count: filteredTPIAs.length })}
                        </p>
                        <button
                            onClick={() => {
                                setStatusFilter("all");
                                setModeFilter("all");
                                setSearchQuery("");
                            }}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                        >
                            {translate("gdip.tpias.filters.reset")}
                        </button>
                    </div>
                </div>

                {/* TPIAs Grid */}
                {filteredTPIAs.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Inbox className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 uppercase">{translate("gdip.tpias.empty.title")}</h3>
                        <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">{translate("gdip.tpias.empty.subtitle")}</p>
                        <button
                            onClick={() => router.push("/gdip/purchase")}
                            className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
                        >
                            {translate("gdip.tpias.empty.button")}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTPIAs.map((tpia) => (
                            <div
                                key={tpia._id}
                                onClick={() => router.push(`/gdip/tpia/${tpia._id}`)}
                                className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all cursor-pointer group active:scale-[0.98] relative overflow-hidden"
                            >
                                {/* Background Decorative Icon */}
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform pointer-events-none">
                                    <Sparkles className="w-24 h-24 text-gray-900" />
                                </div>

                                {/* Header */}
                                <div className="flex items-start justify-between mb-6 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">{translate("gdip.tpias.card.assetIdentifier")}</p>
                                        <h3 className="font-black text-2xl tracking-tighter text-gray-900 leading-none">{tpia.tpiaId}</h3>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${tpia.status === "active"
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                            : tpia.status === "pending"
                                                ? "bg-amber-500 text-white shadow-lg shadow-amber-100"
                                                : tpia.status === "matured"
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                                    : "bg-gray-400 text-white shadow-lg shadow-gray-100"
                                            }`}
                                    >
                                        {translate("gdip.status." + tpia.status)}
                                    </span>
                                </div>

                                {/* Trade Deployment Badge */}
                                <div className="mb-8 relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                                        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{translate("gdip.tpias.card.node")}</span>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">{translate("gdip.tpias.card.purchase")}</p>
                                        <p className="text-base font-black text-gray-900 leading-none">{formatCurrency(tpia.purchasePrice)}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1 leading-none">{translate("gdip.tpias.card.netValue")}</p>
                                        <p className="text-base font-black text-emerald-600 leading-none">{formatCurrency(tpia.currentValue)}</p>
                                    </div>
                                </div>

                                {/* Additional Details Row */}
                                <div className="flex items-center justify-between mb-8 px-1 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.tpias.card.clusterLocation")}</p>
                                        <p className="text-xs font-black text-gray-900 uppercase">{translate("gdip.tpias.card.nodeNumber", { number: tpia.gdcNumber })}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.tpias.card.marketSlot")}</p>
                                        <p className="text-xs font-black text-blue-600 uppercase">{translate("gdip.tpias.card.pos", { pos: tpia.positionInGDC })}</p>
                                    </div>
                                </div>

                                {/* Footer & Strategy */}
                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${tpia.profitMode === "TPM" ? "bg-purple-600 text-white shadow-lg shadow-purple-100" : "bg-indigo-600 text-white shadow-lg shadow-indigo-100"}`}>
                                            {tpia.profitMode}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.tpias.card.lifecycles", { count: tpia.cyclesCompleted })}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(tpia.purchasedAt)}</p>
                                </div>

                                {isCycleActive(tpia) ? (
                                    <div className="mt-8 pt-6 border-t border-gray-50 relative z-10">
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{translate("gdip.tpias.card.growthVelocity")}</span>
                                            <span className="text-xs font-black text-blue-600 tracking-tighter">
                                                {calculateCycleProgress(tpia).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100 shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${calculateCycleProgress(tpia)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-8 pt-6 border-t border-gray-50 relative z-10">
                                        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{getCycleState(tpia)}</p>
                                            {tpia.gdcFill && (
                                                <>
                                                    <div className="mt-3 h-2 bg-white rounded-full overflow-hidden p-0.5 border border-amber-100">
                                                        <div
                                                            className="h-full rounded-full bg-amber-500 transition-all duration-1000"
                                                            style={{ width: `${Math.min(100, Math.max(0, (tpia.gdcFill.currentFill / tpia.gdcFill.capacity) * 100))}%` }}
                                                        />
                                                    </div>
                                                    <p className="mt-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                                                        {tpia.gdcFill.slotsRemaining > 0
                                                            ? translate("gdip.common.slotsRemainingBeforeActivation", { count: tpia.gdcFill.slotsRemaining })
                                                            : translate("gdip.common.gdcCompleteAwaitingActivation")}
                                                    </p>
                                                </>
                                            )}
                                        </div>
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
