'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiDelete } from '@/utils/api';

interface ProductManager {
    _id: string;
    email: string;
    username: string;
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

export default function ProductManagersPage() {
    const router = useRouter();
    const [productManagers, setProductManagers] = useState<ProductManager[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProductManagers();
    }, []);

    const fetchProductManagers = async () => {
        try {
            const response = await apiGet<{ data: ProductManager[] }>('/api/v1/admin/product-managers');
            setProductManagers(response.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (id: string, email: string) => {
        if (!confirm(`Reset password for ${email}? A new password will be sent to their email.`)) {
            return;
        }

        try {
            await apiPost(`/api/v1/admin/product-managers/${id}/reset-password`);
            alert('Password reset successfully! New credentials sent to email.');
        } catch (err: any) {
            alert(err.message || 'Failed to reset password');
        }
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Delete Product Manager ${email}? This action cannot be undone.`)) {
            return;
        }

        try {
            await apiDelete(`/api/v1/admin/product-managers/${id}`);
            alert('Product Manager deleted successfully');
            fetchProductManagers(); // Refresh list
        } catch (err: any) {
            alert(err.message || 'Failed to delete Product Manager');
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
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Product Managers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Product Managers</h1>
                    <p className="text-gray-600 mt-1">Manage users with product management access</p>
                </div>
                <Link
                    href="/admin/product-managers/new"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Product Manager
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {productManagers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No Product Managers</h3>
                    <p className="mt-2 text-gray-600">Get started by creating a new Product Manager account.</p>
                    <Link
                        href="/admin/product-managers/new"
                        className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        Create Product Manager
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Seen
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {productManagers.map((pm) => (
                                <tr key={pm._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium text-sm">
                                                        {pm.firstName?.[0]?.toUpperCase() || pm.email[0].toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {pm.firstName && pm.lastName
                                                        ? `${pm.firstName} ${pm.lastName}`
                                                        : pm.username}
                                                </div>
                                                <div className="text-sm text-gray-500">@{pm.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{pm.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {pm.isBlocked ? (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Blocked
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatLastSeen(pm.lastSeen)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(pm.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleResetPassword(pm._id, pm.email)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                            title="Reset Password"
                                        >
                                            Reset Password
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pm._id, pm.email)}
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
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>Product Manager Permissions:</strong> Product Managers can create, edit, and delete products.
                            They can also view product analytics. They cannot access user management, orders, or other admin features.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
