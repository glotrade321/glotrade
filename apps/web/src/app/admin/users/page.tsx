"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Search,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Download,
  Plus,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  RotateCcw
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utils/api";
import { getOptimizedImageUrl } from "@/utils/image";

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  isSuperAdmin?: boolean;
  createdAt: string;
  lastLogin?: string;
  profilePicture?: string;
  bio?: string;
  preferences?: any;
  accountType?: "individual" | "business";
  businessInfo?: {
    companyName: string;
    businessType: string;
    taxId?: string;
    registrationNumber?: string;
    website?: string;
    industry?: string;
    isVerified: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
  };
  // Additional fields from backend
  country?: string;
  city?: string;
  reputation?: number;
  totalTransactions?: number;
  tokenBalance?: number;
  ngnWallet?: {
    balance: number;
    currency: string;
  };
  paymentRecipients?: any;
  store?: {
    name?: string;
    description?: string;
    logoUrl?: string;
    payout?: any;
  };
  wishlist?: string[];
  cart?: any[];
  addresses?: any[];
  emailVerified?: boolean;
  passwordChangedAt?: string;
  passwordChangeCount?: number;
  deletionRequestedAt?: string;
  deletionReason?: string;
  isDeletionRequested?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  adminDeletionReason?: string;
  canRestore?: boolean;
  permanentDeletionDate?: string;
}

interface UserFilters {
  role?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

interface UserResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');

