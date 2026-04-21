"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/utils/api";
import {
    Plus,
    Minus,
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    Trophy,
    Check,
    AlertCircle,
    ExternalLink,
    Activity
} from "lucide-react";
import { translate } from "@/utils/translate";

export default function PurchaseTPIAPage() {
    const router = useRouter();
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profitMode, setProfitMode] = useState<"TPM" | "EPS">("TPM");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [formingGDC, setFormingGDC] = useState<any>(null);

    const TPIA_PRICE = 1000000; // ₦1,000,000
    const totalPrice = TPIA_PRICE * quantity;

    const formatCurrency = (amount: number, minimumFractionDigits = 0) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits,
            maximumFractionDigits: minimumFractionDigits,
        }).format(amount);
    };

    useEffect(() => {
        fetchWalletBalance();
        fetchGDCStatus();
    }, []);

    const fetchGDCStatus = async () => {
        try {
            const response = await apiGet<{ success: boolean; data: any }>("/api/v1/gdip/forming-gdc");
            if (response.success && response.data) {
                setFormingGDC(response.data);
            }
        } catch (err) {
            console.error("Error fetching GDC status:", err);
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

    const handlePurchase = async () => {
        // Check wallet balance
        if (walletBalance < totalPrice) {
            setShowTopUpModal(true);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await apiPost<{ success: boolean; message: string; data: any }>(
                "/api/v1/gdip/tpia/purchase",
                {
                    profitMode,
                    purchasePrice: TPIA_PRICE,
                    quantity,
                }
            );

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/gdip");
                }, 2000);
            }
        } catch (err: any) {
            console.error("Error purchasing TPIA:", err);
            setError(err.message || translate("gdip.purchase.error.general"));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{translate("gdip.purchase.success.title")}</h2>
                    <p className="text-gray-600 mb-6">{translate("gdip.purchase.success.subtitle")}</p>
                    <p className="text-sm text-gray-500">{translate("gdip.purchase.success.redirecting")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-xs uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {translate("gdip.purchase.backToDashboard")}
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase mb-2">
                        {translate("gdip.purchase.title")}
                    </h1>
                    <p className="text-gray-500 font-medium sm:text-lg">
                        {translate("gdip.purchase.subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Purchase Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{translate("gdip.purchase.config.title")}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.purchase.config.subtitle")}</p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-sm font-bold">{error}</p>
                                </div>
                            )}

                            {/* Trade Deployment */}
                            <div className="mb-10">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    {translate("gdip.purchase.config.commodityLabel")}
                                </label>
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-white p-2 text-emerald-600 shadow-sm">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-bold leading-relaxed text-emerald-800">
                                            {translate("gdip.purchase.config.commodityInfo")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Profit Mode Selection */}
                            <div className="mb-10">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    {translate("gdip.purchase.config.modeLabel")}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* TPM Mode */}
                                    <button
                                        onClick={() => setProfitMode("TPM")}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group active:scale-[0.98] ${profitMode === "TPM"
                                            ? "border-purple-600 bg-purple-50/50 shadow-lg shadow-purple-100"
                                            : "border-gray-100 hover:border-purple-200 bg-white"
                                            }`}
                                    >
                                        <div className="flex flex-col items-start gap-2 mb-4 relative z-10 min-w-0">
                                            <h3 className="font-black text-2xl tracking-normal text-gray-900">{translate("gdip.purchase.config.modes.TPM.title")}</h3>
                                            <span className={`max-w-full px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-normal leading-tight break-words ${profitMode === "TPM" ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700"}`}>
                                                {translate("gdip.purchase.config.modes.TPM.badge")}
                                            </span>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-bold text-purple-600/70 uppercase tracking-widest mb-1.5 leading-none">{translate("gdip.purchase.config.modes.TPM.descriptionLabel")}</p>
                                            <p className="text-xs font-medium text-gray-500 leading-relaxed">
                                                {translate("gdip.purchase.config.modes.TPM.description")}
                                            </p>
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform">
                                            <Trophy className="w-24 h-24" />
                                        </div>
                                    </button>

                                    {/* EPS Mode */}
                                    <button
                                        onClick={() => setProfitMode("EPS")}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group active:scale-[0.98] ${profitMode === "EPS"
                                            ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100"
                                            : "border-gray-100 hover:border-indigo-200 bg-white"
                                            }`}
                                    >
                                        <div className="flex flex-col items-start gap-2 mb-4 relative z-10 min-w-0">
                                            <h3 className="font-black text-2xl tracking-normal text-gray-900">{translate("gdip.purchase.config.modes.EPS.title")}</h3>
                                            <span className={`max-w-full px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-normal leading-tight break-words ${profitMode === "EPS" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                                                {translate("gdip.purchase.config.modes.EPS.badge")}
                                            </span>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest mb-1.5 leading-none">{translate("gdip.purchase.config.modes.EPS.descriptionLabel")}</p>
                                            <p className="text-xs font-medium text-gray-500 leading-relaxed">
                                                {translate("gdip.purchase.config.modes.EPS.description")}
                                            </p>
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform">
                                            <CheckCircle2 className="w-24 h-24" />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Quantity Selection */}
                            <div className="mb-10">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    {translate("gdip.purchase.config.quantityLabel")}
                                </label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center bg-gray-50 rounded-2xl p-2 border border-gray-100 w-full md:w-fit self-center sm:self-start">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-gray-400 hover:text-gray-900"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <div className="px-10 text-center">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 leading-none">{translate("gdip.purchase.config.blockCount")}</p>
                                            <p className="text-3xl font-black text-gray-900 leading-none">{quantity}</p>
                                        </div>
                                        <button
                                            onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-gray-400 hover:text-gray-900"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                                        <button
                                            onClick={() => setQuantity(1)}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${quantity === 1 ? "bg-gray-900 text-white shadow-lg shadow-gray-200" : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"}`}
                                        >
                                            {translate("gdip.purchase.config.quantityOptions.single")}
                                        </button>
                                        {formingGDC && (formingGDC.capacity - formingGDC.currentFill) > 0 && (
                                            <button
                                                onClick={() => setQuantity(formingGDC.capacity - formingGDC.currentFill)}
                                                className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center ${quantity === (formingGDC.capacity - formingGDC.currentFill) ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"}`}
                                            >
                                                {translate("gdip.purchase.config.quantityOptions.completeCluster", { count: formingGDC.capacity - formingGDC.currentFill })}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setQuantity(10)}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center ${quantity === 10 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"}`}
                                        >
                                            <Trophy size={14} /> {translate("gdip.purchase.config.quantityOptions.fullNode", { count: 10 })}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* GDC Status */}
                            {formingGDC && (
                                <div className="mb-10 p-6 bg-slate-900 rounded-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform pointer-events-none">
                                        <Activity className="w-20 h-20 text-white" />
                                    </div>
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{translate("gdip.purchase.gdc.statusLabel")}</p>
                                            <p className="text-xl font-black text-white tracking-tight">{translate("gdip.purchase.gdc.nodeLabel", { number: formingGDC.gdcNumber })}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white leading-none">{(formingGDC.currentFill / formingGDC.capacity * 100).toFixed(0)}%</p>
                                            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{translate("gdip.purchase.gdc.velocity")}</p>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5 mb-4 relative z-10">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                                            style={{ width: `${(formingGDC.currentFill / formingGDC.capacity) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 relative z-10">
                                        <span>{translate("gdip.purchase.gdc.slotsLocked", { current: formingGDC.currentFill, total: formingGDC.capacity })}</span>
                                        <span className="text-emerald-400">{translate("gdip.purchase.gdc.slotsRemaining", { count: formingGDC.capacity - formingGDC.currentFill })}</span>
                                    </div>
                                </div>
                            )}

                            {/* Purchase Button */}
                            <button
                                onClick={handlePurchase}
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-2xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-3 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {translate("gdip.purchase.button")} <ArrowLeft size={16} className="rotate-180 opacity-50 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-6">
                            <h3 className="font-black text-xl text-gray-900 tracking-tight mb-6">{translate("gdip.purchase.summary.title")}</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.purchase.summary.selectedUnits")}</span>
                                    <span className="text-sm font-black text-gray-900">{translate("gdip.purchase.summary.unitsCount", { count: quantity })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.purchase.summary.baseValue")}</span>
                                    <span className="text-sm font-black text-gray-900">{formatCurrency(TPIA_PRICE)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 pt-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.purchase.summary.total")}</span>
                                    <span className="text-xl font-black text-gray-900">{formatCurrency(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 mt-4">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{translate("gdip.purchase.summary.walletCredits")}</span>
                                    <span className={`text-sm font-black ${walletBalance >= totalPrice ? "text-emerald-600" : "text-red-600"}`}>
                                        {formatCurrency(walletBalance)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4">{translate("gdip.purchase.summary.protectionsTitle")}</h4>
                                <ul className="space-y-3">
                                    {[
                                        translate("gdip.purchase.summary.protections.insurance"),
                                        translate("gdip.purchase.summary.protections.commodity"),
                                        translate("gdip.purchase.summary.protections.node"),
                                        translate("gdip.purchase.summary.protections.compounding"),
                                        translate("gdip.purchase.summary.protections.preservation")
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-gray-500">
                                            <div className="mt-0.5 p-0.5 bg-emerald-50 rounded text-emerald-600">
                                                <Check size={10} />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insufficient Funds Modal */}
                {showTopUpModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{translate("gdip.purchase.modal.title")}</h3>
                            <p className="text-center text-gray-600 mb-6">
                                {translate("gdip.purchase.modal.subtitle")}
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 mt-2 space-y-4 border border-gray-100">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-400 uppercase tracking-widest">{translate("gdip.purchase.modal.required")}</span>
                                    <span className="text-gray-900">{formatCurrency(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-400 uppercase tracking-widest">{translate("gdip.purchase.modal.current")}</span>
                                    <span className="text-gray-900">{formatCurrency(walletBalance)}</span>
                                </div>
                                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{translate("gdip.purchase.modal.gap")}</span>
                                    <span className="text-lg font-black text-red-600">{formatCurrency(totalPrice - walletBalance)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    {translate("gdip.purchase.modal.cancel")}
                                </button>
                                <button
                                    onClick={() => router.push("/profile/wallet")}
                                    className="px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                                >
                                    {translate("gdip.purchase.modal.topUp")} <ExternalLink size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
