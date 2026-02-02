"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History as HistoryIcon,
  CreditCard,
  TrendingUp,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  User,
  DollarSign
} from "lucide-react";

import { RequireAuth } from "@/components/auth/Guards";
import { apiGet, apiPost, apiGetBlob } from "@/utils/api";
import { getUserId } from "@/utils/auth";
import Modal from "@/components/common/Modal";
import { toast } from "@/components/common/Toast";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import WithdrawalModal from "@/components/wallet/WithdrawalModal";
import WithdrawalHistory from "@/components/wallet/WithdrawalHistory";
import CreditRequestModal from "@/components/wallet/CreditRequestModal";
import TopUpModal from "@/components/wallet/TopUpModal";
import CommissionWidget from "@/components/wallet/CommissionWidget";
import { translate } from "@/utils/translate";
import { formatCurrency as globalFormatCurrency } from "@/utils/format";

// Interfaces
interface WalletBalance {
  available: number;
  frozen: number;
  total: number;
  currency: "ATH" | "NGN";
  creditLimit?: number;
  creditUsed?: number;
}

interface WalletSummary {
  ngnWallet: WalletBalance;
  totalValue: number;
}

interface Transaction {
  _id: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  reference: string;
  description: string;
  createdAt: string;
}

interface CreditRequest {
  _id: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  businessReason: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

function WalletPageContent() {
  const searchParams = useSearchParams();
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showCreditRequestModal, setShowCreditRequestModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals' | 'credit-requests'>('transactions');
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<any>(null);

  // Transaction states
  const [user, setUser] = useState<any>(null);
  const [transactionFilters, setTransactionFilters] = useState({
    search: "",
    currency: "all",
    transactionType: "all",
    status: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const [transactionSummary, setTransactionSummary] = useState({
    totalAmount: 0,
    depositCount: 0,
    withdrawalCount: 0,
    transferCount: 0,
    pendingCount: 0
  });

  const [showTransactionFilters, setShowTransactionFilters] = useState(false);
  const [transactionPagination, setTransactionPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportType, setExportType] = useState("all");
  const [exportCurrency, setExportCurrency] = useState("all");

  // Real-time wallet updates
  const { isConnected } = useRealTimeNotifications({
    onWalletBalanceUpdate: (data) => {
      if (walletSummary && data.currency === 'NGN') {
        setWalletSummary(prev => {
          if (!prev) return null;

          return {
            ...prev,
            ngnWallet: {
              available: data.available,
              frozen: data.frozen,
              total: data.total,
              currency: 'NGN'
            }
          };
        });
      }
    },
    onWalletTransactionUpdate: (data) => {
      // Add new transaction to the top of the list
      const newTransaction: Transaction = {
        _id: data.transactionId,
        type: data.type,
        category: data.type,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        reference: `TXN_${data.transactionId.slice(-8)}`,
        description: data.description,
        createdAt: data.createdAt.toISOString(),
        balanceBefore: 0, // Will be updated when we have the actual balance
        balanceAfter: 0   // Will be updated when we have the actual balance
      };

      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]); // Keep only 10 most recent

      // Show toast notification
      toast(`New ${data.type} transaction: ${data.description}`, "success");
    },
    onWalletStatusUpdate: (data) => {
      if (data.status === 'frozen') {
        toast(`Your wallet has been frozen: ${data.reason}`, "error");
      } else if (data.status === 'active') {
        toast("Your wallet has been unfrozen", "success");
      }
    }
  });

  // Load transactions with filters
  const loadTransactions = async (page = 1) => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });

      // Add filters to params
      Object.entries(transactionFilters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.append(key, value);
        }
      });

      const response = await apiGet(`/api/v1/wallets/transactions?${params}`) as {
        data?: {
          transactions?: Transaction[];
          total?: number;
          pages?: number;
          summary?: any;
        }
      };

      if (response.data) {
        setTransactions(response.data.transactions || []);
        setTransactionPagination({
          page,
          total: response.data.total || 0,
          pages: response.data.pages || 0
        });
        if (response.data.summary) {
          setTransactionSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast(translate("wallet.toasts.loadError"), "error");
    }
  };

  // Load credit requests
  const loadCreditRequests = async () => {
    try {
      const response = await apiGet("/api/v1/credit-requests/my-requests") as {
        data?: CreditRequest[]
      };

      if (response.data) {
        setCreditRequests(response.data);
      }
    } catch (error) {
      console.error("Error loading credit requests:", error);
      // Don't show error toast as this is not critical
    }
  };

  const fetchWalletData = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const summaryRes = await apiGet(`/api/v1/wallets/summary?userId=${userId}`) as {
        data?: WalletSummary
      };
      setWalletSummary(summaryRes.data || null);

      // Fetch user profile to check business type
      const userRes = await apiGet<{ status: string; data: any }>("/api/v1/users/me");
      setUser(userRes.data);

      // Fetch commission summary if user is a Sales Agent
      if (userRes.data?.businessInfo?.businessType === "Sales Agent") {
        try {
          const commRes = await apiGet<{ status: string; data: any }>("/api/v1/commissions/summary");
          setCommissionSummary(commRes.data);
        } catch (e) {
          console.error("Failed to fetch commission summary:", e);
        }
      }

    } catch (error: any) {
      console.error("Error loading wallet data:", error);
      if (error?.message?.includes("Wallet not found") || error?.message?.includes("not enabled")) {
        setWalletSummary(null);
      } else {
        toast(translate("wallet.toasts.walletDataError"), "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWalletData();
    // We can't easily call loadTransactions(1) here if it depends on state, 
    // but the other useEffect handles transaction loading on filter change.
    loadCreditRequests();
  }, []);

  // Reload transactions when filters change
  useEffect(() => {
    if (!isLoading) {
      loadTransactions(1);
    }
  }, [transactionFilters]);

  // Handle success message from URL parameters
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setShowSuccessMessage(true);
      toast(translate("wallet.toasts.topUpSuccess"), "success");

      // Refresh wallet data and transactions after successful top-up
      const refreshData = async () => {
        try {
          const userId = getUserId();
          if (!userId) return;

          // Load wallet summary
          const summaryRes = await apiGet(`/api/v1/wallets/summary?userId=${userId}`) as { data?: WalletSummary };
          setWalletSummary(summaryRes.data || null);

          // Load transactions with current filters
          await loadTransactions(1);
        } catch (error) {
          console.error("Error refreshing wallet data after top-up:", error);
        }
      };

      // Refresh data immediately and after a short delay to ensure transaction is committed
      refreshData();
      setTimeout(refreshData, 2000);

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);



  // Handle export transactions
  const handleExportTransactions = async () => {
    try {
      const query = {
        format: exportFormat,
        ...(exportStartDate && { startDate: exportStartDate }),
        ...(exportEndDate && { endDate: exportEndDate }),
        ...(exportType !== "all" && { type: exportType }),
        ...(exportCurrency !== "all" && { currency: exportCurrency })
      };

      const blob = await apiGetBlob(`/api/v1/wallets/export/transactions`, { query });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast(translate("wallet.toasts.exportSuccess"), "success");
      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      toast(translate("wallet.toasts.exportError"), "error");
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setTransactionFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setTransactionFilters({
      search: "",
      currency: "all",
      transactionType: "all",
      status: "all",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadTransactions(page);
  };

  // Format currency for wallet balance (backend already converts kobo to Naira)
  const formatWalletBalance = (amount: number, currencyCode: string) => {
    const formatted = globalFormatCurrency(amount);
    if (currencyCode === "NGN") return `₦${formatted}`;
    return `${formatted} ${currencyCode}`;
  };

  // Format currency for transactions (stored in Naira)
  const formatCurrency = (amount: number, currencyCode: string) => {
    const formatted = globalFormatCurrency(amount);
    if (currencyCode === "NGN") return `₦${formatted}`;
    return `${formatted} ${currencyCode}`;
  };

  // Get transaction icon
  const getTransactionIcon = (type: string, category?: string) => {
    // Special handling for vendor payments
    if (type === "deposit" && category === "vendor_payment") {
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    }

    switch (type) {
      case "deposit": return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case "withdrawal": return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case "payment": return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "refund": return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case "transfer": return <ArrowUpRight className="w-4 h-4 text-purple-500" />;
      case "earning": return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get transaction status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!walletSummary) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto mt-10">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{translate("wallet.notAvailableTitle")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {translate("wallet.notAvailableDesc")}
              </p>
              <Link href="/profile" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                {translate("wallet.returnProfile")}
              </Link>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                    {translate("wallet.successMessage.title")}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {translate("wallet.successMessage.desc")}
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {translate("wallet.title")}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {translate("wallet.subtitle")}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showBalance ? translate("wallet.balance.hide") : translate("wallet.balance.show")} {translate("wallet.balance.label")}
                </button>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          {walletSummary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
              {/* Total Balance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-3">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{translate("wallet.balance.total")}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white break-all">
                    {showBalance ? formatWalletBalance(walletSummary.ngnWallet.total, "NGN") : "••••••"}
                  </p>
                </div>
              </div>

              {/* Available Balance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{translate("wallet.balance.available")}</p>
                  <p className="text-lg font-bold text-green-600 break-all">
                    {showBalance ? formatWalletBalance(walletSummary.ngnWallet.available, "NGN") : "••••••"}
                  </p>
                </div>
              </div>

              {/* Frozen Balance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg mb-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{translate("wallet.balance.frozen")}</p>
                  <p className="text-lg font-bold text-orange-600 break-all">
                    {showBalance ? formatWalletBalance(walletSummary.ngnWallet.frozen, "NGN") : "••••"}
                  </p>
                </div>
              </div>

              {/* Available Credit */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg mb-3">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{translate("wallet.balance.credit")}</p>
                  <p className="text-lg font-bold text-purple-600 break-all">
                    {showBalance ? formatWalletBalance((walletSummary.ngnWallet.creditLimit || 0) - (walletSummary.ngnWallet.creditUsed || 0), "NGN") : "••••"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Commission Widget for Sales Agents */}
          <CommissionWidget />

          {/* Wallet Balance Card - Redesigned */}
          {walletSummary && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{translate("wallet.balance.label")}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{translate("wallet.balance.currency")}</p>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              {/* Main Balance */}
              <div className="px-6 py-8 text-center border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{translate("wallet.balance.available")}</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {showBalance ? formatWalletBalance(walletSummary.ngnWallet.available, "NGN") : "••••••"}
                </p>
                {walletSummary.ngnWallet.frozen > 0 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-3">
                    {showBalance ? formatWalletBalance(walletSummary.ngnWallet.frozen, "NGN") : "••••"} {translate("wallet.balance.frozen").toLowerCase()}
                  </p>
                )}
              </div>

              {/* Secondary Info Grid */}
              {(walletSummary.ngnWallet.creditLimit || 0) > 0 && (
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Credit Used */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{translate("wallet.balance.creditUsed")}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {showBalance ? formatWalletBalance(walletSummary.ngnWallet.creditUsed || 0, "NGN") : "••••"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {translate("wallet.balance.of")} {showBalance ? formatWalletBalance(walletSummary.ngnWallet.creditLimit || 0, "NGN") : "••••"}
                      </p>
                    </div>

                    {/* Available Credit */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">{translate("wallet.balance.credit")}</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {showBalance ? formatWalletBalance((walletSummary.ngnWallet.creditLimit || 0) - (walletSummary.ngnWallet.creditUsed || 0), "NGN") : "••••"}
                      </p>
                      {/* Progress Bar */}
                      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, ((walletSummary.ngnWallet.creditUsed || 0) / (walletSummary.ngnWallet.creditLimit || 1)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Distributor Rewards Card */}
          {user?.businessInfo?.businessType === "Distributor" && user?.businessInfo?.distributorStats && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{translate("wallet.distributor.title")}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{translate("wallet.distributor.subtitle")}</p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Next Reward Date */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{translate("wallet.distributor.nextDate")}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.businessInfo.distributorStats.nextRewardDate
                        ? new Date(user.businessInfo.distributorStats.nextRewardDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : translate("wallet.distributor.calculating")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {translate("wallet.distributor.desc")}
                    </p>
                  </div>

                  {/* Estimated Reward */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{translate("wallet.distributor.estimated")}</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {showBalance
                        ? formatWalletBalance(Math.floor((walletSummary?.ngnWallet.total || 0) * 0.02), "NGN")
                        : "••••••"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {translate("wallet.distributor.estimatedDesc", { percent: 2 })}
                    </p>
                  </div>

                  {/* Total Rewards Earned */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{translate("wallet.distributor.totalEarned")}</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {showBalance
                        ? formatWalletBalance(user.businessInfo.distributorStats.totalRewardsEarned || 0, "NGN")
                        : "••••••"}
                    </p>
                    {user.businessInfo.distributorStats.lastRewardDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {translate("wallet.distributor.lastReward", {
                          amount: formatWalletBalance(user.businessInfo.distributorStats.lastRewardAmount || 0, "NGN"),
                          date: new Date(user.businessInfo.distributorStats.lastRewardDate).toLocaleDateString()
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-8 gap-2 mb-6">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{translate("wallet.actions.topUp")}</span>
            </button>

            {user?.businessInfo?.businessType === "Sales Agent" && (() => {
              const thresholdMet = commissionSummary &&
                commissionSummary.approved >= 100000 &&
                commissionSummary.totalEarned >= 100000 &&
                (walletSummary?.ngnWallet?.available || 0) >= 100000;

              const getTitle = () => {
                if (!commissionSummary) return translate("common.loading");
                if (commissionSummary.approved < 100000) return translate("wallet.actions.withdrawThresholdApproved", { amount: "₦100,000" });
                if (commissionSummary.totalEarned < 100000) return translate("wallet.actions.withdrawThresholdTotal", { amount: "₦100,000" });
                if ((walletSummary?.ngnWallet?.available || 0) < 100000) return translate("wallet.actions.withdrawThresholdAvailable", { amount: "₦100,000" });
                return "";
              };

              return (
                <button
                  disabled={!thresholdMet}
                  onClick={() => setShowWithdrawalModal(true)}
                  className={`flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all group ${!thresholdMet
                    ? "opacity-50 cursor-not-allowed grayscale"
                    : "hover:shadow-lg"
                    }`}
                  title={getTitle()}
                >
                  <div className={`p-4 rounded-lg transition-colors ${!thresholdMet
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/40"
                    }`}>
                    <DollarSign className={`w-4 h-4 ${!thresholdMet ? "text-gray-400" : "text-red-600 dark:text-red-400"}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{translate("wallet.actions.withdraw")}</span>
                </button>
              );
            })()}

            <button
              onClick={() => setShowCreditRequestModal(true)}
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{translate("wallet.actions.requestCredit")}</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{translate("wallet.actions.export")}</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/40 transition-colors">
                <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{translate("wallet.actions.refresh")}</span>
            </button>

            <Link
              href="/profile/wallet/analytics"
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="p-4 bg-teal-100 dark:bg-teal-900/30 rounded-lg group-hover:bg-teal-200 dark:group-hover:bg-teal-800/40 transition-colors">
                <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{translate("wallet.actions.analytics")}</span>
            </Link>

            <button
              onClick={() => setActiveTab('transactions')}
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-lg group-hover:bg-pink-200 dark:group-hover:bg-pink-800/40 transition-colors">
                <HistoryIcon className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{translate("wallet.actions.history")}</span>
            </button>

            <button
              onClick={() => window.location.href = '/profile'}
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{translate("wallet.actions.settings")}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'transactions'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                {translate("wallet.tabs.transactions")}
                {activeTab === 'transactions' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                )}
              </button>
              {user?.businessInfo?.businessType === "Sales Agent" && (
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'withdrawals'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                  {translate("wallet.tabs.withdrawals")}
                  {activeTab === 'withdrawals' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab('credit-requests')}
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'credit-requests'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                {translate("wallet.tabs.creditRequests")}
                {activeTab === 'credit-requests' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'transactions' ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 text-gray-500" />
                    {translate("wallet.transactions.title")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {translate("wallet.transactions.subtitle")}
                  </p>
                </div>
                <button
                  onClick={() => setShowTransactionFilters(!showTransactionFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showTransactionFilters
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  {translate("wallet.transactions.filters.title")}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTransactionFilters ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Filters */}
              {showTransactionFilters && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {translate("wallet.transactions.filters.type")}
                    </label>
                    <select
                      value={transactionFilters.transactionType}
                      onChange={(e) => handleFilterChange("transactionType", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">{translate("wallet.transactions.filters.allTypes")}</option>
                      <option value="deposit">{translate("wallet.transactions.filters.deposit")}</option>
                      <option value="withdrawal">{translate("wallet.transactions.filters.withdrawal")}</option>
                      <option value="payment">{translate("wallet.transactions.filters.payment")}</option>
                      <option value="refund">{translate("wallet.transactions.filters.refund")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {translate("wallet.transactions.filters.status")}
                    </label>
                    <select
                      value={transactionFilters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">{translate("wallet.transactions.filters.allStatuses")}</option>
                      <option value="completed">{translate("wallet.transactions.filters.completed")}</option>
                      <option value="pending">{translate("wallet.transactions.filters.pending")}</option>
                      <option value="failed">{translate("wallet.transactions.filters.failed")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {translate("wallet.transactions.filters.dateRange")}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={transactionFilters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="date"
                        value={transactionFilters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      {translate("wallet.transactions.filters.clear")}
                    </button>
                  </div>
                </div>
              )}

              {/* Transaction List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowTransactionDetails(true);
                      }}
                      className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {getTransactionIcon(transaction.type, transaction.category)}
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white capitalize">
                              {transaction.description || transaction.type}
                            </h4>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{new Date(transaction.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm sm:text-base font-bold ${transaction.type === 'deposit' || transaction.type === 'earning' || transaction.type === 'refund'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-rose-700 dark:text-white'
                            }`}>
                            {transaction.type === 'deposit' || transaction.type === 'earning' || transaction.type === 'refund' ? '+' : '-'}
                            {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            {getStatusIcon(transaction.status)}
                            <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>{translate("wallet.transactions.empty")}</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {transactionPagination.pages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(transactionPagination.page - 1)}
                    disabled={transactionPagination.page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {translate("wallet.transactions.pagination.pageOffset", { page: transactionPagination.page, pages: transactionPagination.pages })}
                  </span>
                  <button
                    onClick={() => handlePageChange(transactionPagination.page + 1)}
                    disabled={transactionPagination.page === transactionPagination.pages}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'withdrawals' ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{translate("wallet.withdrawals.title")}</h2>
              <WithdrawalHistory />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  {translate("wallet.creditRequests.title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {translate("wallet.creditRequests.subtitle")}
                </p>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {creditRequests.length > 0 ? (
                  creditRequests.map((request) => (
                    <div key={request._id} className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                              ₦{request.requestedAmount.toLocaleString()}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                              {translate(`wallet.status.${request.status}`)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {request.businessReason}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {translate("wallet.creditRequests.submitted", { date: new Date(request.createdAt).toLocaleDateString(), time: new Date(request.createdAt).toLocaleTimeString() })}
                          </div>
                          {request.reviewedAt && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {translate("wallet.creditRequests.reviewed", { date: new Date(request.reviewedAt).toLocaleDateString() })}
                            </div>
                          )}
                          {request.approvedAmount && request.status === 'approved' && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-800 dark:text-green-400">
                              ✓ {translate("wallet.creditRequests.approvedAmount")}: ₦{globalFormatCurrency(request.approvedAmount)}
                              {request.adminNotes && <p className="text-xs mt-1">{translate("wallet.creditRequests.note")}: {request.adminNotes}</p>}
                            </div>
                          )}
                          {request.rejectionReason && request.status === 'rejected' && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-800 dark:text-red-400">
                              ✗ {translate("wallet.creditRequests.rejectionReason")}: {request.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="mb-2">{translate("wallet.creditRequests.noRequests")}</p>
                    <p className="text-sm">{translate("wallet.creditRequests.clickToRequest")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modals */}
          <TopUpModal
            open={showTopUpModal}
            onClose={() => setShowTopUpModal(false)}
          />

          <Modal
            open={showExportModal}
            onClose={() => setShowExportModal(false)}
            title={translate("wallet.modals.export.title")}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {translate("wallet.modals.export.format")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat("csv")}
                    className={`p-3 rounded-lg border text-center transition-all ${exportFormat === "csv"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => setExportFormat("pdf")}
                    className={`p-3 rounded-lg border text-center transition-all ${exportFormat === "pdf"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    PDF
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {translate("wallet.modals.export.dateRange")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleExportTransactions}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {translate("wallet.modals.export.download")}
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {translate("common.cancel")}
                </button>
              </div>
            </div>
          </Modal>

          <WithdrawalModal
            isOpen={showWithdrawalModal}
            onClose={() => setShowWithdrawalModal(false)}
            onSuccess={() => {
              // Refresh wallet data
              const loadWalletData = async () => {
                const userId = getUserId();
                if (userId) {
                  const summaryRes = await apiGet(`/api/v1/wallets/summary?userId=${userId}`) as { data?: WalletSummary };
                  setWalletSummary(summaryRes.data || null);
                }
              };
              loadWalletData();
            }}
            availableBalance={walletSummary?.ngnWallet.available || 0}
          />

          {/* Transaction Details Modal */}
          <Modal
            open={showTransactionDetails}
            onClose={() => setShowTransactionDetails(false)}
            title={translate("wallet.transactions.details.title")}
          >
            {selectedTransaction && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-full mb-3 ${selectedTransaction.type === 'deposit' || selectedTransaction.type === 'earning'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {getTransactionIcon(selectedTransaction.type, selectedTransaction.category)}
                  </div>
                  <div className={`text-2xl font-bold ${selectedTransaction.type === 'deposit' || selectedTransaction.type === 'earning' || selectedTransaction.type === 'refund'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-rose-700 dark:text-white'
                    }`}>
                    {selectedTransaction.type === 'deposit' || selectedTransaction.type === 'earning' || selectedTransaction.type === 'refund' ? '+' : '-'}
                    {formatCurrency(Math.abs(selectedTransaction.amount), selectedTransaction.currency)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    {selectedTransaction.status}
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{translate("wallet.transactions.details.reference")}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {selectedTransaction.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{translate("wallet.transactions.details.date")}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{translate("wallet.transactions.details.type")}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {translate(`wallet.transactions.filters.${selectedTransaction.type}`)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{translate("wallet.transactions.details.description")}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]">
                      {selectedTransaction.description}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowTransactionDetails(false)}
                  className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {translate("common.close")}
                </button>
              </div>
            )}
          </Modal>

          {/* Withdrawal Modal */}
          <WithdrawalModal
            isOpen={showWithdrawalModal}
            onClose={() => setShowWithdrawalModal(false)}
            availableBalance={walletSummary?.ngnWallet.available || 0}
            onSuccess={() => {
              loadTransactions(1);
              loadCreditRequests();
            }}
          />

          {/* Credit Request Modal */}
          <CreditRequestModal
            isOpen={showCreditRequestModal}
            onClose={() => setShowCreditRequestModal(false)}
            onSuccess={() => {
              loadCreditRequests();
              setActiveTab('credit-requests');
            }}
          />
        </div>
      </div >
    </RequireAuth >
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <WalletPageContent />
    </Suspense>
  );
}
