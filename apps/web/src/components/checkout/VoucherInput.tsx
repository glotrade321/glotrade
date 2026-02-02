"use client";
import { useState, useEffect } from "react";
import { Ticket, X, Check, AlertCircle } from "lucide-react";
import { validateVoucher, recordVoucherUsage, AppliedVoucher, Voucher } from "@/utils/voucherApi";
import { getStoredLocale, translate, Locale } from "@/utils/i18n";
import { formatCurrency } from "@/utils/format";

interface VoucherInputProps {
  onVoucherApplied: (voucher: AppliedVoucher) => void;
  onVoucherRemoved: (voucherId: string) => void;
  appliedVouchers: AppliedVoucher[];
  orderAmount: number;
  productIds: string[];
}

export default function VoucherInput({
  onVoucherApplied,
  onVoucherRemoved,
  appliedVouchers,
  orderAmount,
  productIds
}: VoucherInputProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getStoredLocale());
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () => window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError(translate(locale, "voucher.errors.empty"));
      return;
    }

    // Check if voucher is already applied
    if (appliedVouchers.some(v => v.code.toLowerCase() === voucherCode.toLowerCase())) {
      setError(translate(locale, "voucher.errors.alreadyApplied"));
      return;
    }

    setIsValidating(true);
    setError("");
    setSuccess("");

    try {
      const result = await validateVoucher(voucherCode.trim(), orderAmount, productIds);

      if (result.isValid && result.voucher) {
        const discountAmount = result.discountAmount || 0;
        const appliedVoucher: AppliedVoucher = {
          id: result.voucher._id,
          code: result.voucher.code,
          type: result.voucher.type,
          value: result.voucher.value,
          discountAmount,
          description: result.voucher.description
        };

        // Record voucher usage immediately when applied
        try {
          await recordVoucherUsage(result.voucher.code);
          console.log('Voucher usage recorded successfully');
        } catch (recordError) {
          console.error('Failed to record voucher usage:', recordError);
          // Don't block the user from applying the voucher if recording fails
        }

        onVoucherApplied(appliedVoucher);
        setVoucherCode("");
        setSuccess(`${translate(locale, "voucher.applied")} ${discountAmount > 0 ? `₦${formatCurrency(discountAmount)} ${translate(locale, "voucher.off")}` : 'Discount applied'}`);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || translate(locale, "voucher.errors.invalid"));
      }
    } catch (error) {
      setError(translate(locale, "voucher.errors.failed"));
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = (voucherId: string) => {
    onVoucherRemoved(voucherId);
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return `% ${translate(locale, "voucher.off")}`;
      case 'fixed': return translate(locale, "voucher.off");
      case 'free_shipping': return translate(locale, "voucher.freeShipping");
      default: return translate(locale, "voucher.off");
    }
  };

  const getVoucherDisplayValue = (voucher: AppliedVoucher) => {
    switch (voucher.type) {
      case 'percentage': return `${voucher.value}%`;
      case 'fixed': return `₦${formatCurrency(voucher.value)}`;
      case 'free_shipping': return translate(locale, "voucher.free");
      default: return voucher.value;
    }
  };

  return (
    <div className="space-y-4">
      {/* Voucher Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Ticket size={16} className="text-neutral-500" />
          </div>
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            placeholder={translate(locale, "voucher.placeholder")}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-white"
            disabled={isValidating}
          />
        </div>
        <button
          onClick={handleApplyVoucher}
          disabled={isValidating || !voucherCode.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isValidating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {translate(locale, "voucher.applying")}
            </>
          ) : (
            <>
              <Check size={16} />
              {translate(locale, "voucher.apply")}
            </>
          )}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Applied Vouchers */}
      {appliedVouchers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {translate(locale, "voucher.appliedHeader")} ({appliedVouchers.length})
          </h4>
          {appliedVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <Ticket size={16} className="text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-green-800 dark:text-green-200">
                      {voucher.code}
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                      {getVoucherTypeLabel(voucher.type)}
                    </span>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    {getVoucherDisplayValue(voucher)} - {voucher.description || 'Discount applied'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-800 dark:text-green-200">
                  -₦{formatCurrency(voucher.discountAmount)}
                </span>
                <button
                  onClick={() => handleRemoveVoucher(voucher.id)}
                  className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 