  // Fetch real users from API
  const fetchUsers = async (filters: UserFilters = {}) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.role && filters.role !== 'all') queryParams.append('role', filters.role);
      if (filters.isVerified !== undefined) queryParams.append('isVerified', filters.isVerified.toString());
      if (filters.isBlocked !== undefined) queryParams.append('isBlocked', filters.isBlocked.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      // Use different endpoint based on activeTab
      const endpoint = activeTab === 'deleted' ? '/api/v1/admin/users/deleted' : '/api/v1/admin/users';
      const response = await apiGet(`${endpoint}?${queryParams.toString()}`) as { data: UserResponse };

      if (response.data) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setTotalUsers(response.data.total);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.page);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      // Fallback to empty state
      setUsers([]);
      setFilteredUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers({
      page: currentPage,
      limit: itemsPerPage,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
      isBlocked: statusFilter === 'blocked' ? true : undefined,
      search: searchTerm || undefined,
      // @ts-ignore - accountType not yet in UserFilters interface but backend might support it or we filter client side
    });
  }, [currentPage, roleFilter, statusFilter, accountTypeFilter, searchTerm, activeTab]);

  // Handle tab switching
  const handleTabChange = (tab: 'active' | 'deleted') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when switching tabs
    setSelectedUsers([]); // Clear selections
  };

  // Handle user actions
  const handleUserAction = async (user: User, action: string) => {
    setSelectedUser(user);

    switch (action) {
      case "view":
        setShowViewModal(true);
        break;
      case "edit":
        setShowEditModal(true);
        break;
      case "verify":
        setShowVerifyModal(true);
        break;
      case "block":
        setShowBlockModal(true);
        break;
      case "unblock":
        setShowUnblockModal(true);
        break;
      case "deactivate":
        setShowDeactivateModal(true);
        break;
      case "permanent-delete":
        await permanentlyDeleteUser(user._id);
        break;
      case "manage-wallet":
        setShowWalletModal(true);
        break;
    }
  };

  // API actions
  const verifyUser = async (userId: string) => {
    setActionLoading(true);
    try {
      await apiPut(`/api/v1/admin/users/${userId}/verify`);
      // Refresh users list
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
        isBlocked: statusFilter === 'blocked' ? true : undefined,
        search: searchTerm || undefined
      });
      setShowVerifyModal(false);
    } catch (error: any) {
      console.error("Error verifying user:", error);
      alert("Failed to verify user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const verifyBusiness = async (userId: string) => {
    setActionLoading(true);
    try {
      await apiPut(`/api/v1/admin/users/${userId}/verify-business`);
      // Refresh users list
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
        isBlocked: statusFilter === 'blocked' ? true : undefined,
        search: searchTerm || undefined
      });
      setShowVerifyModal(false);
      setSuccessMessage(`Business account for "${selectedUser?.username}" has been verified!`);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error verifying business:", error);
      alert("Failed to verify business: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const blockUser = async (userId: string) => {
    setActionLoading(true);
    try {
      await apiPut(`/api/v1/admin/users/${userId}/block`, { blocked: true });
      // Refresh users list
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
        isBlocked: statusFilter === 'blocked' ? true : undefined,
        search: searchTerm || undefined
      });
      setShowBlockModal(false);
    } catch (error: any) {
      console.error("Error blocking user:", error);
      alert("Failed to block user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const unblockUser = async (userId: string, reason?: string) => {
    setActionLoading(true);
    try {
      await apiPut(`/api/v1/admin/users/${userId}/block`, { blocked: false });
      // Refresh users list
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
        isBlocked: statusFilter === 'blocked' ? true : undefined,
        search: searchTerm || undefined
      });
      setShowUnblockModal(false);
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deactivateUser = async (userId: string, reason: string) => {
    setActionLoading(true);
    try {
      await apiPut(`/api/v1/admin/users/${userId}/deactivate`, { reason });
      // Refresh users list
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
        isBlocked: statusFilter === 'blocked' ? true : undefined,
        search: searchTerm || undefined
      });
      setShowDeactivateModal(false);
      setSuccessMessage(`User "${selectedUser?.username}" has been successfully deactivated!`);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      alert("Failed to deactivate user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const restoreUser = async (userId: string, reason?: string) => {
    setActionLoading(true);
    try {
      await apiPost(`/api/v1/admin/users/${userId}/restore`);
      // Refresh users list
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
        isBlocked: statusFilter === 'blocked' ? true : undefined,
        search: searchTerm || undefined
      });
      setShowRestoreModal(false);
      setSuccessMessage(`User "${selectedUser?.username}" has been successfully restored!`);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error restoring user:", error);
      alert("Failed to restore user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const permanentlyDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone and will permanently remove all user data.")) {
      return;
    }

    setActionLoading(true);
    try {
      await apiDelete(`/api/v1/admin/users/${userId}/permanent`);
      // Refresh users list
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
        isBlocked: statusFilter === 'blocked' ? true : undefined,
        search: searchTerm || undefined
      });
      setSuccessMessage(`User "${selectedUser?.username}" has been permanently deleted!`);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error permanently deleting user:", error);
      alert("Failed to permanently delete user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    setActionLoading(true);
    try {
      switch (action) {
        case "verify":
          await Promise.all(selectedUsers.map(id => apiPut(`/api/v1/admin/users/${id}/verify`)));
          break;
        case "block":
          await Promise.all(selectedUsers.map(id => apiPut(`/api/v1/admin/users/${id}/block`, { blocked: true })));
          break;
        case "unblock":
          await Promise.all(selectedUsers.map(id => apiPut(`/api/v1/admin/users/${id}/block`, { blocked: false })));
          break;
      }

      // Refresh users list
      fetchUsers({
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
        isBlocked: statusFilter === 'blocked' ? true : undefined,
        search: searchTerm || undefined
      });
      setSelectedUsers([]);
    } catch (error: any) {
      console.error("Error performing bulk action:", error);
      alert("Failed to perform bulk action: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      buyer: "bg-blue-100 text-blue-800",
      seller: "bg-green-100 text-green-800",
      admin: "bg-purple-100 text-purple-800"
    };
    return badges[role as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (user: User) => {
    if (user.isBlocked) return "bg-red-100 text-red-800";
    if (user.isVerified) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (user: User) => {
    if (user.isBlocked) return "Blocked";
    if (user.isVerified) return "Verified";
    return "Pending";
  };

  // Modal Components
  const ViewUserModal = () => {
    const [walletBalance, setWalletBalance] = useState<number | null>(null);

    useEffect(() => {
      const fetchWallet = async () => {
        if (!selectedUser) return;
        try {
          const res = await apiGet(`/api/v1/wallets/summary?userId=${selectedUser._id}`) as any;
          if (res.data?.ngnWallet?.balance !== undefined) {
            setWalletBalance(res.data.ngnWallet.balance);
          }
        } catch (error) {
          console.error("Error fetching wallet:", error);
        }
      };
      fetchWallet();
    }, [selectedUser]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowViewModal(false)}>
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">User Details</h2>
            <button
              onClick={() => setShowViewModal(false)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500 sm:w-6 sm:h-6" />
            </button>
          </div>

          {selectedUser && (
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
              <div className="space-y-4 sm:space-y-6">
                {/* User Header */}
                <div className="flex flex-row items-center gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {selectedUser.profilePicture ? (
                      <img
                        src={getOptimizedImageUrl(selectedUser.profilePicture, { width: 150, quality: 75 })}
                        alt={selectedUser.username}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                        onError={(e) => {
                          if (selectedUser.profilePicture && e.currentTarget.src !== selectedUser.profilePicture) {
                            e.currentTarget.src = selectedUser.profilePicture;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-lg sm:text-2xl font-bold text-gray-600">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                      {selectedUser.firstName && selectedUser.lastName
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : selectedUser.username
                      }
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 truncate">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedUser)}`}>
                        {getStatusText(selectedUser)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 sm:space-y-3">
                      {selectedUser.phone && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Phone size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm text-gray-600 truncate">{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.country && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <MapPin size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm text-gray-600 truncate">
                            {selectedUser.city ? `${selectedUser.city}, ` : ''}{selectedUser.country}
                          </span>
                        </div>
                      )}
                      {selectedUser.address && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Shield size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm text-gray-600 truncate font-mono">
                            {selectedUser.address.slice(0, 10)}...{selectedUser.address.slice(-8)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Calendar size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm text-gray-600">Joined {formatDate(selectedUser.createdAt)}</span>
                      </div>
                      {selectedUser.lastLogin && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Activity size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm text-gray-600">Last login {formatDateTime(selectedUser.lastLogin)}</span>
                        </div>
                      )}
                      {selectedUser.emailVerified !== undefined && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Mail size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm text-gray-600">
                            Email {selectedUser.emailVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                {selectedUser.accountType === 'business' && selectedUser.businessInfo && (
                  <div className="bg-indigo-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-indigo-900 text-sm sm:text-base">Business Information</h4>
                      {selectedUser.businessInfo.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock size={12} /> Pending Verification
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-indigo-800">Company Name:</span>
                          <p className="text-xs sm:text-sm text-indigo-700">{selectedUser.businessInfo.companyName}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-indigo-800">Business Type:</span>
                          <p className="text-xs sm:text-sm text-indigo-700">{selectedUser.businessInfo.businessType}</p>
                        </div>
                        {selectedUser.businessInfo.website && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-indigo-800">Website:</span>
                            <a href={selectedUser.businessInfo.website} target="_blank" rel="noopener noreferrer" className="block text-xs sm:text-sm text-blue-600 hover:underline truncate">
                              {selectedUser.businessInfo.website}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-indigo-800">Tax ID:</span>
                          <p className="text-xs sm:text-sm text-indigo-700 font-mono">{selectedUser.businessInfo.taxId || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-indigo-800">Reg Number:</span>
                          <p className="text-xs sm:text-sm text-indigo-700 font-mono">{selectedUser.businessInfo.registrationNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-indigo-800">Industry:</span>
                          <p className="text-xs sm:text-sm text-indigo-700">{selectedUser.businessInfo.industry || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Metrics */}
                {(selectedUser.reputation !== undefined || selectedUser.totalTransactions !== undefined || walletBalance !== null) && (
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Account Metrics</h4>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      {selectedUser.reputation !== undefined && (
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold text-blue-600">{selectedUser.reputation.toFixed(1)}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Reputation</div>
                        </div>
                      )}
                      {selectedUser.totalTransactions !== undefined && (
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold text-green-600">{selectedUser.totalTransactions}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Transactions</div>
                        </div>
                      )}
                      {walletBalance !== null && (
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold text-purple-600">
                            ₦{walletBalance.toLocaleString()}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">Naira Balance</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Store Information (for sellers) */}
                {selectedUser.role === 'seller' && selectedUser.store && (
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Store Information</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedUser.store.name && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Store Name:</span>
                          <span className="text-xs sm:text-sm text-gray-600 ml-2">{selectedUser.store.name}</span>
                        </div>
                      )}
                      {selectedUser.store.description && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Description:</span>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedUser.store.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Information */}
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Activity</h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      {selectedUser.wishlist && selectedUser.wishlist.length > 0 && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Wishlist Items:</span>
                          <span className="text-xs sm:text-sm text-gray-600 ml-2">{selectedUser.wishlist.length}</span>
                        </div>
                      )}
                      {selectedUser.cart && selectedUser.cart.length > 0 && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Cart Items:</span>
                          <span className="text-xs sm:text-sm text-gray-600 ml-2">{selectedUser.cart.length}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Saved Addresses:</span>
                          <span className="text-xs sm:text-sm text-gray-600 ml-2">{selectedUser.addresses.length}</span>
                        </div>
                      )}
                      {selectedUser.passwordChangeCount !== undefined && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Password Changes:</span>
                          <span className="text-xs sm:text-sm text-gray-600 ml-2">{selectedUser.passwordChangeCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Status Information */}
                {(selectedUser.isDeletionRequested || selectedUser.deletionRequestedAt || selectedUser.isDeleted) && (
                  <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-red-900 mb-3 text-sm sm:text-base">Account Status</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedUser.isDeletionRequested && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-500 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm text-red-700">Account deletion requested</span>
                        </div>
                      )}
                      {selectedUser.deletionReason && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-red-700">Deletion Reason:</span>
                          <p className="text-xs sm:text-sm text-red-600 mt-1">{selectedUser.deletionReason}</p>
                        </div>
                      )}
                      {selectedUser.isDeleted && selectedUser.deletedAt && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-red-700">Deleted:</span>
                          <span className="text-xs sm:text-sm text-red-600 ml-2">{formatDateTime(selectedUser.deletedAt)}</span>
                        </div>
                      )}
                      {selectedUser.deletedBy && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-red-700">Deleted by:</span>
                          <span className="text-xs sm:text-sm text-red-600 ml-2">{selectedUser.deletedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedUser.bio && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Bio</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{selectedUser.bio}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowWalletModal(true);
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                  >
                    Manage Wallet
                  </button>
                  {!selectedUser.isVerified && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setShowVerifyModal(true);
                      }}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      Verify User
                    </button>
                  )}
                  {selectedUser.accountType === 'business' && selectedUser.businessInfo && !selectedUser.businessInfo.isVerified && (
                    <button
                      onClick={() => verifyBusiness(selectedUser._id)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                    >
                      Verify Business
                    </button>
                  )}
                  {!selectedUser.isBlocked ? (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setShowBlockModal(true);
                      }}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      Block User
                    </button>
                  ) : (
                    <button
                      onClick={() => unblockUser(selectedUser._id)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      Unblock User
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const EditUserModal = () => {
    // State for form fields
    const [editFormData, setEditFormData] = useState({
      firstName: selectedUser?.firstName || '',
      lastName: selectedUser?.lastName || '',
      email: selectedUser?.email || '',
      phone: selectedUser?.phone || '',
      role: selectedUser?.role || 'buyer',
      isVerified: selectedUser?.isVerified || false,
      isBlocked: selectedUser?.isBlocked || false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Update form data when selectedUser changes
    useEffect(() => {
      if (selectedUser) {
        setEditFormData({
          firstName: selectedUser.firstName || '',
          lastName: selectedUser.lastName || '',
          email: selectedUser.email || '',
          phone: selectedUser.phone || '',
          role: selectedUser.role || 'buyer',
          isVerified: selectedUser.isVerified || false,
          isBlocked: selectedUser.isBlocked || false,
        });
      }
    }, [selectedUser]);

    const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;

      // Validate email
      if (!editFormData.email || !editFormData.email.includes('@')) {
        setFormError('Please enter a valid email address');
        return;
      }

      setIsSubmitting(true);
      setFormError('');

      try {
        // 1. Update basic user information
        await apiPut(`/api/v1/admin/users/${selectedUser._id}`, {
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email,
          phone: editFormData.phone,
        });

        // 2. Update role if changed
        if (editFormData.role !== selectedUser.role) {
          await apiPut(`/api/v1/admin/users/${selectedUser._id}/role`, {
            role: editFormData.role,
          });
        }

        // 3. Update verification status if changed
        if (editFormData.isVerified !== selectedUser.isVerified) {
          if (editFormData.isVerified) {
            await apiPut(`/api/v1/admin/users/${selectedUser._id}/verify`);
          }
          // Note: There's no unverify endpoint, so we only verify
        }

        // 4. Update block status if changed
        if (editFormData.isBlocked !== selectedUser.isBlocked) {
          await apiPut(`/api/v1/admin/users/${selectedUser._id}/block`, {
            blocked: editFormData.isBlocked,
          });
        }

        // Refresh users list
        await fetchUsers({
          page: currentPage,
          limit: itemsPerPage,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          isVerified: statusFilter === 'verified' ? true : statusFilter === 'unverified' ? false : undefined,
          isBlocked: statusFilter === 'blocked' ? true : undefined,
          search: searchTerm || undefined,
        });

        // Show success message and close modal
        setSuccessMessage(`User "${selectedUser.username}" has been successfully updated!`);
        setShowSuccessModal(true);
        setShowEditModal(false);
      } catch (error: any) {
        console.error('Error updating user:', error);
        setFormError(error.message || 'Failed to update user. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowEditModal(false)}>
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Edit User</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X size={20} className="text-gray-500 sm:w-6 sm:h-6" />
            </button>
          </div>

          {selectedUser && (
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
              <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{formError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.isVerified}
                      onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-700">Verified</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.isBlocked}
                      onChange={(e) => setEditFormData({ ...editFormData, isBlocked: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-700">Blocked</span>
                  </label>
                </div>

                <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ManageWalletModal = () => {
    const [limit, setLimit] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      const fetchWallet = async () => {
        if (!selectedUser) return;
        try {
          const res = await apiGet(`/api/v1/wallets/summary?userId=${selectedUser._id}`) as any;
          if (res.data?.ngnWallet?.creditLimit) {
            setLimit(res.data.ngnWallet.creditLimit.toString());
          }
        } catch (error) {
          console.error("Error fetching wallet:", error);
        }
      };
      fetchWallet();
    }, [selectedUser]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;
      setIsSubmitting(true);
      try {
        await apiPost(`/api/v1/wallets/${selectedUser._id}/credit-limit`, {
          limit: parseFloat(limit)
        });
        setSuccessMessage("Credit limit updated successfully");
        setShowSuccessModal(true);
        setShowWalletModal(false);
      } catch (error: any) {
        alert(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowWalletModal(false)}>
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Manage Wallet Credit</h2>
            <button onClick={() => setShowWalletModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit (NGN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="number"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Set the maximum credit limit for this user.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowWalletModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {isSubmitting ? "Saving..." : "Save Limit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const BlockUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowBlockModal(false)}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-red-600 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Block User</h2>
            <p className="text-xs sm:text-sm text-gray-600">Are you sure you want to block this user?</p>
          </div>
        </div>

        {selectedUser && (
          <div className="p-3 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-700 mb-2">
                Blocking <strong>{selectedUser.username}</strong> will prevent them from:
              </p>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 ml-4">
                <li>• Logging into their account</li>
                <li>• Making purchases or sales</li>
                <li>• Accessing platform features</li>
              </ul>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reason for blocking</label>
              <textarea
                placeholder="Enter reason for blocking this user..."
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => blockUser(selectedUser._id)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {actionLoading ? "Blocking..." : "Block User"}
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const VerifyUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={16} className="text-green-600 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Verify User</h2>
            <p className="text-xs sm:text-sm text-gray-600">Verify this user's account</p>
          </div>
        </div>

        {selectedUser && (
          <div className="p-3 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-700">
                Verifying <strong>{selectedUser.username}</strong> will:
              </p>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 ml-4 mt-2">
                <li>• Grant full platform access</li>
                <li>• Remove verification restrictions</li>
                <li>• Allow complete functionality</li>
              </ul>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => verifyUser(selectedUser._id)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {actionLoading ? "Verifying..." : "Verify User"}
              </button>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const DeactivateUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowDeactivateModal(false)}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-orange-600 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Deactivate User</h2>
            <p className="text-xs sm:text-sm text-gray-600">This will deactivate the user account</p>
          </div>
        </div>

        {selectedUser && (
          <div className="p-3 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-700 mb-2">
                Deactivating <strong>{selectedUser.username}</strong> will:
              </p>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 ml-4">
                <li>• Prevent user login and access</li>
                <li>• Hide user from public listings</li>
                <li>• Preserve all order history and data</li>
                <li>• Allow admin restoration if needed</li>
              </ul>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reason for deactivation</label>
              <textarea
                placeholder="Enter reason for deactivating this user..."
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700">
                <strong>Note:</strong> User data will be retained for compliance and business purposes.
                You can restore this user account at any time from the Deactivated Users section.
              </p>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => deactivateUser(selectedUser._id, "User deactivated by admin")}
                disabled={actionLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {actionLoading ? "Deactivating..." : "Deactivate User"}
              </button>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const UnblockUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowUnblockModal(false)}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-green-600 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Unblock User</h2>
            <p className="text-xs sm:text-sm text-gray-600">This will restore user access</p>
          </div>
        </div>

        {selectedUser && (
          <div className="p-3 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-700 mb-2">
                Unblocking <strong>{selectedUser.username}</strong> will:
              </p>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 ml-4">
                <li>• Restore user login access</li>
                <li>• Allow user to place orders</li>
                <li>• Restore full platform functionality</li>
                <li>• User can continue normal activities</li>
              </ul>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reason for unblocking (optional)</label>
              <textarea
                placeholder="Enter reason for unblocking this user..."
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs sm:text-sm text-green-700">
                <strong>Note:</strong> This action will immediately restore the user's access to the platform.
              </p>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => unblockUser(selectedUser._id, "User unblocked by admin")}
                disabled={actionLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {actionLoading ? "Unblocking..." : "Unblock User"}
              </button>
              <button
                onClick={() => setShowUnblockModal(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const RestoreUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowRestoreModal(false)}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <RotateCcw size={16} className="text-green-600 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Restore User</h2>
            <p className="text-xs sm:text-sm text-gray-600">This will restore user access</p>
          </div>
        </div>

        {selectedUser && (
          <div className="p-3 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-700 mb-2">
                Restoring <strong>{selectedUser.username}</strong> will:
              </p>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 ml-4">
                <li>• Restore user login access</li>
                <li>• Allow user to place orders</li>
                <li>• Restore full platform functionality</li>
                <li>• User can continue normal activities</li>
              </ul>
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reason for restoration (optional)</label>
              <textarea
                placeholder="Enter reason for restoring this user..."
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs sm:text-sm text-green-700">
                <strong>Note:</strong> This action will immediately restore the user's access to the platform.
              </p>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => restoreUser(selectedUser._id, "User restored by admin")}
                disabled={actionLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {actionLoading ? "Restoring..." : "Restore User"}
              </button>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowSuccessModal(false)}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={16} className="text-green-600 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Success!</h2>
            <p className="text-xs sm:text-sm text-gray-600">Operation completed successfully</p>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-700 text-center">
              {successMessage}
            </p>
          </div>

          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs sm:text-sm text-green-700 text-center">
              <strong>Note:</strong> The user list will be refreshed automatically.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Manage user accounts, roles, and permissions across the platform.
            </p>
          </div>
          <button className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add User</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-5 sm:h-5" size={16} />
                <input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="w-full sm:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-gray-600">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBulkAction("verify")}
                    disabled={actionLoading}
                    className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {actionLoading ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    onClick={() => handleBulkAction("block")}
                    disabled={actionLoading}
                    className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {actionLoading ? "Blocking..." : "Block"}
                  </button>
                  <button
                    onClick={() => handleBulkAction("unblock")}
                    disabled={actionLoading}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {actionLoading ? "Unblocking..." : "Unblock"}
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs sm:text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Status Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-3 sm:px-6 overflow-x-auto">
              <button
                onClick={() => handleTabChange('active')}
                className={`px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'active'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
              >
                Active Users ({totalUsers})
              </button>
              <button
                onClick={() => handleTabChange('deleted')}
                className={`px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'deleted'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
                  }`}
              >
                Deactivated Users
              </button>
            </nav>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {activeTab === 'deleted' ? 'Deactivated Users' : 'Active Users'} ({totalUsers})
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                <Download size={14} className="sm:w-4 sm:h-4" />
                Export
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(filteredUsers.map(u => u._id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user)}`}>
                            {getStatusText(user)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUserAction(user, "view")}
                              className="text-blue-600 hover:text-blue-900"
                              title="View User"
                            >
                              <Eye size={16} />
                            </button>

                            {activeTab === 'active' ? (
                              <>
                                <button
                                  onClick={() => handleUserAction(user, "edit")}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit User"
                                >
                                  <Edit size={16} />
                                </button>
                                {!user.isVerified && (
                                  <button
                                    onClick={() => handleUserAction(user, "verify")}
                                    className="text-green-600 hover:text-green-900"
                                    title="Verify User"
                                  >
                                    <UserCheck size={16} />
                                  </button>
                                )}
                                {!user.isBlocked ? (
                                  <button
                                    onClick={() => handleUserAction(user, "block")}
                                    className="text-red-600 hover:text-red-900"
                                    title="Block User"
                                  >
                                    <UserX size={16} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserAction(user, "unblock")}
                                    className="text-green-600 hover:text-green-900"
                                    title="Unblock User"
                                  >
                                    <Shield size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUserAction(user, "deactivate")}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Deactivate User"
                                >
                                  <AlertTriangle size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowRestoreModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                  title="Restore User"
                                  disabled={actionLoading}
                                >
                                  <RotateCcw size={16} />
                                </button>
                                <button
                                  onClick={() => handleUserAction(user, "permanent-delete")}
                                  className="text-red-600 hover:text-red-900"
                                  title="Permanently Delete User"
                                  disabled={actionLoading}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="lg:hidden">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="p-3 sm:p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user._id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      {/* User Avatar */}
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {user.username}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                                {user.role}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user)}`}>
                                {getStatusText(user)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Joined {formatDate(user.createdAt)}
                            </div>
                            {user.lastLogin && (
                              <div className="text-xs text-gray-500">
                                Last login {formatDate(user.lastLogin)}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleUserAction(user, "view")}
                              className="p-1 text-blue-600 hover:text-blue-900"
                              title="View User"
                            >
                              <Eye size={14} />
                            </button>

                            {activeTab === 'active' ? (
                              <>
                                <button
                                  onClick={() => handleUserAction(user, "edit")}
                                  className="p-1 text-blue-600 hover:text-blue-900"
                                  title="Edit User"
                                >
                                  <Edit size={14} />
                                </button>
                                {!user.isVerified && (
                                  <button
                                    onClick={() => handleUserAction(user, "verify")}
                                    className="p-1 text-green-600 hover:text-green-900"
                                    title="Verify User"
                                  >
                                    <UserCheck size={14} />
                                  </button>
                                )}
                                {!user.isBlocked ? (
                                  <button
                                    onClick={() => handleUserAction(user, "block")}
                                    className="p-1 text-red-600 hover:text-red-900"
                                    title="Block User"
                                  >
                                    <UserX size={14} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserAction(user, "unblock")}
                                    className="p-1 text-green-600 hover:text-green-900"
                                    title="Unblock User"
                                  >
                                    <Shield size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUserAction(user, "deactivate")}
                                  className="p-1 text-orange-600 hover:text-orange-900"
                                  title="Deactivate User"
                                >
                                  <AlertTriangle size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowRestoreModal(true);
                                  }}
                                  className="p-1 text-green-600 hover:text-green-900"
                                  title="Restore User"
                                  disabled={actionLoading}
                                >
                                  <RotateCcw size={14} />
                                </button>
                                <button
                                  onClick={() => handleUserAction(user, "permanent-delete")}
                                  className="p-1 text-red-600 hover:text-red-900"
                                  title="Permanently Delete User"
                                  disabled={actionLoading}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Showing page {currentPage} of {totalPages} • Total: {totalUsers} users
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showViewModal && <ViewUserModal />}
      {showEditModal && <EditUserModal />}
      {showWalletModal && <ManageWalletModal />}
      {showBlockModal && <BlockUserModal />}
      {showUnblockModal && <UnblockUserModal />}
      {showVerifyModal && <VerifyUserModal />}
      {showDeactivateModal && <DeactivateUserModal />}
      {showRestoreModal && <RestoreUserModal />}
      {showSuccessModal && <SuccessModal />}
    </AdminLayout>
  );
} 