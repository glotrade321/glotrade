'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/utils/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/common/Modal';

type ManagerRole = 'product_manager' | 'order_manager' | 'insured_partners_manager' | 'bazaar_manager';

const roleOptions: Array<{ value: ManagerRole; label: string; description: string }> = [
    {
        value: 'product_manager',
        label: 'Product Manager',
        description: 'Can access product management features.',
    },
    {
        value: 'order_manager',
        label: 'Order Manager',
        description: 'Can access order management features.',
    },
    {
        value: 'insured_partners_manager',
        label: 'Insured Partners Manager',
        description: 'Can access Insured Partners management features.',
    },
    {
        value: 'bazaar_manager',
        label: 'Event Bazaar Manager',
        description: 'Can access GloTrade Bazaar event management and attendee verification features.',
    },
];

export default function CreateManagerAccountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdEmail, setCreatedEmail] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<ManagerRole[]>(['product_manager']);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const requestedRole = params.get('role') as ManagerRole | null;
        if (requestedRole && roleOptions.some((option) => option.value === requestedRole)) {
            setSelectedRoles([requestedRole]);
        }
    }, []);

    const toggleRole = (role: ManagerRole) => {
        if (selectedRoles.includes(role)) {
            if (selectedRoles.length === 1) return; // Must keep at least one role
            setSelectedRoles(selectedRoles.filter((r) => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRoles.length === 0) {
            setError('Please select at least one manager role.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                role: selectedRoles[0],
                assignedRoles: selectedRoles,
            };
            await apiPost('/api/v1/admin/managers', payload);
            setCreatedEmail(formData.email);
            setShowSuccessModal(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                        Create a manager account and assign one or multiple management roles. Login credentials will be sent via email.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Manager Roles <span className="text-red-500">*</span> <span className="text-xs text-gray-500 font-normal">(Select all roles this manager can access)</span>
                            </label>
                            <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                                {roleOptions.map((option) => {
                                    const isChecked = selectedRoles.includes(option.value);
                                    return (
                                        <label
                                            key={option.value}
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                                isChecked
                                                    ? 'bg-blue-50 border-blue-500/50 text-blue-950'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleRole(option.value)}
                                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                                <strong>Multi-Role Access:</strong> This manager will see all selected workspaces in their sidebar menu and can switch between assigned workspaces seamlessly.
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
                                    setFormData({ email: '', firstName: '', lastName: '', phone: '' });
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
                                Manager account created successfully for <span className="break-all">{createdEmail}</span> with {selectedRoles.length} assigned role(s).
                            </p>
                            <p className="mt-2 text-sm text-emerald-700">
                                Login credentials have been sent by email and the account will have access to all assigned workspaces in the sidebar menu.
                            </p>
                        </div>
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    );
}
