"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPut } from "@/utils/api";
import {
    ArrowLeft,
    TrendingUp,
    ShieldCheck,
    Activity,
    Box,
    CircleDollarSign,
    BarChart3,
    History,
    Download,
    FileText
} from "lucide-react";
import { translate } from "@/utils/translate";

interface TPIADetails {
    tpia: {
        _id: string;
        tpiaId: string;
        tpiaNumber: number;
        partnerName: string;
        partnerEmail: string;
        gdcId: string;
        gdcNumber: number;
        positionInGDC: number;
        purchasePrice: number;
        currentValue: number;
        totalProfitEarned: number;
        compoundedValue: number;
        profitMode: "TPM" | "EPS";
        status: string;
        cyclesCompleted: number;
        insuranceCertificateNumber: string;
        insuranceStatus: string;
        commodityType: string;
        commodityQuantity: number;
        commodityUnit: string;
        purchasedAt: string;
        activatedAt?: string;
    };
    gdc: {
        gdcId: string;
        gdcNumber: number;
        currentFill: number;
        capacity: number;
        status: string;
        cyclesCompleted: number;
        totalProfitGenerated: number;
        averageROI: number;
    };
    insurance: {
        certificateNumber: string;
        provider: string;
        coverageAmount: number;
        status: string;
        effectiveDate: string;
        expiryDate: string;
    };
    currentCycle?: {
        cycleId: string;
        cycleNumber: number;
        startDate: string;
        endDate: string;
        status: string;
        targetProfitRate: number;
    };
}

