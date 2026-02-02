"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/utils/api";
import { DollarSign, TrendingUp, Clock, CheckCircle2, ChevronRight, Award, AlertTriangle } from "lucide-react";
import { toast } from "@/components/common/Toast";
import { translate } from "@/utils/translate";
import Modal from "@/components/common/Modal";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";

interface CommissionSummary {
    totalEarned: number;
    pending: number;
    approved: number;
    payoutPending: number;
    rejected: number;
    byType: {
        registration: number;
        purchase: number;
        bonus: number;
    };
    totalCommissions: number;
}

export default function CommissionWidget() {
    const router = useRouter();
    const [summary, setSummary] = useState<CommissionSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAgent, setIsAgent] = useState(false);

    useEffect(() => {
        checkIfAgent();
    }, []);

    const checkIfAgent = async () => {
        try {
            // Try to fetch commission summary - if it works, user is an agent
            const response = await apiGet<{ status: string; data: CommissionSummary }>(
                "/api/v1/commissions/summary"
            );
            setSummary(response.data);
            setIsAgent(true);
        } catch (error) {
            // Not an agent or error fetching
            setIsAgent(false);
        } finally {
            setIsLoading(false);
        }
    };

    const [isPayoutLoading, setIsPayoutLoading] = useState(false);
    const [showBankErrorModal, setShowBankErrorModal] = useState(false);

    const handleRequestPayout = async () => {
        if (!summary || summary.approved < 100000) return;

        try {
            setIsPayoutLoading(true);
            await apiPost("/api/v1/commissions/request-payout", {});

            // Refresh summary
            // Assuming toast is available globally or I should import it
            toast(translate("wallet.toasts.payoutSuccess"), "success");
            const summaryRes = await apiGet('/api/v1/commissions/summary') as { data: CommissionSummary };
            setSummary(summaryRes.data);
        } catch (err: any) {
            console.error("Payout request failed:", err);
            const msg = (err.message || "").toLowerCase();
            const apiMsg = (err.response?.data?.message || "").toLowerCase();

            if (msg.includes("bank details") || apiMsg.includes("bank details")) {
                setShowBankErrorModal(true);
            } else {
                const errorMessage = err.response?.data?.message || err.message || translate("wallet.toasts.payoutError");
                toast(errorMessage, "error");
            }
        } finally {
            setIsPayoutLoading(false);
        }
    };


    if (isLoading || !isAgent || !summary) {
        return null; // Don't show anything if not an agent
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-lg">
                        <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {translate("wallet.commission.title")}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {translate("wallet.commission.subtitle")}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => router.push("/agent/dashboard")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                    {translate("wallet.commission.dashboard")}
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Earned */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {translate("wallet.commission.totalEarned")}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₦{formatCurrency(summary.totalEarned)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {translate("wallet.commission.commissionsCount", { count: summary.totalCommissions })}
                    </p>
                </div>

                {/* Pending */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {translate("wallet.commission.pending")}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        ₦{formatCurrency(summary.pending)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {translate("wallet.commission.awaiting")}
                    </p>
                </div>

                {/* Approved */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {translate("wallet.commission.approved")}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₦{formatCurrency(summary.approved)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {translate("wallet.commission.ready")}
                    </p>

                    {summary.payoutPending > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 py-1 px-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-100 dark:border-orange-800">
                            <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                            <span className="text-[10px] font-medium text-orange-700 dark:text-orange-300">
                                {translate("wallet.commission.payoutPending", { amount: `₦${formatCurrency(summary.payoutPending)}` })}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleRequestPayout}
                        disabled={summary.approved < 100000 || isPayoutLoading}
                        className={`mt-4 w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${summary.approved >= 100000
                            ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md transform active:scale-[0.98]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                            }`}
                    >
                        {isPayoutLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <DollarSign className="w-4 h-4" />
                        )}
                        {translate("wallet.commission.requestPayout")}
                    </button>
                </div>
            </div>

            {/* Commission Breakdown */}
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
                    {translate("wallet.commission.breakdown")}
                </p>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            {translate("wallet.commission.registration")}
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ₦{formatCurrency(summary.byType.registration)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            {translate("wallet.commission.purchase")}
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ₦{formatCurrency(summary.byType.purchase)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                            {translate("wallet.commission.bonus")}
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ₦{formatCurrency(summary.byType.bonus)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 flex gap-2">
                <button
                    onClick={() => router.push("/agent/referrals")}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-sm border border-gray-200 dark:border-gray-700"
                >
                    {translate("wallet.commission.viewReferrals")}
                </button>
                <button
                    onClick={() => router.push("/agent/commissions")}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-sm border border-gray-200 dark:border-gray-700"
                >
                    {translate("wallet.commission.history")}
                </button>
            </div>
            {/* Bank details missing modal */}
            <Modal
                open={showBankErrorModal}
                onClose={() => setShowBankErrorModal(false)}
                title={<span className="flex items-center gap-2 text-orange-600"><AlertTriangle size={18} /> {translate("wallet.commission.bankMissing.title")}</span>}
                size="sm"
                footer={(
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setShowBankErrorModal(false)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                        >
                            {translate("wallet.commission.bankMissing.cancel")}
                        </button>
                        <Link
                            href="/profile#bank-account"
                            onClick={() => setShowBankErrorModal(false)}
                            className="flex-1 px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                        >
                            {translate("wallet.commission.bankMissing.update")}
                        </Link>
                    </div>
                )}
            >
                <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {translate("wallet.commission.bankMissing.desc")}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {translate("wallet.commission.bankMissing.instruction")}
                    </p>
                </div>
            </Modal>
        </div>
    );
}
