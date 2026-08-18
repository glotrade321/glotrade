'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiDelete, apiGet, apiPost, apiPut } from '@/utils/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/common/Modal';

type ManagerRole = 'product_manager' | 'order_manager' | 'insured_partners_manager' | 'bazaar_manager';

interface ManagerAccount {
    _id: string;
    email: string;
    username: string;
    role: ManagerRole;
    assignedRoles?: ManagerRole[];
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
    bazaar_manager: 'Event Bazaar Manager',
};

const roleOptions: Array<{ value: ManagerRole; label: string; description: string }> = [
    { value: 'product_manager', label: 'Product Manager', description: 'Can access product management features.' },
    { value: 'order_manager', label: 'Order Manager', description: 'Can access order management features.' },
    { value: 'insured_partners_manager', label: 'Insured Partners Manager', description: 'Can access Insured Partners management features.' },
    { value: 'bazaar_manager', label: 'Event Bazaar Manager', description: 'Can access GloTrade Bazaar event management and attendee verification.' },
];

const managerRoles: ManagerRole[] = ['product_manager', 'order_manager', 'insured_partners_manager', 'bazaar_manager'];

const roleBadgeClass: Record<ManagerRole, string> = {
    product_manager: 'bg-blue-100 text-blue-800',
    order_manager: 'bg-amber-100 text-amber-800',
    insured_partners_manager: 'bg-emerald-100 text-emerald-800',
    bazaar_manager: 'bg-purple-100 text-purple-800',
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

    // Edit roles modal state
    const [editTarget, setEditTarget] = useState<ManagerAccount | null>(null);
    const [editRoles, setEditRoles] = useState<ManagerRole[]>([]);
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        fetchManagers();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const role = params.get('role');
        setRoleFilter(managerRoles.includes(role as ManagerRole) ? (role as ManagerRole) : 'all');
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

    const handleOpenEditModal = (manager: ManagerAccount) => {
        setEditTarget(manager);
        const currentRoles = manager.assignedRoles && manager.assignedRoles.length > 0 ? manager.assignedRoles : [manager.role];
        setEditRoles(currentRoles);
    };

    const toggleEditRole = (role: ManagerRole) => {
        if (editRoles.includes(role)) {
            if (editRoles.length === 1) return; // Keep at least 1 role
            setEditRoles(editRoles.filter((r) => r !== role));
        } else {
            setEditRoles([...editRoles, role]);
        }
    };

    const handleSaveRoles = async () => {
        if (!editTarget || editRoles.length === 0) return;
        setEditLoading(true);

        try {
            await apiPut(`/api/v1/admin/managers/${editTarget._id}`, {
                assignedRoles: editRoles,
            });
            setEditTarget(null);
            fetchManagers();
        } catch (err: any) {
            alert(err.message || 'Failed to update manager roles');
        } finally {
            setEditLoading(false);
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

    const filteredManagers =
        roleFilter === 'all'
            ? managers
            : managers.filter((manager) => {
                  const roles = manager.assignedRoles && manager.assignedRoles.length > 0 ? manager.assignedRoles : [manager.role];
                  return roles.includes(roleFilter);
              });

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
                        <p className="text-gray-600 mt-1">Create and manage Product, Order, Insured Partners, and Event Bazaar Managers</p>
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
                            <option value="bazaar_manager">Event Bazaar Managers</option>
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
                        <p className="mt-2 text-gray-600">Get started by creating a Product, Order, Insured Partners, or Event Bazaar Manager account.</p>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Roles</th>
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
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 items-center">
                                                {(manager.assignedRoles && manager.assignedRoles.length > 0 ? manager.assignedRoles : [manager.role]).map((r) => (
                                                    <span key={r} className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeClass[r] || 'bg-gray-100 text-gray-800'}`}>
                                                        {roleLabel[r] || r}
                                                    </span>
                                                ))}
                                            </div>
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
                                                onClick={() => handleOpenEditModal(manager)}
                                                className="text-purple-600 hover:text-purple-900 font-semibold mr-4"
                                                title="Edit Roles"
                                            >
                                                Edit Roles
                                            </button>
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
                        <strong>Multi-Role Manager Support:</strong> Admins can assign multiple management roles to any existing manager account by clicking <strong>Edit Roles</strong>. Managers will see all assigned workspaces in their navigation sidebar.
                    </p>
                </div>
            </div>

            {/* Edit Roles Modal */}
            <Modal
                open={Boolean(editTarget)}
                onClose={() => !editLoading && setEditTarget(null)}
                title={<span className="inline-flex items-center gap-2 text-purple-700">Edit Manager Roles ({editTarget?.email})</span>}
                size="md"
                footer={(
                    <>
                        <button
                            onClick={() => setEditTarget(null)}
                            disabled={editLoading}
                            className="flex-1 rounded-full border px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveRoles}
                            disabled={editLoading || editRoles.length === 0}
                            className="flex-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {editLoading ? 'Saving...' : 'Save Roles'}
                        </button>
                    </>
                )}
            >
                <div className="space-y-4 p-2">
                    <p className="text-sm text-gray-600">
                        Select one or multiple roles to assign to <strong>{editTarget?.firstName || editTarget?.username}</strong> ({editTarget?.email}):
                    </p>
                    <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                        {roleOptions.map((option) => {
                            const isChecked = editRoles.includes(option.value);
                            return (
                                <label
                                    key={option.value}
                                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                        isChecked ? 'bg-purple-50 border-purple-500/50 text-purple-950' : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleEditRole(option.value)}
                                        className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm text-gray-900">{option.label}</span>
                                        <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
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
                            Delete Manager <span className="break-all">{deleteTarget?.email}</span>?
                        </p>
                        <p className="mt-2 text-sm text-rose-700">
                            This action cannot be undone. The account will be removed from the Manager Accounts list.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Success Delete Modal */}
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
