"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { RequireAuth } from "@/components/auth/Guards";
import { toast } from "@/components/common/Toast";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/utils/api";
import { getUserId } from "@/utils/auth";
import AdminGuard from "@/components/auth/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    TicketPercent,
    Plus,
    Calendar,
    Users,
    Tag,
    Info,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    BarChart3,
    Copy
} from "lucide-react";

interface Coupon {
    _id: string;
    code: string;
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    maxUsage: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    description?: string;
    terms?: string;
    applicableProducts?: string[];
    applicableCategories?: string[];
    userUsageLimit: number;
    createdAt: string;
}

interface CreateCouponForm {
    code: string;
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    maxUsage: number;
    validFrom: string;
    validUntil: string;
    description?: string;
    terms?: string;
    applicableProducts?: string[];
    applicableCategories?: string[];
    userUsageLimit: number;
}

export default function AdminCouponsPage() {
    const router = useRouter();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState<CreateCouponForm>({
        code: "",
        type: "percentage",
        value: 10,
        minOrderAmount: 0,
        maxUsage: 100,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        userUsageLimit: 1,
    });
    const [generatingCode, setGeneratingCode] = useState(false);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const uid = getUserId();
            if (!uid) return;

            const response = await apiGet<{ data: Coupon[] }>("/api/v1/vouchers/my-vouchers");
            setCoupons(response.data || []);
        } catch (error) {
            toast("Error loading coupons", "error");
        } finally {
            setLoading(false);
        }
    };

    const generateCode = async () => {
        try {
            setGeneratingCode(true);
            const uid = getUserId();
            if (!uid) return;

            const response = await apiPost<{ data: { code: string } }>("/api/v1/vouchers/generate-code");
            setFormData(prev => ({ ...prev, code: response.data.code }));
            toast("Unique code generated!", "success");
        } catch (error) {
            toast("Error generating code", "error");
        } finally {
            setGeneratingCode(false);
        }
    };

    const createCoupon = async () => {
        try {
            const uid = getUserId();
            if (!uid) return;

            // Validation
            if (!formData.code.trim()) {
                toast("Please enter a coupon code", "error");
                return;
            }

            if (formData.value <= 0) {
                toast("Please enter a valid discount value", "error");
                return;
            }

            if (formData.type === "percentage" && formData.value > 100) {
                toast("Percentage discount cannot exceed 100%", "error");
                return;
            }

            if (formData.maxUsage <= 0) {
                toast("Please enter a valid usage limit", "error");
                return;
            }

            await apiPost("/api/v1/vouchers/create", formData);
            toast("Coupon created successfully!", "success");
            setShowCreateForm(false);
            setFormData({
                code: "",
                type: "percentage",
                value: 10,
                minOrderAmount: 0,
                maxUsage: 100,
                validFrom: new Date().toISOString().split('T')[0],
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                userUsageLimit: 1,
            });
            loadCoupons();
        } catch (error) {
            toast("Error creating coupon", "error");
        }
    };

    const deactivateCoupon = async (couponId: string): Promise<void> => {
        try {
            const uid = getUserId();
            if (!uid) return;

            await apiDelete(`/api/v1/vouchers/${couponId}`);
            toast("Coupon deactivated successfully!", "success");
            loadCoupons();
        } catch (error) {
            toast("Error deactivating coupon", "error");
        }
    };

    const activateCoupon = async (couponId: string): Promise<void> => {
        try {
            const uid = getUserId();
            if (!uid) return;

            await apiPatch(`/api/v1/vouchers/${couponId}/activate`);
            toast("Coupon activated successfully!", "success");
            loadCoupons();
        } catch (error) {
            toast("Error activating coupon", "error");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getCouponTypeLabel = (type: string) => {
        switch (type) {
            case "percentage":
                return "Percentage Off";
            case "fixed":
                return "Fixed Amount Off";
            case "free_shipping":
                return "Free Shipping";
            default:
                return type;
        }
    };

    const getCouponTypeColors = (type: string) => {
        switch (type) {
            case "percentage":
                return "from-purple-500 to-purple-600";
            case "fixed":
                return "from-green-500 to-green-600";
            case "free_shipping":
                return "from-orange-500 to-orange-600";
            default:
                return "from-blue-500 to-blue-600";
        }
    };

    const getCouponValue = (coupon: Coupon) => {
        switch (coupon.type) {
            case "percentage":
                return `${coupon.value}% OFF`;
            case "fixed":
                return `₦${coupon.value} OFF`;
            case "free_shipping":
                return "FREE SHIPPING";
            default:
                return coupon.value;
        }
    };

    const getCouponStatus = (coupon: Coupon) => {
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validUntil = new Date(coupon.validUntil);

        if (!coupon.isActive) {
            return { status: "inactive", label: "Inactive", icon: XCircle, color: "text-gray-600" };
        } else if (now < validFrom) {
            return { status: "upcoming", label: "Coming Soon", icon: Clock, color: "text-blue-600" };
        } else if (now > validUntil) {
            return { status: "expired", label: "Expired", icon: XCircle, color: "text-red-600" };
        } else if (coupon.usedCount >= coupon.maxUsage) {
            return { status: "exhausted", label: "Fully Used", icon: XCircle, color: "text-red-600" };
        } else {
            return { status: "active", label: "Active", icon: CheckCircle, color: "text-green-600" };
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
                                    <p className="text-gray-600 dark:text-gray-400">Loading coupons...</p>
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
                            <span className="text-gray-900 dark:text-white font-medium">Coupons</span>
                        </nav>

                        {/* Back Button */}
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Admin
                        </Link>

                        {/* Header */}
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Coupon Management
                                </h1>
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                                    Create and manage promotional coupons for your store
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 w-fit"
                            >
                                <Plus className="w-5 h-5" />
                                Create Coupon
                            </button>
                        </div>

                        {/* Create Coupon Form */}
                        {showCreateForm && (
                            <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                                <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                                    Create New Coupon
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Code */}
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Coupon Code *
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                placeholder="Enter coupon code"
                                                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={generateCode}
                                                disabled={generatingCode}
                                                className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                            >
                                                {generatingCode ? "Generating..." : "Generate"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Type & Value */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Discount Type *
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="percentage">Percentage Off</option>
                                            <option value="fixed">Fixed Amount Off</option>
                                            <option value="free_shipping">Free Shipping</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formData.type === "percentage" ? "Discount %" : formData.type === "fixed" ? "Amount (₦)" : "Shipping Value"} *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.value}
                                            onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                                            min={0}
                                            max={formData.type === "percentage" ? 100 : undefined}
                                            step={formData.type === "percentage" ? 1 : 0.01}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Min Order Amount & Max Discount */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Minimum Order Amount (₦)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minOrderAmount || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: Number(e.target.value) || undefined }))}
                                            min={0}
                                            step={0.01}
                                            placeholder="No minimum"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {formData.type === "percentage" && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Maximum Discount (₦)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.maxDiscount || ""}
                                                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: Number(e.target.value) || undefined }))}
                                                min={0}
                                                step={0.01}
                                                placeholder="No maximum"
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}

                                    {/* Usage Limits */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Total Usage Limit *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxUsage}
                                            onChange={(e) => setFormData(prev => ({ ...prev, maxUsage: Number(e.target.value) }))}
                                            min={1}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Usage Per User
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.userUsageLimit}
                                            onChange={(e) => setFormData(prev => ({ ...prev, userUsageLimit: Number(e.target.value) }))}
                                            min={1}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Dates */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Valid From *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.validFrom}
                                            onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Valid Until *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.validUntil}
                                            onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                                            min={formData.validFrom}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Description & Terms */}
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Brief description of the coupon offer"
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Terms & Conditions
                                        </label>
                                        <textarea
                                            value={formData.terms || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                                            placeholder="Terms and conditions for using this coupon"
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={createCoupon}
                                        className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
                                    >
                                        Create Coupon
                                    </button>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-8 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Coupons List */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Your Coupons ({coupons.length})
                            </h2>

                            {coupons.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                        <TicketPercent className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        No coupons yet
                                    </h3>
                                    <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                        Create your first promotional coupon to attract more customers to your store.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {coupons.map((coupon) => {
                                        const status = getCouponStatus(coupon);
                                        const StatusIcon = status.icon;

                                        return (
                                            <div
                                                key={coupon._id}
                                                className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition-all hover:shadow-md"
                                            >
                                                {/* Status Badge */}
                                                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                                                    <span className={`text-xs font-medium ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {/* Coupon Code */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            Coupon Code
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(coupon.code);
                                                                toast("Code copied!", "success");
                                                            }}
                                                            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="font-mono text-base font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-2.5 py-2 rounded-lg">
                                                        {coupon.code}
                                                    </div>
                                                </div>

                                                {/* Coupon Type & Value */}
                                                <div className="mb-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r ${getCouponTypeColors(coupon.type)} text-white text-xs font-semibold mb-2`}>
                                                        <Tag className="w-3 h-3" />
                                                        {getCouponTypeLabel(coupon.type)}
                                                    </div>
                                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                        {getCouponValue(coupon)}
                                                    </div>
                                                </div>

                                                {/* Coupon Details */}
                                                <div className="space-y-2 mb-5">
                                                    {coupon.minOrderAmount && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                            <Info className="w-3 h-3" />
                                                            <span>Min. order: ₦{coupon.minOrderAmount}</span>
                                                        </div>
                                                    )}

                                                    {coupon.maxDiscount && coupon.type === "percentage" && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                            <Info className="w-3 h-3" />
                                                            <span>Max. discount: ₦{coupon.maxDiscount}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                        <Users className="w-3 h-3" />
                                                        <span>Usage: {coupon.usedCount}/{coupon.maxUsage}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Expires: {formatDate(coupon.validUntil)}</span>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                {coupon.description && (
                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                                            {coupon.description}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => coupon.isActive ? deactivateCoupon(coupon._id) : activateCoupon(coupon._id)}
                                                        className={`flex-1 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors ${coupon.isActive
                                                            ? "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                            : "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                                            }`}
                                                    >
                                                        {coupon.isActive ? (
                                                            <>
                                                                <Trash2 className="inline w-3 h-3 mr-1.5" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="inline w-3 h-3 mr-1.5" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                    <button className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                        <BarChart3 className="inline w-3 h-3 mr-1.5" />
                                                        Stats
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </AdminLayout>
            </AdminGuard>
        </RequireAuth>
    );
}