export default function TPIADetailsPage() {
    const router = useRouter();
    const params = useParams();
    const tpiaId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<TPIADetails | null>(null);
    const [switchingMode, setSwitchingMode] = useState(false);
    const [error, setError] = useState("");

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
                setDetails(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching TPIA details:", err);
            setError(err.message || translate("gdip.details.error.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchProfitMode = async () => {
        if (!details) return;

        const newMode = details.tpia.profitMode === "TPM" ? "EPS" : "TPM";

        try {
            setSwitchingMode(true);
            const response = await apiPut<{ success: boolean; message: string; data: any }>(
                `/api/v1/gdip/tpia/${tpiaId}/profit-mode`,
                { profitMode: newMode }
            );

            if (response.success) {
                await fetchDetails(); // Refresh data
            }
        } catch (err: any) {
            console.error("Error switching profit mode:", err);
            alert(err.message || translate("gdip.details.error.switchMode"));
        } finally {
            setSwitchingMode(false);
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
            month: "long",
            day: "numeric",
        });
    };

    const calculateROI = () => {
        if (!details) return 0;
        const totalProfit = details.tpia.totalProfitEarned + calculateEstimatedProfit();
        return ((totalProfit / details.tpia.purchasePrice) * 100).toFixed(2);
    };
    const isCycleActive = () => details?.currentCycle?.status === "active";
    const calculateCycleProgress = () => {
        if (!details || !details.currentCycle || !isCycleActive()) return 0;
        const start = new Date(details.currentCycle.startDate).getTime();
        const end = new Date(details.currentCycle.endDate).getTime();
        const now = Date.now();
        if (now <= start) return 0;
        if (now >= end || details.currentCycle.status === "completed" || details.currentCycle.status === "processing") return 100;
        const progress = ((now - start) / (end - start)) * 100;
        return Math.min(100, Math.max(0, progress));
    };
    const calculateEstimatedProfit = () => {
        if (!details || !details.currentCycle || !isCycleActive()) return 0;
        const progress = calculateCycleProgress() / 100;
        const totalTarget = (details.currentCycle.targetProfitRate / 100) * details.tpia.purchasePrice;
        return totalTarget * progress;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !details) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">{translate("gdip.details.error.title")}</h2>
                    <p className="text-gray-600 mb-4">{error || translate("gdip.details.error.notFound")}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        {translate("gdip.details.error.goBack")}
                    </button>
                </div>
            </div>
        );
    }

    const { tpia, gdc, insurance, currentCycle } = details;
    const cycleTitle = currentCycle?.status === "active"
        ? translate("gdip.details.cycle.title")
        : currentCycle?.status === "scheduled"
            ? translate("gdip.details.cycle.scheduledTitle")
            : currentCycle
                ? translate("gdip.details.cycle.updateTitle")
                : translate("gdip.details.cycle.formationTitle");
    const cycleSubtitle = currentCycle?.status === "active"
        ? translate("gdip.details.cycle.subtitle")
        : currentCycle?.status === "scheduled"
            ? translate("gdip.details.cycle.scheduledSubtitle")
            : currentCycle
                ? translate("gdip.details.cycle.updateSubtitle")
                : translate("gdip.details.cycle.formationSubtitle");

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-8 overflow-hidden">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-xs uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {translate("gdip.details.backToPortfolio")}
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase">
                                    {tpia.tpiaId}
                                </h1>
                                <span
                                    className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] ${tpia.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : tpia.status === "pending"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                                >
                                    {translate("gdip.status." + tpia.status)}
                                </span>
                            </div>
                            <p className="text-gray-500 font-medium sm:text-lg">
                                {translate("gdip.details.tpiaTitle")}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 hidden sm:block">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{translate("gdip.details.ownershipLabel")}</p>
                                <p className="text-sm font-black text-gray-900">{tpia.partnerName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Financial Overview */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{translate("gdip.details.financial.title")}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.details.financial.subtitle")}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-gray-50 p-4 sm:p-5 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 leading-none">{translate("gdip.details.financial.cost")}</p>
                                    <p className="text-lg sm:text-2xl font-black text-gray-900 leading-none">
                                        {formatCurrency(tpia.purchasePrice)}
                                    </p>
                                </div>
                                <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-3xl border border-emerald-100">
                                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1.5 leading-none">{translate("gdip.details.financial.value")}</p>
                                    <p className="text-lg sm:text-2xl font-black text-emerald-600 leading-none">
                                        {formatCurrency(tpia.currentValue)}
                                    </p>
                                </div>
                                <div className="bg-indigo-50/50 p-4 sm:p-5 rounded-3xl border border-indigo-100">
                                    <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest mb-1.5 leading-none">{translate("gdip.details.financial.accrued")}</p>
                                    <p className="text-lg sm:text-2xl font-black text-indigo-600 leading-none">
                                        +{formatCurrency(tpia.totalProfitEarned + calculateEstimatedProfit())}
                                    </p>
                                </div>
                                <div className="bg-purple-50/50 p-4 sm:p-5 rounded-3xl border border-purple-100">
                                    <p className="text-[10px] font-bold text-purple-600/70 uppercase tracking-widest mb-1.5 leading-none">{translate("gdip.details.financial.roi")}</p>
                                    <p className="text-lg sm:text-2xl font-black text-purple-600 leading-none whitespace-nowrap">
                                        {calculateROI()}<span className="text-sm font-bold opacity-50">%</span>
                                    </p>
                                </div>
                                {tpia.profitMode === "TPM" && (
                                    <div className="col-span-2 bg-slate-900 p-5 rounded-3xl text-white">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">{translate("gdip.details.financial.compoundedExit")}</p>
                                                <p className="text-2xl font-black leading-none">{formatCurrency(tpia.compoundedValue)}</p>
                                            </div>
                                            <div className="p-2 bg-white/10 rounded-xl">
                                                <Activity className="w-6 h-6 text-purple-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>



                        {/* Trade Cycle */}
                        {currentCycle ? (
                            <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{cycleTitle}</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cycleSubtitle}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${currentCycle.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"}`}>
                                        {currentCycle.status} #{currentCycle.cycleNumber}
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.details.cycle.openDate")}</p>
                                            <p className="text-xs sm:text-sm font-black text-gray-900">{formatDate(currentCycle.startDate)}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.details.cycle.projectedClose")}</p>
                                            <p className="text-xs sm:text-sm font-black text-gray-900">{formatDate(currentCycle.endDate)}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <div className="flex justify-between items-end mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{translate("gdip.details.cycle.targetLabel")}</p>
                                                <p className="text-2xl font-black text-gray-900">{currentCycle.targetProfitRate}<span className="text-sm font-bold opacity-30">%</span></p>
                                            </div>
                                            <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
                                                {isCycleActive() ? translate("gdip.details.cycle.progress", { progress: calculateCycleProgress().toFixed(1) }) : translate("gdip.common.notAccruingYet")}
                                            </p>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                style={{ width: `${calculateCycleProgress()}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{translate("gdip.details.cycle.durationLabel")}</p>
                                            <p className="text-sm font-black text-gray-900 leading-none">{translate("gdip.details.cycle.durationValue", { days: Math.floor((calculateCycleProgress() / 100) * 37) })}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">{translate("gdip.details.cycle.accruedProfit")}</p>
                                            {isCycleActive() ? (
                                                <p className="text-lg font-black text-blue-700 leading-none">+{formatCurrency(calculateEstimatedProfit())}</p>
                                            ) : (
                                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{translate("gdip.dashboard.tpiaCard.startsAfterActivation")}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-amber-100 p-5 sm:p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{cycleTitle}</h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cycleSubtitle}</p>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                                    <p className="text-sm font-bold text-amber-800">
                                        {translate("gdip.details.cycle.formationDescription", { number: gdc.gdcNumber, current: gdc.capacity, total: gdc.capacity })}
                                    </p>
                                    <div className="mt-4 h-3 bg-white rounded-full overflow-hidden p-0.5 border border-amber-100">
                                        <div
                                            className="h-full rounded-full bg-amber-500"
                                            style={{ width: `${Math.min(100, Math.max(0, (gdc.currentFill / gdc.capacity) * 100))}%` }}
                                        />
                                    </div>
                                    <div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-700">
                                        <span>{translate("gdip.details.cycle.slotsFilled", { current: gdc.currentFill, total: gdc.capacity })}</span>
                                        <span>{translate("gdip.details.cycle.remaining", { count: Math.max(0, gdc.capacity - gdc.currentFill) })}</span>
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profit Mode Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                                    <CircleDollarSign className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-lg text-gray-900 tracking-tight">{translate("gdip.details.profitMode.title")}</h3>
                            </div>
                            <div className="mb-6">
                                <div
                                    className={`p-5 rounded-2xl border ${tpia.profitMode === "TPM"
                                        ? "border-purple-200 bg-purple-50/50"
                                        : "border-blue-200 bg-blue-50/50"
                                        } transition-colors group relative overflow-hidden`}
                                >
                                    <div className="flex items-center justify-between mb-3 relative z-10">
                                        <h4 className="font-black text-2xl tracking-tighter text-gray-900 leading-none">{tpia.profitMode}</h4>
                                        <span
                                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${tpia.profitMode === "TPM"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {tpia.profitMode === "TPM" ? translate("gdip.details.profitMode.compoundBadge") : translate("gdip.details.profitMode.withdrawalBadge")}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 leading-relaxed mb-1 relative z-10">
                                        {tpia.profitMode === "TPM"
                                            ? translate("gdip.details.profitMode.compoundDesc")
                                            : translate("gdip.details.profitMode.withdrawalDesc")}
                                    </p>
                                    <div className={`absolute bottom-[-20%] right-[-10%] opacity-[0.03] rotate-12 transition-transform group-hover:scale-110 pointer-events-none`}>
                                        <CircleDollarSign className="w-24 h-24" />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleSwitchProfitMode}
                                disabled={switchingMode}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                {switchingMode ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {translate("gdip.details.profitMode.switchButton", { mode: tpia.profitMode === "TPM" ? "EPS" : "TPM" })}
                                        <Activity size={14} className="opacity-50 group-hover:animate-pulse" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Insurance Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform pointer-events-none">
                                <ShieldCheck className="w-20 h-20 text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-lg text-gray-900 tracking-tight">{translate("gdip.details.insurance.title")}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 leading-none">{translate("gdip.details.insurance.certLabel")}</p>
                                    <p className="font-mono text-[10px] text-gray-900 font-bold bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm">{insurance.certificateNumber}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.details.insurance.provider")}</p>
                                        <p className="text-xs font-black text-gray-900">{translate("gdip.details.insurance.providers." + insurance?.provider) || insurance?.provider}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.details.insurance.statusLabel")}</p>
                                        <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-md">
                                            {translate("gdip.status." + insurance.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
                                    <button
                                        onClick={() => router.push(`/gdip/tpia/${tpiaId}/invoice`)}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        {translate("gdip.details.insurance.invoiceButton")}
                                    </button>
                                    <button
                                        onClick={() => router.push(`/gdip/tpia/${tpiaId}/certificate`)}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        {translate("gdip.details.insurance.certButton")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* GDC Assignment */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                    <Box className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-lg text-gray-900 tracking-tight">{translate("gdip.details.node.title")}</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.details.node.ref")}</span>
                                    <span className="text-xs font-black text-gray-900">{gdc.gdcId}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.details.node.posLabel")}</span>
                                    <span className="text-xs font-black text-gray-900">{translate("gdip.details.node.posValue", { pos: tpia.positionInGDC, total: gdc.capacity })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.details.node.commodity")}</span>
                                    <span className="text-xs font-black text-gray-900 flex items-center gap-1.5 truncate ml-4">
                                        {translate("gdip.details.node.defaultCommodity")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
