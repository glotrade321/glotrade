"use client";

import { useEffect, useState } from "react";
import {
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    DollarSign,
    FileText,
    TrendingUp,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import Modal from "@/components/common/Modal";
import AdminLayout from "@/components/admin/AdminLayout";
import { formatCurrency } from "@/utils/format";

interface CreditRequest {
    _id: string;
    userId: {
        _id: string;
        username: string;
        email: string;
        phone?: string;
    };
    requestedAmount: number;
    approvedAmount?: number;
    status: "pending" | "approved" | "rejected" | "cancelled";
    businessReason: string;
    adminNotes?: string;
    rejectionReason?: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: {
        username: string;
    };
}

interface UserHistory {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    walletBalance: number;
    creditUsed: number;
    creditLimit: number;
}

export default function CreditRequestsPage() {
    const [requests, setRequests] = useState<CreditRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
    const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Form states
    const [approvedAmount, setApprovedAmount] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter states
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        pages: 0
    });

    const loadRequests = async (page = 1) => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20"
            });

            if (statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            const response = await apiGet(`/api/v1/credit-requests?${params}`) as {
                data?: {
                    requests: CreditRequest[];
                    total: number;
                    pages: number;
                }
            };

            if (response.data) {
                setRequests(response.data.requests);
                setPagination({
                    page,
                    total: response.data.total,
                    pages: response.data.pages
                });
            }
        } catch (error) {
            console.error("Error loading credit requests:", error);
            toast("Failed to load credit requests", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const loadRequestDetails = async (requestId: string) => {
        try {
            const response = await apiGet(`/api/v1/credit-requests/${requestId}`) as {
                data?: {
                    request: CreditRequest;
                    userHistory: UserHistory;
                }
            };

            if (response.data) {
                setSelectedRequest(response.data.request);
                setUserHistory(response.data.userHistory);
                setShowDetailsModal(true);
            }
        } catch (error) {
            console.error("Error loading request details:", error);
            toast("Failed to load request details", "error");
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        setIsSubmitting(true);
        try {
            await apiPost(`/api/v1/credit-requests/${selectedRequest._id}/approve`, {
                approvedAmount: approvedAmount ? parseFloat(approvedAmount) : undefined,
                adminNotes: adminNotes.trim() || undefined
            });

            toast("Credit request approved successfully!", "success");
            setShowApproveModal(false);
            setShowDetailsModal(false);
            setApprovedAmount("");
            setAdminNotes("");
            loadRequests(pagination.page);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to approve request";
            toast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast("Rejection reason is required", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await apiPost(`/api/v1/credit-requests/${selectedRequest._id}/reject`, {
                rejectionReason: rejectionReason.trim()
            });

            toast("Credit request rejected", "success");
            setShowRejectModal(false);
            setShowDetailsModal(false);
            setRejectionReason("");
            loadRequests(pagination.page);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to reject request";
            toast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        loadRequests(1);
    }, [statusFilter]);

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
        };
        return badges[status as keyof typeof badges] || badges.cancelled;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return <Clock className="w-4 h-4" />;
            case "approved": return <CheckCircle className="w-4 h-4" />;
            case "rejected": return <XCircle className="w-4 h-4" />;
            default: return <XCircle className="w-4 h-4" />;
        }
    };

    const filteredRequests = requests.filter(req => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            req.userId.username.toLowerCase().includes(query) ||
            req.userId.email.toLowerCase().includes(query) ||
            req.businessReason.toLowerCase().includes(query)
        );
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-blue-500" />
                        Credit Requests
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Review and manage wholesaler credit limit requests
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Filter className="w-4 h-4 inline mr-1" />
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Search className="w-4 h-4 inline mr-1" />
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by user or reason..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading requests...</p>
                        </div>
                    ) : filteredRequests.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredRequests.map((request) => (
                                            <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                                                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {request.userId.username}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {request.userId.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {formatCurrency(request.requestedAmount, 'NGN')}
                                                    </div>
                                                    {request.approvedAmount && (
                                                        <div className="text-xs text-green-600 dark:text-green-400">
                                                            Approved: {formatCurrency(request.approvedAmount, 'NGN')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                                                        {getStatusIcon(request.status)}
                                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => loadRequestDetails(request._id)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <button
                                        onClick={() => loadRequests(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => loadRequests(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">No credit requests found</p>
                            <p className="text-sm mt-1">Requests will appear here when wholesalers apply for credit</p>
                        </div>
                    )}
                </div>

                {/* Details Modal */}
                {selectedRequest && (
                    <Modal
                        open={showDetailsModal}
                        onClose={() => setShowDetailsModal(false)}
                        title=""
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Credit Request Details
                            </h2>

                            {/* User Info */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    User Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.userId.username}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.userId.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* User History */}
                            {userHistory && (
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Purchase History
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Total Orders:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">{userHistory.totalOrders}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">{userHistory.completedOrders}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Total Spent:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">₦{userHistory.totalSpent.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Avg Order:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">₦{userHistory.averageOrderValue.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Wallet Balance:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">₦{userHistory.walletBalance.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Current Credit:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                ₦{userHistory.creditUsed.toLocaleString()} / ₦{userHistory.creditLimit.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Request Details */}
                            <div className="mb-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested Amount</label>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(selectedRequest.requestedAmount, 'NGN')}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <FileText className="w-4 h-4" />
                                        Business Justification
                                    </label>
                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                        {selectedRequest.businessReason}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Submitted
                                    </label>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(selectedRequest.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedRequest.status === "pending" && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setApprovedAmount(selectedRequest.requestedAmount.toString());
                                            setShowApproveModal(true);
                                        }}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>
                            )}

                            {selectedRequest.status === "approved" && selectedRequest.adminNotes && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-400">Admin Notes:</p>
                                    <p className="text-sm text-green-700 dark:text-green-300">{selectedRequest.adminNotes}</p>
                                </div>
                            )}

                            {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-400">Rejection Reason:</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">{selectedRequest.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}

                {/* Approve Modal */}
                <Modal
                    open={showApproveModal}
                    onClose={() => setShowApproveModal(false)}
                    title="Approve Credit Request"
                >
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Approved Amount (₦)
                            </label>
                            <input
                                type="number"
                                value={approvedAmount}
                                onChange={(e) => setApprovedAmount(e.target.value)}
                                placeholder="Leave empty to approve requested amount"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Requested: ₦{selectedRequest && selectedRequest.requestedAmount.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                                placeholder="Add any notes for the user..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Confirm Approval
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Reject Modal */}
                <Modal
                    open={showRejectModal}
                    onClose={() => setShowRejectModal(false)}
                    title="Reject Credit Request"
                >
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rejection Reason *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                required
                                placeholder="Explain why this request is being rejected..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isSubmitting || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        Confirm Rejection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    );
}
