"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import { apiGet, apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { formatCurrency } from "@/utils/format";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    ShieldOff,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    FileText,
    Plus,
    Minus,
    CreditCard,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    StickyNote
} from "lucide-react";

interface WalletDetailsModalProps {
    open: boolean;
    onClose: () => void;
    walletId: string;
    onRefresh?: () => void;
}

interface WalletDetails {
    wallet: {
        _id: string;
        userId: any;
        type: string;
        currency: string;
        balance: number;
        frozenBalance: number;
        totalDeposited: number;
        totalWithdrawn: number;
        totalSpent: number;
        totalEarned: number;
        creditLimit: number;
        creditUsed: number;
        availableCredit: number;
        status: string;
        frozenAt?: string;
        unfrozenAt?: string;
        freezeReason?: string;
        unfreezeReason?: string;
        adminNotes?: string;
        createdAt: string;
        updatedAt: string;
    };
    recentTransactions: any[];
    freezeHistory: any[];
    statistics: {
        totalTransactions: number;
        totalDeposits: number;
        totalWithdrawals: number;
        totalPayments: number;
        averageTransactionAmount: number;
    };
}

export default function WalletDetailsModal({
    open,
    onClose,
    walletId,
    onRefresh
}: WalletDetailsModalProps) {
    const [details, setDetails] = useState<WalletDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
    const [showBalance, setShowBalance] = useState(true);

    // Balance adjustment state
    const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">("credit");
    const [adjustmentAmount, setAdjustmentAmount] = useState("");
    const [adjustmentReason, setAdjustmentReason] = useState("");
    const [isAdjusting, setIsAdjusting] = useState(false);

    // Credit limit state
    const [newCreditLimit, setNewCreditLimit] = useState("");
    const [creditReason, setCreditReason] = useState("");
    const [isUpdatingCredit, setIsUpdatingCredit] = useState(false);

    // Admin notes state
    const [newNote, setNewNote] = useState("");
    const [isAddingNote, setIsAddingNote] = useState(false);

    // Unfreeze funds state
    const [unfreezeAmount, setUnfreezeAmount] = useState("");
    const [unfreezeReason, setUnfreezeReason] = useState("");
    const [isUnfreezing, setIsUnfreezing] = useState(false);

    useEffect(() => {
        if (open && walletId) {
            loadWalletDetails();
        }
    }, [open, walletId]);

    const loadWalletDetails = async () => {
        try {
            setIsLoading(true);
            const response = await apiGet(`/api/v1/wallets/admin/${walletId}/details`) as { data?: WalletDetails };
            if (response.data) {
                setDetails(response.data);
            }
        } catch (error) {
            console.error("Error loading wallet details:", error);
            toast("Failed to load wallet details", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdjustBalance = async () => {
        try {
            if (!adjustmentAmount || parseFloat(adjustmentAmount) <= 0) {
                toast("Please enter a valid amount", "error");
                return;
            }

            if (!adjustmentReason.trim()) {
                toast("Please provide a reason for the adjustment", "error");
                return;
            }

            setIsAdjusting(true);

            // Apply sign based on type
            const amount = parseFloat(adjustmentAmount);
            const finalAmount = adjustmentType === "debit" ? -amount : amount;

            await apiPost(`/api/v1/wallets/admin/${walletId}/adjust-balance`, {
                amount: finalAmount,
                reason: adjustmentReason
            });

            toast(`Wallet ${adjustmentType === "credit" ? "credited" : "debited"} successfully`, "success");
            setShowBalanceModal(false);
            setAdjustmentAmount("");
            setAdjustmentReason("");
            await loadWalletDetails();
            onRefresh?.();
        } catch (error) {
            console.error("Error adjusting balance:", error);
            toast("Failed to adjust balance", "error");
        } finally {
            setIsAdjusting(false);
        }
    };

    const handleUpdateCreditLimit = async () => {
        try {
            if (!newCreditLimit || parseFloat(newCreditLimit) < 0) {
                toast("Please enter a valid credit limit", "error");
                return;
            }

            if (!creditReason.trim()) {
                toast("Please provide a reason for the credit limit change", "error");
                return;
            }

            setIsUpdatingCredit(true);

            // Use Naira directly
            const limit = parseFloat(newCreditLimit);

            await apiPost(`/api/v1/wallets/${details?.wallet.userId._id}/credit-limit`, {
                creditLimit: limit,
                reason: creditReason
            });

            toast("Credit limit updated successfully", "success");
            setShowCreditModal(false);
            setNewCreditLimit("");
            setCreditReason("");
            await loadWalletDetails();
            onRefresh?.();
        } catch (error) {
            console.error("Error updating credit limit:", error);
            toast("Failed to update credit limit", "error");
        } finally {
            setIsUpdatingCredit(false);
        }
    };

    const handleAddNote = async () => {
        try {
            if (!newNote.trim()) {
                toast("Please enter a note", "error");
                return;
            }

            setIsAddingNote(true);

            await apiPost(`/api/v1/wallets/admin/${walletId}/notes`, {
                note: newNote
            });

            toast("Admin note added successfully", "success");
            setShowNotesModal(false);
            setNewNote("");
            await loadWalletDetails();
        } catch (error) {
            console.error("Error adding note:", error);
            toast("Failed to add note", "error");
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleUnfreezeFunds = async () => {
        try {
            if (!unfreezeAmount || parseFloat(unfreezeAmount) <= 0) {
                toast("Please enter a valid amount", "error");
                return;
            }

            const amountInNaira = parseFloat(unfreezeAmount);
            const frozenInNaira = details?.wallet.frozenBalance || 0;

            if (amountInNaira > frozenInNaira) {
                toast(`Cannot unfreeze more than frozen balance (₦${frozenInNaira.toLocaleString()})`, "error");
                return;
            }

            if (!unfreezeReason.trim()) {
                toast("Please provide a reason for unfreezing funds", "error");
                return;
            }

            setIsUnfreezing(true);

            // Use Naira directly
            await apiPost(`/api/v1/wallets/unfreeze`, {
                userId: details?.wallet.userId._id,
                amount: amountInNaira,
                currency: details?.wallet.currency || 'NGN',
                reason: unfreezeReason
            });

            toast("Funds unfrozen successfully", "success");
            setShowUnfreezeModal(false);
            setUnfreezeAmount("");
            setUnfreezeReason("");
            await loadWalletDetails();
            onRefresh?.();
        } catch (error) {
            console.error("Error unfreezing funds:", error);
            toast("Failed to unfreeze funds", "error");
        } finally {
            setIsUnfreezing(false);
        }
    };


    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            frozen: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            suspended: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
        };
        return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'top_up':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'withdrawal':
                return <TrendingDown className="w-4 h-4 text-red-600" />;
            case 'payment':
                return <DollarSign className="w-4 h-4 text-blue-600" />;
            case 'freeze':
            case 'unfreeze':
                return <Shield className="w-4 h-4 text-orange-600" />;
            case 'adjustment':
                return <FileText className="w-4 h-4 text-purple-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    if (!open) return null;

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                title="Wallet Details"
                size="lg"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : details ? (
                    <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                        {/* User Information */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                User Information
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {details.wallet.userId?.displayName || details.wallet.userId?.username || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{details.wallet.userId?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{details.wallet.userId?.phoneNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">KYC Status:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {details.wallet.userId?.kycStatus || 'Not Verified'} (Level {details.wallet.userId?.kycLevel || 0})
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Role:</span>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">{details.wallet.userId?.role || 'user'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Member Since:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {details.wallet.userId?.createdAt ? new Date(details.wallet.userId.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Statistics */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Wallet Statistics
                                </h3>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                    {showBalance ? 'Hide' : 'Show'} Amounts
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Available Balance</p>
                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                        {showBalance ? formatCurrency(details.wallet.balance, details.wallet.currency) : '••••••'}
                                    </p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Frozen Balance</p>
                                    <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                                        {showBalance ? formatCurrency(details.wallet.frozenBalance, details.wallet.currency) : '••••••'}
                                    </p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Deposited</p>
                                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                        {showBalance ? formatCurrency(details.wallet.totalDeposited, details.wallet.currency) : '••••••'}
                                    </p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">Total Withdrawn</p>
                                    <p className="text-lg font-bold text-red-700 dark:text-red-300">
                                        {showBalance ? formatCurrency(details.wallet.totalWithdrawn, details.wallet.currency) : '••••••'}
                                    </p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total Spent</p>
                                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                        {showBalance ? formatCurrency(details.wallet.totalSpent, details.wallet.currency) : '••••••'}
                                    </p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Credit Available</p>
                                    <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                                        {showBalance ? formatCurrency(details.wallet.availableCredit, details.wallet.currency) : '••••••'}
                                    </p>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                                        Limit: {showBalance ? formatCurrency(details.wallet.creditLimit, details.wallet.currency) : '••••••'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Status */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Status</h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(details.wallet.status)}`}>
                                    {details.wallet.status}
                                </span>
                                {details.wallet.status === 'frozen' && details.wallet.freezeReason && (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Reason: {details.wallet.freezeReason}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Recent Transactions ({details.recentTransactions.length})
                            </h3>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="max-h-64 overflow-y-auto">
                                    {details.recentTransactions.length > 0 ? (
                                        details.recentTransactions.map((tx) => (
                                            <div
                                                key={tx._id}
                                                className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getTransactionIcon(tx.type)}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                            {tx.description || tx.type}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(tx.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{tx.status}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            No transactions found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        {details.wallet.adminNotes && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <StickyNote className="w-4 h-4" />
                                    Admin Notes
                                </h3>
                                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                                    {details.wallet.adminNotes}
                                </pre>
                            </div>
                        )}

                        {/* Admin Actions */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Admin Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setShowBalanceModal(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Adjust Balance
                                </button>
                                <button
                                    onClick={() => {
                                        setNewCreditLimit(details.wallet.creditLimit.toString());
                                        setShowCreditModal(true);
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Set Credit Limit
                                </button>
                                {details.wallet.frozenBalance > 0 && (
                                    <button
                                        onClick={() => {
                                            setUnfreezeAmount((details.wallet.frozenBalance || 0).toString());
                                            setShowUnfreezeModal(true);
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                        <ShieldOff className="w-4 h-4" />
                                        Unfreeze Funds
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowNotesModal(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                                >
                                    <StickyNote className="w-4 h-4" />
                                    Add Note
                                </button>
                                <button
                                    onClick={() => toast("Export feature coming soon", "info")}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Export Data
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        Failed to load wallet details
                    </div>
                )}
            </Modal>

            {/* Balance Adjustment Modal */}
            <Modal
                open={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
                title="Adjust Wallet Balance"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Adjustment Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setAdjustmentType("credit")}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${adjustmentType === "credit"
                                    ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                <Plus className="w-4 h-4" />
                                Credit
                            </button>
                            <button
                                onClick={() => setAdjustmentType("debit")}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${adjustmentType === "debit"
                                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                <Minus className="w-4 h-4" />
                                Debit
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount (₦)
                        </label>
                        <input
                            type="number"
                            value={adjustmentAmount}
                            onChange={(e) => setAdjustmentAmount(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason
                        </label>
                        <textarea
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Explain the reason for this adjustment..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setShowBalanceModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={isAdjusting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdjustBalance}
                            disabled={isAdjusting}
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${adjustmentType === "credit" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            {isAdjusting ? "Processing..." : `${adjustmentType === "credit" ? "Credit" : "Debit"} Wallet`}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Credit Limit Modal */}
            <Modal
                open={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                title="Set Credit Limit"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Credit Limit (₦)
                        </label>
                        <input
                            type="number"
                            value={newCreditLimit}
                            onChange={(e) => setNewCreditLimit(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Current: {formatCurrency(details?.wallet.creditLimit || 0, details?.wallet.currency || 'NGN')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason
                        </label>
                        <textarea
                            value={creditReason}
                            onChange={(e) => setCreditReason(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Explain the reason for this credit limit change..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setShowCreditModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={isUpdatingCredit}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateCreditLimit}
                            disabled={isUpdatingCredit}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdatingCredit ? "Updating..." : "Update Limit"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Admin Notes Modal */}
            <Modal
                open={showNotesModal}
                onClose={() => setShowNotesModal(false)}
                title="Add Admin Note"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Note
                        </label>
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter internal note about this wallet..."
                            rows={4}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setShowNotesModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={isAddingNote}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddNote}
                            disabled={isAddingNote}
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAddingNote ? "Adding..." : "Add Note"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Unfreeze Funds Modal */}
            <Modal
                open={showUnfreezeModal}
                onClose={() => setShowUnfreezeModal(false)}
                title="Unfreeze Funds"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Current Frozen Balance:</strong> {formatCurrency(details?.wallet.frozenBalance || 0, details?.wallet.currency || 'NGN')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount to Unfreeze (₦)
                        </label>
                        <input
                            type="number"
                            value={unfreezeAmount}
                            onChange={(e) => setUnfreezeAmount(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                            min="0"
                            max={details?.wallet.frozenBalance || 0}
                            step="0.01"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Maximum: ₦{(details?.wallet.frozenBalance || 0).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason
                        </label>
                        <textarea
                            value={unfreezeReason}
                            onChange={(e) => setUnfreezeReason(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Explain the reason for unfreezing these funds..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => setShowUnfreezeModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={isUnfreezing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUnfreezeFunds}
                            disabled={isUnfreezing}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUnfreezing ? "Unfreezing..." : "Unfreeze Funds"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
