"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Search,
    Filter,
    Download,
    MoreVertical,
    AlertCircle,
    Building,
    User,
    CreditCard
} from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import Modal from "@/components/common/Modal";
import { RequireAuth, RequireAdmin } from "@/components/auth/Guards";
import AdminLayout from "@/components/admin/AdminLayout";
import { formatCurrency } from "@/utils/format";

interface WithdrawalRequest {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    amount: number;
    currency: string;
    status: "pending" | "approved" | "rejected" | "processing" | "completed" | "failed";
    bankDetails: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        bankCode: string;
    };
    reference: string;
    createdAt: string;
    adminNote?: string;
}

export default function AdminWithdrawalsPage() {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "all",
        search: "",
        page: 1,
        limit: 20
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0
    });

    // Action states
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const loadRequests = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: filters.page.toString(),
                limit: filters.limit.toString()
            });

            if (filters.status !== "all") params.append("status", filters.status);

            const res = await apiGet(`/api/v1/withdrawals/admin/all?${params.toString()}`) as {
                data: WithdrawalRequest[],
                meta: { total: number, pages: number }
            };

            setRequests(res.data);
            setPagination({
                total: res.meta.total,
                pages: res.meta.pages
            });
        } catch (error) {
            console.error("Error loading withdrawals:", error);
            toast("Failed to load withdrawal requests", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [filters]);

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setIsProcessing(true);
            await apiPost(`/api/v1/withdrawals/admin/${selectedRequest._id}/approve`, {});
            toast("Withdrawal approved successfully", "success");
            setShowApproveModal(false);
            loadRequests();
        } catch (error: any) {
            console.error("Error approving withdrawal:", error);
            toast(error.message || "Failed to approve withdrawal", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!rejectionReason) {
            toast("Please provide a reason for rejection", "error");
            return;
        }

        try {
            setIsProcessing(true);
            await apiPost(`/api/v1/withdrawals/admin/${selectedRequest._id}/reject`, {
                reason: rejectionReason
            });
            toast("Withdrawal rejected successfully", "success");
            setShowRejectModal(false);
            setRejectionReason("");
            loadRequests();
        } catch (error: any) {
            console.error("Error rejecting withdrawal:", error);
            toast(error.message || "Failed to reject withdrawal", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</span>;
            case "pending":
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>;
            case "processing":
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Processing</span>;
            case "rejected":
            case "failed":
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{status}</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>;
        }
    };

    return (
        <RequireAuth>
            <RequireAdmin>
                <AdminLayout>
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawal Requests</h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and process withdrawal requests</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => loadRequests()}
                                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Loader2 className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by reference or user..."
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">User</th>
                                            <th className="px-6 py-3">Amount</th>
                                            <th className="px-6 py-3">Bank Details</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {requests.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    No withdrawal requests found
                                                </td>
                                            </tr>
                                        ) : (
                                            requests.map((request) => (
                                                <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-gray-900 dark:text-white font-medium">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono mt-1">
                                                            {request.reference}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-900 dark:text-white font-medium">
                                                            {request.userId.firstName} {request.userId.lastName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {request.userId.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-900 dark:text-white font-bold">
                                                            {formatCurrency(request.amount, 'NGN')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1 text-xs">
                                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                                                <Building className="w-3 h-3 text-gray-400" />
                                                                {request.bankDetails.bankName}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-500">
                                                                <CreditCard className="w-3 h-3" />
                                                                {request.bankDetails.accountNumber}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-500">
                                                                <User className="w-3 h-3" />
                                                                {request.bankDetails.accountName}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(request.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {request.status === 'pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedRequest(request);
                                                                        setShowRejectModal(true);
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedRequest(request);
                                                                        setShowApproveModal(true);
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <button
                                        disabled={filters.page === 1}
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Page {filters.page} of {pagination.pages}
                                    </span>
                                    <button
                                        disabled={filters.page === pagination.pages}
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Approve Modal */}
                    <Modal
                        open={showApproveModal}
                        onClose={() => setShowApproveModal(false)}
                        title="Approve Withdrawal"
                    >
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Are you sure you want to approve this withdrawal of <strong>₦{(selectedRequest?.amount ? selectedRequest.amount : 0).toLocaleString()}</strong>? This will initiate the payout process.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Confirm Approval
                                </button>
                            </div>
                        </div>
                    </Modal>

                    {/* Reject Modal */}
                    <Modal
                        open={showRejectModal}
                        onClose={() => setShowRejectModal(false)}
                        title="Reject Withdrawal"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for Rejection
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="e.g. Invalid bank details"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </Modal>
                </AdminLayout>
            </RequireAdmin>
        </RequireAuth >
    );
}
