'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/utils/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/common/Modal';

type ManagerRole = 'product_manager' | 'order_manager' | 'insured_partners_manager';

const roleOptions: Array<{ value: ManagerRole; label: string; description: string }> = [
    {
        value: 'product_manager',
        label: 'Product Manager',
        description: 'Can access only product management features.',
    },
    {
        value: 'order_manager',
        label: 'Order Manager',
        description: 'Can access only order management features.',
    },
    {
        value: 'insured_partners_manager',
        label: 'Insured Partners Manager',
        description: 'Can access only Insured Partners management features.',
    },
];

export default function CreateManagerAccountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdEmail, setCreatedEmail] = useState('');
    const [createdRole, setCreatedRole] = useState<ManagerRole>('product_manager');
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'product_manager' as ManagerRole,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const requestedRole = params.get('role') as ManagerRole | null;
        const role = roleOptions.some((option) => option.value === requestedRole) ? requestedRole as ManagerRole : 'product_manager';
        setCreatedRole(role);
        setFormData((current) => ({ ...current, role }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiPost('/api/v1/admin/managers', formData);
            setCreatedEmail(formData.email);
            setCreatedRole(formData.role);
            setShowSuccessModal(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto p-6">
                <div className="mb-6">
                    <Link href="/admin/managers" className="text-blue-600 hover:text-blue-800 text-sm">
                        ← Back to Manager Accounts
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Manager Account</h1>
                    <p className="text-gray-600 mb-6">
                        Create a Product, Order, or Insured Partners Manager account. Login credentials will be sent via email.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Manager Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                required
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {roleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-sm text-gray-500">
                                {roleOptions.find((option) => option.value === formData.role)?.description}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="manager@example.com"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number <span className="text-gray-400">(Optional)</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+234 800 000 0000"
                            />
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> Login credentials will be automatically sent to the provided email address. This account will only see the workspace assigned to the selected manager role.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/managers')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Manager Account'}
                            </button>
                        </div>
                    </form>
                </div>

                <Modal
                    open={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title={<span className="inline-flex items-center gap-2 text-emerald-600">Manager Account Created</span>}
                    size="md"
                    footer={(
                        <>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setFormData({ email: '', firstName: '', lastName: '', phone: '', role: formData.role });
                                }}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Create Another
                            </button>
                            <button
                                onClick={() => router.push('/admin/managers')}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                View All
                            </button>
                        </>
                    )}
                >
                    <div className="space-y-4 p-2">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-sm font-medium text-emerald-900">
                                {roleOptions.find((option) => option.value === createdRole)?.label} account created successfully for <span className="break-all">{createdEmail}</span>.
                            </p>
                            <p className="mt-2 text-sm text-emerald-700">
                                Login credentials have been sent by email and the account will only have access to its assigned workspace.
                            </p>
                        </div>
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    );
}
