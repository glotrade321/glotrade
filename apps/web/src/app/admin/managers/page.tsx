'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiDelete, apiGet, apiPost } from '@/utils/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/common/Modal';

type ManagerRole = 'product_manager' | 'order_manager' | 'insured_partners_manager';

interface ManagerAccount {
    _id: string;
    email: string;
    username: string;
    role: ManagerRole;
    firstName?: string;
    lastName?: string;
    isBlocked: boolean;
    lastSeen?: string;
    createdAt: string;
    createdBy?: {
        email: string;
        username: string;
    };
}

const roleLabel: Record<ManagerRole, string> = {
    product_manager: 'Product Manager',
    order_manager: 'Order Manager',
    insured_partners_manager: 'Insured Partners Manager',
};

const managerRoles: ManagerRole[] = ['product_manager', 'order_manager', 'insured_partners_manager'];

const roleBadgeClass: Record<ManagerRole, string> = {
    product_manager: 'bg-blue-100 text-blue-800',
    order_manager: 'bg-amber-100 text-amber-800',
    insured_partners_manager: 'bg-emerald-100 text-emerald-800',
};

export default function ManagerAccountsPage() {
    const router = useRouter();
    const [managers, setManagers] = useState<ManagerAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | ManagerRole>('all');
    const [deleteTarget, setDeleteTarget] = useState<ManagerAccount | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletedEmail, setDeletedEmail] = useState('');

    useEffect(() => {
        fetchManagers();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const role = params.get('role');
        setRoleFilter(managerRoles.includes(role as ManagerRole) ? role as ManagerRole : 'all');
    }, []);

    const fetchManagers = async () => {
        try {
            const response = await apiGet<{ data: ManagerAccount[] }>('/api/v1/admin/managers');
            setManagers(response.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch manager accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (id: string, email: string) => {
        if (!confirm(`Reset password for ${email}? A new password will be sent to their email.`)) {
            return;
        }

        try {
            await apiPost(`/api/v1/admin/managers/${id}/reset-password`);
            alert('Password reset successfully! New credentials sent to email.');
        } catch (err: any) {
            alert(err.message || 'Failed to reset password');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await apiDelete(`/api/v1/admin/managers/${deleteTarget._id}`);
            setDeletedEmail(deleteTarget.email);
            setDeleteTarget(null);
            fetchManagers();
        } catch (err: any) {
            alert(err.message || 'Failed to delete manager account');
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatLastSeen = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    const filteredManagers = roleFilter === 'all'
        ? managers
        : managers.filter((manager) => manager.role === roleFilter);

    const handleRoleFilterChange = (value: 'all' | ManagerRole) => {
        setRoleFilter(value);
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        if (value === 'all') {
            params.delete('role');
        } else {
            params.set('role', value);
        }
        const query = params.toString();
        router.replace(query ? `/admin/managers?${query}` : '/admin/managers');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Manager Accounts...</p>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manager Accounts</h1>
                        <p className="text-gray-600 mt-1">Create and manage Product, Order, and Insured Partners Managers</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleFilterChange(e.target.value as 'all' | ManagerRole)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Manager Roles</option>
                            <option value="product_manager">Product Managers</option>
                            <option value="order_manager">Order Managers</option>
                            <option value="insured_partners_manager">Insured Partners Managers</option>
                        </select>
                        <Link
                            href={roleFilter === 'all' ? '/admin/managers/new' : `/admin/managers/new?role=${roleFilter}`}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Manager Account
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {filteredManagers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No Manager Accounts</h3>
                        <p className="mt-2 text-gray-600">Get started by creating a Product, Order, or Insured Partners Manager account.</p>
                        <Link
                            href={roleFilter === 'all' ? '/admin/managers/new' : `/admin/managers/new?role=${roleFilter}`}
                            className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            Create Manager Account
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredManagers.map((manager) => (
                                    <tr key={manager._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium text-sm">
                                                            {manager.firstName?.[0]?.toUpperCase() || manager.email[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {manager.firstName && manager.lastName ? `${manager.firstName} ${manager.lastName}` : manager.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500">@{manager.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeClass[manager.role]}`}>
                                                {roleLabel[manager.role]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{manager.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {manager.isBlocked ? (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Blocked</span>
                                            ) : (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatLastSeen(manager.lastSeen)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(manager.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleResetPassword(manager._id, manager.email)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                title="Reset Password"
                                            >
                                                Reset Password
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(manager)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-700">
                        <strong>Manager Access Scope:</strong> Product Managers can only access product management. Order Managers can only access order management. Insured Partners Managers can only access Insured Partners management. They will not see other admin sections.
                    </p>
                </div>
            </div>

            <Modal
                open={Boolean(deleteTarget)}
                onClose={() => !deleteLoading && setDeleteTarget(null)}
                title={<span className="inline-flex items-center gap-2 text-rose-600">Delete Manager Account</span>}
                size="md"
                footer={(
                    <>
                        <button
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleteLoading}
                            className="flex-1 rounded-full border px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="flex-1 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete Manager'}
                        </button>
                    </>
                )}
            >
                <div className="space-y-4 p-2">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                        <p className="text-sm font-medium text-rose-900">
                            Delete {deleteTarget ? roleLabel[deleteTarget.role] : 'Manager'} <span className="break-all">{deleteTarget?.email}</span>?
                        </p>
                        <p className="mt-2 text-sm text-rose-700">
                            This action cannot be undone. The account will be removed from the Manager Accounts list.
                        </p>
                    </div>
                </div>
            </Modal>

            <Modal
                open={Boolean(deletedEmail)}
                onClose={() => setDeletedEmail('')}
                title={<span className="inline-flex items-center gap-2 text-emerald-600">Manager Deleted</span>}
                size="md"
                footer={(
                    <button
                        onClick={() => setDeletedEmail('')}
                        className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                        Close
                    </button>
                )}
            >
                <div className="space-y-4 p-2">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-medium text-emerald-900">
                            Manager account <span className="break-all">{deletedEmail}</span> was deleted successfully.
                        </p>
                        <p className="mt-2 text-sm text-emerald-700">
                            The account has been removed and the user has been notified by email.
                        </p>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
