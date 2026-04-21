"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/utils/api";
import {
    Plus,
    Layers,
    Wallet,
    TrendingUp,
    ShieldCheck,
    Activity,
    LayoutGrid,
    AlertTriangle,
    Inbox,
    ArrowRight,
    FileText
} from "lucide-react";
import { translate } from "@/utils/translate";

interface PortfolioSummary {
    totalTPIAs: number;
    totalInvested: number;
    currentValue: number;
    totalProfitEarned: number;
    activeCycles: number;
    tpiasByStatus: {
        pending: number;
        active: number;
        matured: number;
        suspended: number;
    };
    tpiasByMode: {
        TPM: number;
        EPS: number;
    };
    gdcs: number;
}

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

export default function GDIPDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [tpias, setTPIAs] = useState<TPIA[]>([]);
    const [error, setError] = useState("");
    const [walletBalance, setWalletBalance] = useState<number>(0);

    useEffect(() => {
        fetchPortfolio();
        fetchWalletBalance();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: { summary: PortfolioSummary; tpias: TPIA[] } }>("/api/v1/gdip/portfolio");

            if (response.success) {
                setSummary(response.data.summary);
                setTPIAs(response.data.tpias);
            }
        } catch (err: any) {
            console.error("Error fetching portfolio:", err);
            setError(err.message || translate("gdip.dashboard.error.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const response = await apiGet<{ data: { ngnWallet: { available: number } } }>("/api/v1/wallets/summary");
            if (response.data?.ngnWallet?.available !== undefined) {
                setWalletBalance(response.data.ngnWallet.available);
            }
        } catch (err: any) {
            console.error("Error fetching wallet balance:", err);
        }
    };

    const formatCurrency = (amount: number, minimumFractionDigits = 2) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: minimumFractionDigits,
            maximumFractionDigits: minimumFractionDigits,
        }).format(amount);
    };

    const calculateROI = () => {
        if (!summary || summary.totalInvested === 0) return 0;
        return ((summary.totalProfitEarned / summary.totalInvested) * 100).toFixed(2);
    };

    const isActiveCycle = (tpia: TPIA) => tpia.currentCycleId?.status === "active";

    const calculateCycleProgress = (tpia: TPIA) => {
        if (!isActiveCycle(tpia) || !tpia.currentCycleId?.startDate || !tpia.currentCycleId?.endDate) return 0;

        const start = new Date(tpia.currentCycleId.startDate).getTime();
        const end = new Date(tpia.currentCycleId.endDate).getTime();
        const now = Date.now();

        if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    };

    const getCycleMessage = (tpia: TPIA) => {
        if (isActiveCycle(tpia)) return translate("gdip.common.cycleActive");
        if (tpia.currentCycleId?.status === "scheduled") return translate("gdip.common.cycleScheduled");
        if (tpia.status === "pending") {
            if (tpia.gdcFill) {
                return translate("gdip.common.waitingForGDCFilled", { current: tpia.gdcFill.currentFill, total: tpia.gdcFill.capacity });
            }
            return translate("gdip.common.waitingForGDC");
        }
        return translate("gdip.common.cycleNotStarted");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">{translate("gdip.dashboard.error.title")}</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                                {translate("gdip.dashboard.title")}
                            </h1>
                            <p className="text-gray-500 font-medium">
                                {translate("gdip.dashboard.subtitle")}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/gdip/statement')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl shadow-gray-200 transition-all active:scale-95 group"
                        >
                            <FileText size={18} className="group-hover:rotate-6 transition-transform" />
                            <span>{translate("gdip.dashboard.generateStatement")}</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
                        {/* Total TPIAs */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 px-1.5 bg-blue-50 rounded-md text-blue-600">
                                    <Layers className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.dashboard.stats.totalTPIAs")}</p>
                            </div>
                            <p className="text-xl sm:text-3xl font-black text-gray-900">{summary.totalTPIAs}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{translate("gdip.dashboard.stats.clusters", { count: summary.gdcs })}</p>
                        </div>

                        {/* Total Invested */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 px-1.5 bg-emerald-50 rounded-md text-emerald-600">
                                    <Wallet className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.dashboard.stats.deployed")}</p>
                            </div>
                            <p className="text-lg sm:text-2xl font-black text-gray-900 leading-none">
                                {formatCurrency(summary.totalInvested, 0)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{translate("gdip.dashboard.stats.startingCapital")}</p>
                        </div>

                        {/* Total Profit */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 px-1.5 bg-indigo-50 rounded-md text-indigo-600">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.dashboard.stats.profit")}</p>
                            </div>
                            <p className="text-lg sm:text-2xl font-black text-emerald-600 leading-none">
                                {formatCurrency(summary.totalProfitEarned, 0)}
                            </p>
                            <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase bg-emerald-50 w-fit px-1.5 py-0.5 rounded">{translate("gdip.dashboard.stats.roi", { roi: calculateROI() })}</p>
                        </div>

                        {/* Current Value */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 px-1.5 bg-amber-50 rounded-md text-amber-600">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.dashboard.stats.netValue")}</p>
                            </div>
                            <p className="text-lg sm:text-2xl font-black text-gray-900 leading-none">
                                {formatCurrency(summary.currentValue, 0)}
                            </p>
                            <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase flex flex-wrap gap-1 leading-tight">
                                {translate("gdip.dashboard.stats.netGain")} <span className="text-emerald-600">+{formatCurrency(summary.currentValue - summary.totalInvested, 0)}</span>
                            </div>
                        </div>

                        {/* Wallet Balance */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-5 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1 px-1.5 bg-blue-50 rounded-md text-blue-600">
                                        <Activity className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.dashboard.stats.available")}</p>
                                </div>
                                <p className="text-lg sm:text-2xl font-black text-blue-600 leading-none">
                                    {formatCurrency(walletBalance, 0)}
                                </p>
                            </div>
                            {walletBalance < 1000000 && (
                                <p className="text-[9px] font-black text-amber-600 mt-2 flex items-center gap-1 uppercase tracking-tighter bg-amber-50 w-fit px-1.5 py-0.5 rounded leading-none whitespace-nowrap">
                                    <AlertTriangle className="w-3 h-3" />
                                    {translate("gdip.dashboard.stats.balanceAlert")}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Cycle Start Guidance */}
                <div className="mb-10 rounded-3xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">{translate("gdip.dashboard.cycleGuide.title")}</h2>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                {translate("gdip.dashboard.cycleGuide.description")}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px] font-black uppercase tracking-widest">
                                <span className="rounded-xl bg-white px-3 py-2 text-amber-700 border border-amber-100">{translate("gdip.dashboard.cycleGuide.pending")}</span>
                                <span className="rounded-xl bg-white px-3 py-2 text-indigo-700 border border-indigo-100">{translate("gdip.dashboard.cycleGuide.scheduled")}</span>
                                <span className="rounded-xl bg-white px-3 py-2 text-emerald-700 border border-emerald-100">{translate("gdip.dashboard.cycleGuide.active")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 mb-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Activity className="w-24 h-24" />
                    </div>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                        {translate("gdip.dashboard.quickActions.title")}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push("/gdip/purchase")}
                            className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95 group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            {translate("gdip.dashboard.quickActions.purchase")}
                        </button>

                        <button
                            onClick={() => router.push("/gdip/tpias")}
                            className="flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-md shadow-gray-100 active:scale-95 group"
                        >
                            <LayoutGrid className="w-5 h-5 opacity-70 group-hover:scale-110 transition-transform" />
                            {translate("gdip.dashboard.quickActions.portfolio")}
                        </button>

                        <button
                            onClick={() => router.push("/gdip/cycles")}
                            className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 group"
                        >
                            <Activity className="w-5 h-5 opacity-70 group-hover:translate-y-[-2px] transition-all" />
                            {translate("gdip.dashboard.quickActions.cycles")}
                        </button>
                    </div>
                </div>

                {/* Recent TPIAs */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-1 leading-none">{translate("gdip.dashboard.activeHoldings.title")}</h2>
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.dashboard.activeHoldings.subtitle")}</p>
                        </div>
                        <button
                            onClick={() => router.push("/gdip/tpias")}
                            className="w-full sm:w-auto bg-gray-50 text-gray-900 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all group active:scale-95 border border-gray-100 sm:border-none"
                        >
                            {translate("gdip.dashboard.activeHoldings.manage")} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {tpias.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                            <Inbox className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2">{translate("gdip.dashboard.activeHoldings.emptyTitle")}</h3>
                            <p className="text-gray-500 font-medium mb-6">{translate("gdip.dashboard.activeHoldings.emptySubtitle")}</p>
                            <button
                                onClick={() => router.push("/gdip/purchase")}
                                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                            >
                                {translate("gdip.dashboard.activeHoldings.getStarted")}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {tpias.slice(0, 6).map((tpia) => (
                                <div
                                    key={tpia._id}
                                    onClick={() => router.push(`/gdip/tpia/${tpia._id}`)}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden p-5 space-y-5 active:scale-[0.98] group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-black text-xl text-gray-900 tracking-tight">{tpia.tpiaId}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    <span className="opacity-50 text-sm">#</span> {translate("gdip.dashboard.tpiaCard.cluster", { number: tpia.gdcNumber })}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${tpia.status === "active" ? "bg-green-100 text-green-700" :
                                            tpia.status === "pending" ? "bg-amber-100 text-amber-700" :
                                                "bg-gray-100 text-gray-500 border border-gray-200"
                                            }`}>
                                            {translate("gdip.status." + tpia.status)}
                                        </span>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 space-y-1">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.dashboard.tpiaCard.capital")}</p>
                                            <p className="text-[11px] sm:text-sm font-black text-gray-900 leading-none">{formatCurrency(tpia.purchasePrice, 0)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 space-y-1">
                                            <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest">{translate("gdip.dashboard.tpiaCard.estReturn")}</p>
                                            {isActiveCycle(tpia) ? (
                                                <p className="text-[11px] sm:text-sm font-black text-emerald-600 leading-none">+{formatCurrency(tpia.estimatedProfit || 0, 0)}</p>
                                            ) : (
                                                <p className="text-[10px] sm:text-xs font-black text-gray-500 leading-tight">{translate("gdip.dashboard.tpiaCard.startsAfterActivation")}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Stats */}
                                    <div className="space-y-1.5 px-1">
                                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
                                            <span className="text-gray-400">{translate("gdip.dashboard.tpiaCard.netValue")}</span>
                                            <span className="text-gray-900 font-black ml-2">{formatCurrency(tpia.currentValue, 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                                            <span className="text-gray-400">{translate("gdip.dashboard.tpiaCard.profitMode")}</span>
                                            <span className={`px-2 py-0.5 rounded ${tpia.profitMode === "TPM" ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"}`}>
                                                {tpia.profitMode}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Cycle Progress */}
                                    {isActiveCycle(tpia) ? (
                                        <div className="pt-2">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.dashboard.tpiaCard.cycleProgress")}</p>
                                                <p className="text-[10px] font-black text-blue-600 uppercase">
                                                    {calculateCycleProgress(tpia).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${calculateCycleProgress(tpia)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-2">
                                            <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-100 text-center">
                                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">{getCycleMessage(tpia)}</p>
                                                {tpia.gdcFill && tpia.gdcFill.slotsRemaining > 0 && (
                                                    <p className="mt-1 text-[9px] font-bold text-amber-600 uppercase tracking-widest">{translate("gdip.common.slotsRemaining", { count: tpia.gdcFill.slotsRemaining })}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs font-black text-blue-600 uppercase tracking-[0.2em]">
                                        {translate("gdip.dashboard.tpiaCard.viewDetails")} <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
