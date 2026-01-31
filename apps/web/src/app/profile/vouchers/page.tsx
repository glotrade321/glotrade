"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { RequireAuth } from "@/components/auth/Guards";
import { toast } from "@/components/common/Toast";
import { apiGet } from "@/utils/api";
import { getUserId } from "@/utils/auth";
import { TicketPercent, Calendar, Users, Tag, Info, Copy, CheckCircle, XCircle, Clock, BarChart3 } from "lucide-react";
import { getStoredLocale, translate, Locale } from "@/utils/i18n";

interface Voucher {
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
  description?: string;
  terms?: string;
  createdByType: "seller" | "admin" | "platform";
  applicableProducts?: string[];
  applicableCategories?: string[];
  userUsageLimit: number;
  createdAt: string;
  userUsage?: number; // Current user's usage count
}

interface VoucherUsage {
  voucherId: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  discountApplied: number;
  orderId: string;
  orderTotal: number;
  usedAt: string;
  description?: string;
}

export default function VouchersPage() {
  const router = useRouter();
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [usedVouchers, setUsedVouchers] = useState<any[]>([]);
  const [voucherUsage, setVoucherUsage] = useState<VoucherUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'history'>('available');
  const [locale, setLocale] = useState<Locale>("en");

  // ... (useEffect hook for locale remains same)

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const uid = getUserId();
      if (!uid) return;

      // Load available vouchers
      const availableData = await apiGet<{ data: Voucher[] }>("/api/v1/vouchers/available");
      setAvailableVouchers(availableData.data || []);

      // Load user's voucher usage data
      const usageData = await apiGet<{ data: VoucherUsage[] }>("/api/v1/vouchers/my-usage");
      setVoucherUsage(usageData.data || []);

      // Extract used vouchers from usage data
      const usedVouchersData = usageData.data?.map((usage: VoucherUsage) => ({
        _id: usage.voucherId,
        code: usage.code,
        type: usage.type,
        value: usage.value,
        description: usage.description,
        usedAt: usage.usedAt,
        discountApplied: usage.discountApplied,
        orderId: usage.orderId,
        orderTotal: usage.orderTotal
      })) || [];

      setUsedVouchers(usedVouchersData);
    } catch (error) {
      toast(translate(locale, "vouchers.toasts.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast(translate(locale, "vouchers.toasts.copySuccess"), "success");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast(translate(locale, "vouchers.toasts.copyError"), "error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'ha' ? 'ha-NG' : locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return translate(locale, "vouchers.types.percentage");
      case "fixed":
        return translate(locale, "vouchers.types.fixed");
      case "free_shipping":
        return translate(locale, "vouchers.types.free_shipping");
      default:
        return type;
    }
  };

  const getVoucherColor = (type: string) => {
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

  const getVoucherValue = (voucher: Voucher) => {
    switch (voucher.type) {
      case "percentage":
        return `${voucher.value}% ${translate(locale, "voucher.off")}`;
      case "fixed":
        return `${voucher.value.toLocaleString()} NGN ${translate(locale, "voucher.off")}`;
      case "free_shipping":
        return translate(locale, "voucher.freeShipping");
      default:
        return voucher.value;
    }
  };

  const getVoucherStatus = (voucher: Voucher) => {
    const now = new Date();
    const validFrom = new Date(voucher.validFrom);
    const validUntil = new Date(voucher.validUntil);

    if (now < validFrom) {
      return { status: "upcoming", label: translate(locale, "vouchers.status.upcoming"), icon: Clock, color: "text-blue-600" };
    } else if (now > validUntil) {
      return { status: "expired", label: translate(locale, "vouchers.status.expired"), icon: XCircle, color: "text-red-600" };
    } else if (voucher.usedCount >= voucher.maxUsage) {
      return { status: "exhausted", label: translate(locale, "vouchers.status.exhausted"), icon: XCircle, color: "text-red-600" };
    } else {
      return { status: "active", label: translate(locale, "vouchers.status.active"), icon: CheckCircle, color: "text-green-600" };
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="mx-auto md:w-[95%] w-full px-3 sm:px-4 py-4 sm:py-6 md:px-0">
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-neutral-900 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base text-neutral-600">{translate(locale, "loading")}</p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">{translate(locale, "home.title")}</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/profile" className="hover:text-gray-900 dark:hover:text-white transition-colors">{translate(locale, "profile.title")}</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 dark:text-white font-medium">{translate(locale, "vouchers.title")}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {translate(locale, "vouchers.back")}
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {translate(locale, "vouchers.title")}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {translate(locale, "vouchers.subtitle")}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'available'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {translate(locale, "vouchers.tabs.available").replace("{count}", availableVouchers.length.toString())} {activeTab !== 'available' && `(${availableVouchers.length})`}
              </button>
              <button
                onClick={() => setActiveTab('used')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'used'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {translate(locale, "vouchers.tabs.used").replace("{count}", usedVouchers.length.toString())} {activeTab !== 'used' && `(${usedVouchers.length})`}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'history'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {translate(locale, "vouchers.tabs.history").replace("{count}", voucherUsage.length.toString())} {activeTab !== 'history' && `(${voucherUsage.length})`}
              </button>
            </div>
          </div>

          {/* Available Vouchers Tab */}
          {activeTab === 'available' && (
            <>
              {availableVouchers.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <TicketPercent className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {translate(locale, "vouchers.empty.availableTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {translate(locale, "vouchers.empty.availableDesc")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableVouchers.map((voucher: Voucher) => {
                    const status = getVoucherStatus(voucher);
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={voucher._id}
                        className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md"
                      >
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          <span className={`text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        {/* Voucher Code */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {translate(locale, "vouchers.card.codeLabel")}
                            </span>
                            <button
                              onClick={() => copyToClipboard(voucher.code)}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                              {copiedCode === voucher.code ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  {translate(locale, "vouchers.card.copied")}
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  {translate(locale, "vouchers.card.copy")}
                                </>
                              )}
                            </button>
                          </div>
                          <div className="font-mono text-lg font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            {voucher.code}
                          </div>
                        </div>

                        {/* Voucher Type & Value */}
                        <div className="mb-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getVoucherColor(voucher.type)} text-white text-sm font-semibold mb-2`}>
                            <Tag className="w-3.5 h-3.5" />
                            {getVoucherTypeLabel(voucher.type)}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {getVoucherValue(voucher)}
                          </div>
                        </div>

                        {/* Voucher Details */}
                        <div className="space-y-3 mb-6">
                          {voucher.minOrderAmount && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Info className="w-3.5 h-3.5" />
                              <span>{translate(locale, "vouchers.card.minOrder").replace("{amount}", voucher.minOrderAmount.toLocaleString()).replace("{currency}", "NGN")}</span>
                            </div>
                          )}

                          {voucher.maxDiscount && voucher.type === "percentage" && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Info className="w-3.5 h-3.5" />
                              <span>{translate(locale, "vouchers.card.maxDiscount").replace("{amount}", voucher.maxDiscount.toLocaleString()).replace("{currency}", "NGN")}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{translate(locale, "vouchers.card.usage").replace("{count}", voucher.usedCount.toString()).replace("{total}", voucher.maxUsage.toString())}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{translate(locale, "vouchers.card.expires").replace("{date}", formatDate(voucher.validUntil))}</span>
                          </div>
                        </div>

                        {/* Description */}
                        {voucher.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {voucher.description}
                            </p>
                          </div>
                        )}

                        {/* Terms */}
                        {voucher.terms && (
                          <details className="group mb-4">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                              {translate(locale, "vouchers.card.terms")}
                            </summary>
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              {voucher.terms}
                            </p>
                          </details>
                        )}

                        {/* Usage Instructions */}
                        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                            {translate(locale, "vouchers.card.instructions")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Used Vouchers Tab */}
          {activeTab === 'used' && (
            <>
              {usedVouchers.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {translate(locale, "vouchers.empty.usedTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {translate(locale, "vouchers.empty.usedDesc")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usedVouchers.map((voucher: any) => (
                    <div
                      key={voucher._id}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-md"
                    >
                      {/* Used Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">
                          {translate(locale, "vouchers.tabs.used").split("(")[0].trim()}
                        </span>
                      </div>

                      {/* Voucher Code */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {translate(locale, "vouchers.card.codeLabel")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {translate(locale, "voucher.applied")}
                          </span>
                        </div>
                        <div className="font-mono text-lg font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                          {voucher.code}
                        </div>
                      </div>

                      {/* Voucher Type & Value */}
                      <div className="mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getVoucherColor(voucher.type)} text-white text-sm font-semibold mb-2`}>
                          <Tag className="w-3.5 h-3.5" />
                          {getVoucherTypeLabel(voucher.type)}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {getVoucherValue(voucher)}
                          {voucher.discountApplied && (
                            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                              {translate(locale, "vouchers.card.saved").replace("{amount}", voucher.discountApplied.toLocaleString()).replace("{currency}", "NGN")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Usage Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{translate(locale, "vouchers.tabs.used").split("(")[0].trim()}: {formatDate(voucher.usedAt)}</span>
                        </div>

                        {voucher.description && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Info className="w-3.5 h-3.5" />
                            <span>{voucher.description}</span>
                          </div>
                        )}
                      </div>

                      {/* Success Message */}
                      <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-700 dark:text-green-300 text-center">
                          ✓ {translate(locale, "vouchers.card.appliedSuccessfully")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Usage History Tab */}
          {activeTab === 'history' && (
            <>
              {voucherUsage.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {translate(locale, "vouchers.empty.historyTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {translate(locale, "vouchers.empty.historyDesc")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {voucherUsage.map((usage: VoucherUsage, index: number) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getVoucherColor(usage.type)}`}>
                            <Tag className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                              {usage.code}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {getVoucherTypeLabel(usage.type)} - {usage.value}{usage.type === 'percentage' ? '%' : ' NGN'} {translate(locale, "voucher.off")}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            -NGN {usage.discountApplied.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(usage.usedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">{translate(locale, "vouchers.history.orderTotal")}</span>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            NGN {usage.orderTotal.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">{translate(locale, "vouchers.history.discountApplied")}</span>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            NGN {usage.discountApplied.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">{translate(locale, "vouchers.history.finalAmount")}</span>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            NGN {(usage.orderTotal - usage.discountApplied).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Info className="w-4 h-4" />
              <span>
                {translate(locale, "vouchers.footer")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}