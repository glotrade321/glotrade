"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, getAuthHeader, apiGetBlob } from "@/utils/api";
import WalletDetailsModal from "@/components/admin/WalletDetailsModal";
import {
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Shield,
  ShieldOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  RefreshCw,
  FileText
} from "lucide-react";

interface WalletUser {
  _id: string;
  walletId: string;
  displayName: string;
  username: string;
  email: string;
  profileImage?: string;
  isVerified: boolean;
  kycStatus: string;
  kycLevel: number;
  role: string;
  lastSeen: string;
}

interface Wallet {
  _id: string;
  userId: WalletUser;
  type: "user" | "vendor";
  currency: "NGN";
  balance: number;
  frozenBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalSpent: number;
  totalEarned: number;
  status: "active" | "suspended" | "frozen";
  createdAt: string;
  updatedAt: string;
}

interface WalletStats {
  totalWallets: number;
  activeWallets: number;
  frozenWallets: number;
  totalBalance: number;
  totalTransactions: number;
  totalUsers: number;
  totalVendors: number;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<Wallet[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalWallets: 0,
    activeWallets: 0,
    frozenWallets: 0,
    totalBalance: 0,
    totalTransactions: 0,
    totalUsers: 0,
    totalVendors: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [showBalance, setShowBalance] = useState(true);
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [freezeReason, setFreezeReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportType, setExportType] = useState("all");
  const [exportCurrency, setExportCurrency] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWalletForDetails, setSelectedWalletForDetails] = useState<string | null>(null);

  // Load wallets data
  const loadWallets = async () => {
    try {
      setIsLoading(true);

      // Load wallets with user data
      const walletsRes = await apiGet("/api/v1/admin/wallets") as { data?: { wallets: Wallet[] } };
      if (walletsRes.data?.wallets) {
        setWallets(walletsRes.data.wallets);
        setFilteredWallets(walletsRes.data.wallets);
      }

      // Load wallet statistics
      const statsRes = await apiGet("/api/v1/admin/wallets/stats") as { data?: WalletStats };
      if (statsRes.data) {
        setStats(statsRes.data);
      }

    } catch (error) {
      console.error("Error loading wallets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  // Filter wallets
  useEffect(() => {
    let filtered = wallets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(wallet =>
        wallet.userId?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.userId?.walletId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(wallet => wallet.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(wallet => wallet.type === typeFilter);
    }

    // Currency filter
    if (currencyFilter !== "all") {
      filtered = filtered.filter(wallet => wallet.currency === currencyFilter);
    }

    setFilteredWallets(filtered);
    setCurrentPage(1);
  }, [wallets, searchTerm, statusFilter, typeFilter, currencyFilter]);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'frozen':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'suspended':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'frozen':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleFreezeWallet = async (walletId: string) => {
    try {
      await apiPost(`/api/v1/wallets/${walletId}/freeze`, {
        reason: "Administrative action",
        adminNotes: "Wallet frozen by admin"
      });

      // Show success message
      const toast = (await import('@/components/common/Toast')).toast;
      toast("Wallet frozen successfully", "success");

      // Refresh wallets
      loadWallets();
    } catch (error) {
      console.error("Error freezing wallet:", error);
      const toast = (await import('@/components/common/Toast')).toast;
      toast("Failed to freeze wallet", "error");
    }
  };

  const handleUnfreezeWallet = async (walletId: string) => {
    try {
      await apiPost(`/api/v1/wallets/${walletId}/unfreeze`, {
        reason: "Administrative action",
        adminNotes: "Wallet unfrozen by admin"
      });

      // Show success message
      const toast = (await import('@/components/common/Toast')).toast;
      toast("Wallet unfrozen successfully", "success");

      // Refresh wallets
      loadWallets();
    } catch (error) {
      console.error("Error unfreezing wallet:", error);
      const toast = (await import('@/components/common/Toast')).toast;
      toast("Failed to unfreeze wallet", "error");
    }
  };

  const handleViewDetails = async (wallet: Wallet) => {
    setSelectedWalletForDetails(wallet._id);
    setShowDetailsModal(true);
  };

  const handleExportTransactions = async () => {
    try {
      const query = {
        format: exportFormat,
        ...(exportStartDate && { startDate: exportStartDate }),
        ...(exportEndDate && { endDate: exportEndDate }),
        ...(exportType !== "all" && { type: exportType }),
        ...(exportCurrency !== "all" && { currency: exportCurrency })
      };

      const blob = await apiGetBlob(`/api/v1/wallets/admin/export/transactions`, { query });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-wallet-transactions-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      const toast = (await import('@/components/common/Toast')).toast;
      toast("Failed to export transactions", "error");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWallets = filteredWallets.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Wallet Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage user and vendor wallets
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              {showBalance ? 'Hide' : 'Show'} Balance
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Wallets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWallets}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Wallets</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeWallets}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Frozen Wallets</p>
                <p className="text-2xl font-bold text-red-600">{stats.frozenWallets}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showBalance ? formatCurrency(stats.totalBalance, 'NGN') : '••••••'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or wallet ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="frozen">Frozen</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Currencies</option>
                <option value="NGN">NGN (Naira)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wallets Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Wallet ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedWallets.map((wallet) => (
                  <tr key={wallet._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                          {wallet.userId?.displayName?.charAt(0) || wallet.userId?.username?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {wallet.userId?.displayName || wallet.userId?.username || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {wallet.userId?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {wallet.userId?.walletId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${wallet.type === 'vendor'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                        {wallet.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {wallet.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {showBalance ? formatCurrency(wallet.balance, wallet.currency) : '••••••'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(wallet.status)}`}>
                        {wallet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {wallet.status === 'active' ? (
                          <button
                            onClick={() => handleFreezeWallet(wallet._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Freeze Wallet"
                          >
                            <Shield size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnfreezeWallet(wallet._id)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Unfreeze Wallet"
                          >
                            <ShieldOff size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(wallet)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredWallets.length)}</span> of{' '}
                    <span className="font-medium">{filteredWallets.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Export All Transactions
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Format
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transaction Type
                    </label>
                    <select
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Types</option>
                      <option value="deposit">Deposits</option>
                      <option value="withdrawal">Withdrawals</option>
                      <option value="transfer">Transfers</option>
                      <option value="payment">Payments</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={exportCurrency}
                      onChange={(e) => setExportCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Currencies</option>
                      <option value="NGN">NGN (Naira)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportTransactions}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Details Modal */}
        {selectedWalletForDetails && (
          <WalletDetailsModal
            open={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedWalletForDetails(null);
            }}
            walletId={selectedWalletForDetails}
            onRefresh={loadWallets}
          />
        )}
      </div>
    </AdminLayout>
  );
}
