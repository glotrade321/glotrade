"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Store, Upload, X, Check } from "lucide-react";
import Modal from "@/components/common/Modal";
import { RequireAuth } from "@/components/auth/Guards";
import { API_BASE_URL, getAuthHeader, apiGet, apiPut } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import AdminGuard from "@/components/auth/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminStoreSettingsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; section?: string } & Record<string, any>>({ open: false });
    const [manualLogoUrl, setManualLogoUrl] = useState<string>('');

    useEffect(() => {
        (async () => {
            try {
                const response = await apiGet('/api/v1/sellers/me/profile') as any;
                setProfile(response.data || {});
            } catch { }
            finally { setLoading(false); }
        })();
    }, []);

    const save = async (updates: any) => {
        const next = { ...(profile || {}), ...(updates || {}) };
        setProfile(next);
        try {
            await apiPut('/api/v1/sellers/me/profile', next);
            toast('Settings saved successfully!', 'success');
        } catch {
            toast('Failed to save settings', 'error');
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast('Please select an image file', 'error');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast('File size must be less than 5MB', 'error');
            return;
        }

        try {
            setLoading(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            // Get auth token
            const token = localStorage.getItem("afritrade:user");
            if (!token) {
                toast('Please log in to upload files', 'error');
                return;
            }

            const user = JSON.parse(token);
            const userId = user?.id || user?._id;
            if (!userId) {
                toast('User ID not found', 'error');
                return;
            }

            // Upload to generic file upload endpoint
            const response = await fetch(new URL('/api/v1/files/upload', API_BASE_URL).toString(), {
                method: 'POST',
                headers: {
                    ...getAuthHeader()
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.data?.file?.url) {
                    // Update the seller profile with the new logo URL
                    const logoUrl = data.data.file.url;

                    // Update seller profile using the seller endpoint
                    const sellerResponse = await fetch(new URL('/api/v1/sellers/me/profile', API_BASE_URL).toString(), {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            ...getAuthHeader()
                        },
                        body: JSON.stringify({ logoUrl })
                    });

                    if (sellerResponse.ok) {
                        setProfile((p: any) => ({ ...(p || {}), logoUrl }));
                        toast('Store logo uploaded successfully!', 'success');
                    } else {
                        throw new Error('Failed to update store profile');
                    }
                } else {
                    throw new Error(data.message || 'Upload failed');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Logo upload error:', error);
            toast(error instanceof Error ? error.message : 'Failed to upload logo', 'error');
        } finally {
            setLoading(false);
            // Reset file input
            event.target.value = '';
        }
    };

    if (loading) {
        return (
            <RequireAuth>
                <AdminGuard>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">Loading store settings...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AdminGuard>
            </RequireAuth>
        );
    }

    return (
        <RequireAuth>
            <AdminGuard>
                <AdminLayout>
                    <div className="space-y-6">
                        {/* Breadcrumb Navigation */}
                        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <Link href="/admin" className="hover:text-gray-900 dark:hover:text-white transition-colors">Admin</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-gray-900 dark:text-white font-medium">Store Settings</span>
                        </nav>

                        {/* Back Button */}
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Admin
                        </Link>

                        {/* Header with Store Info */}
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={profile?.logoUrl || 'https://placehold.co/64x64?text=Logo'}
                                    alt="Store logo"
                                    className="h-14 w-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {profile?.name || 'Your Store'}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {profile?.country || 'Location not set'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setModal({ open: true, section: 'branding' });
                                    setManualLogoUrl(profile?.logoUrl || '');
                                }}
                                className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-fit"
                            >
                                Edit Branding
                            </button>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* About */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">About</h3>
                                    <button
                                        onClick={() => setModal({ open: true, section: 'about' })}
                                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {profile?.description || 'Tell shoppers about your store.'}
                                </p>
                            </div>

                            {/* Policies */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Policies</h3>
                                    <button
                                        onClick={() => setModal({ open: true, section: 'policies' })}
                                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="text-base text-gray-600 dark:text-gray-300 space-y-1">
                                    <div>Handling time: {profile?.policies?.handlingDays ?? '—'} days</div>
                                    <div>Return policy: {profile?.policies?.returnPolicy || '—'}</div>
                                    <div>Shipping regions: {(profile?.policies?.shippingRegions || []).join(', ') || '—'}</div>
                                </div>
                            </div>

                            {/* Payouts */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Payouts</h3>
                                    <button
                                        onClick={() => setModal({ open: true, section: 'payouts' })}
                                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Manage
                                    </button>
                                </div>
                                <div className="text-base text-gray-600 dark:text-gray-300">
                                    {(profile?.payoutMethods || []).length ? (
                                        profile.payoutMethods.map((m: any, i: number) => (
                                            <div key={i} className="mb-1">
                                                {m.provider} • {m.bankName || m.currency || m.country}
                                            </div>
                                        ))
                                    ) : (
                                        'No payout method yet.'
                                    )}
                                </div>
                            </div>

                            {/* SEO */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">SEO</h3>
                                    <button
                                        onClick={() => setModal({ open: true, section: 'seo' })}
                                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="text-base text-gray-600 dark:text-gray-300">
                                    Slug: {profile?.slug || '—'}
                                </div>
                            </div>
                        </div>

                        {/* Modals */}
                        {/* Branding Modal */}
                        <Modal
                            open={modal.open && modal.section === 'branding'}
                            onClose={() => setModal({ open: false })}
                            title="Store Branding"
                            size="lg"
                            footer={
                                <>
                                    <button
                                        onClick={() => setModal({ open: false })}
                                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </>
                            }
                        >
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Store Name
                                    </label>
                                    <input
                                        value={profile?.name || ''}
                                        onChange={(e) => setProfile((p: any) => ({ ...(p || {}), name: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Store Logo
                                    </label>
                                    <div className="space-y-4">
                                        {/* File Upload */}
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={loading}
                                                className="hidden"
                                                id="store-logo-upload"
                                            />
                                            <label
                                                htmlFor="store-logo-upload"
                                                className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                {loading ? (
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                                ) : (
                                                    <Upload className="w-4 h-4" />
                                                )}
                                                {loading ? 'Uploading...' : 'Upload Logo'}
                                            </label>
                                            {profile?.logoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => setProfile((p: any) => ({ ...(p || {}), logoUrl: "" }))}
                                                    className="text-base text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        {/* Preview */}
                                        {profile?.logoUrl && (
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={profile.logoUrl}
                                                    alt="Store logo preview"
                                                    className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                                />
                                                <div className="text-base text-gray-600 dark:text-gray-400">
                                                    Logo uploaded successfully
                                                </div>
                                            </div>
                                        )}

                                        {/* Manual URL Input */}
                                        <div>
                                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                Or enter logo URL manually:
                                            </label>
                                            <div className="flex gap-3">
                                                <input
                                                    value={manualLogoUrl}
                                                    onChange={(e) => setManualLogoUrl(e.target.value)}
                                                    placeholder="https://example.com/logo.png"
                                                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!manualLogoUrl.trim()) {
                                                            toast('Please enter a logo URL', 'error');
                                                            return;
                                                        }

                                                        let processedUrl = manualLogoUrl.trim();
                                                        if (!processedUrl.match(/^https?:\/\//)) {
                                                            processedUrl = `https://${processedUrl}`;
                                                        }

                                                        if (!processedUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
                                                            toast('Please enter a valid image URL', 'error');
                                                            return;
                                                        }

                                                        setProfile((p: any) => ({ ...(p || {}), logoUrl: processedUrl }));
                                                        setManualLogoUrl('');
                                                        toast('Logo URL updated!', 'success');
                                                    }}
                                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base hover:bg-blue-700 transition-colors"
                                                >
                                                    Set URL
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={() => save({ name: profile?.name, logoUrl: profile?.logoUrl })}
                                        className="rounded-lg bg-blue-600 text-white px-6 py-3 text-base font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        {/* About Modal */}
                        <Modal
                            open={modal.open && modal.section === 'about'}
                            onClose={() => setModal({ open: false })}
                            title="About Your Store"
                            size="lg"
                            footer={
                                <>
                                    <button
                                        onClick={() => setModal({ open: false })}
                                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </>
                            }
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={profile?.description || ''}
                                        onChange={(e) => setProfile((p: any) => ({ ...(p || {}), description: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Country
                                    </label>
                                    <input
                                        value={profile?.country || ''}
                                        onChange={(e) => setProfile((p: any) => ({ ...(p || {}), country: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <button
                                        onClick={() => save({ description: profile?.description, country: profile?.country })}
                                        className="rounded-lg bg-blue-600 text-white px-6 py-3 text-base font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        {/* Policies Modal */}
                        <Modal
                            open={modal.open && modal.section === 'policies'}
                            onClose={() => setModal({ open: false })}
                            title="Store Policies"
                            size="lg"
                            footer={
                                <>
                                    <button
                                        onClick={() => setModal({ open: false })}
                                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </>
                            }
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Handling Days
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={profile?.policies?.handlingDays || 0}
                                        onChange={(e) => setProfile((p: any) => ({
                                            ...(p || {}),
                                            policies: { ...(p?.policies || {}), handlingDays: Number(e.target.value) }
                                        }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Return Policy
                                    </label>
                                    <input
                                        value={profile?.policies?.returnPolicy || ''}
                                        onChange={(e) => setProfile((p: any) => ({
                                            ...(p || {}),
                                            policies: { ...(p?.policies || {}), returnPolicy: e.target.value }
                                        }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Shipping Regions (comma separated)
                                    </label>
                                    <input
                                        value={(profile?.policies?.shippingRegions || []).join(', ')}
                                        onChange={(e) => setProfile((p: any) => ({
                                            ...(p || {}),
                                            policies: {
                                                ...(p?.policies || {}),
                                                shippingRegions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                                            }
                                        }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <button
                                        onClick={() => save({ policies: profile?.policies })}
                                        className="rounded-lg bg-blue-600 text-white px-6 py-3 text-base font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        {/* Payouts Modal */}
                        <Modal
                            open={modal.open && modal.section === 'payouts'}
                            onClose={() => setModal({ open: false })}
                            title="Payout Methods"
                            size="lg"
                            footer={
                                <>
                                    <button
                                        onClick={() => setModal({ open: false })}
                                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </>
                            }
                        >
                            <div className="space-y-6">
                                {(profile?.payoutMethods || []).map((m: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <input
                                            value={m.provider || ''}
                                            onChange={(e) => setProfile((p: any) => {
                                                const next = [...(p?.payoutMethods || [])];
                                                next[idx] = { ...(next[idx] || {}), provider: e.target.value };
                                                return { ...(p || {}), payoutMethods: next };
                                            })}
                                            placeholder="Provider"
                                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            value={m.bankName || ''}
                                            onChange={(e) => setProfile((p: any) => {
                                                const next = [...(p?.payoutMethods || [])];
                                                next[idx] = { ...(next[idx] || {}), bankName: e.target.value };
                                                return { ...(p || {}), payoutMethods: next };
                                            })}
                                            placeholder="Bank Name"
                                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            value={m.accountNumber || ''}
                                            onChange={(e) => setProfile((p: any) => {
                                                const next = [...(p?.payoutMethods || [])];
                                                next[idx] = { ...(next[idx] || {}), accountNumber: e.target.value };
                                                return { ...(p || {}), payoutMethods: next };
                                            })}
                                            placeholder="Account Number"
                                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => setProfile((p: any) => ({
                                        ...(p || {}),
                                        payoutMethods: [...(p?.payoutMethods || []), { provider: 'paystack' }]
                                    }))}
                                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Add Payout Method
                                </button>
                                <div>
                                    <button
                                        onClick={() => save({ payoutMethods: profile?.payoutMethods })}
                                        className="rounded-lg bg-blue-600 text-white px-6 py-3 text-base font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        {/* SEO Modal */}
                        <Modal
                            open={modal.open && modal.section === 'seo'}
                            onClose={() => setModal({ open: false })}
                            title="SEO Settings"
                            size="lg"
                            footer={
                                <>
                                    <button
                                        onClick={() => setModal({ open: false })}
                                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </>
                            }
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Store Slug
                                    </label>
                                    <input
                                        value={profile?.slug || ''}
                                        onChange={(e) => setProfile((p: any) => ({ ...(p || {}), slug: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <button
                                        onClick={() => save({ slug: profile?.slug })}
                                        className="rounded-lg bg-blue-600 text-white px-6 py-3 text-base font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </AdminLayout>
            </AdminGuard>
        </RequireAuth>
    );
}
