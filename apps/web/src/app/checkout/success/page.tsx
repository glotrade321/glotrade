"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStoredLocale, translate, Locale, defaultLocale } from "@/utils/i18n";
import { apiGet } from "@/utils/api";
import { CheckCircle, ShoppingBag, Package, Building2, Copy, Check, MessageSquare } from "lucide-react";

function CheckoutSuccessForm() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const method = params.get("method");
  const amountParam = params.get("amount");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);
  const [bankConfig, setBankConfig] = useState<{
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    whatsappNumber: string;
  }>({
    bankName: "Wema Bank",
    bankAccountName: "GloTrade Platform Limited",
    bankAccountNumber: "0127131496",
    whatsappNumber: "2347044600924",
  });

  useEffect(() => {
    setLocale(getStoredLocale());
    setIsLoggedIn(!!localStorage.getItem("afritrade:auth"));

    // Listen for locale changes
    const handleLocaleChange = (e: CustomEvent) => {
      setLocale(e.detail.locale);
    };
    window.addEventListener('i18n:locale', handleLocaleChange as EventListener);
    return () => window.removeEventListener('i18n:locale', handleLocaleChange as EventListener);
  }, []);

  // Fetch bank details config for bank transfer orders
  useEffect(() => {
    if (method === "bank_transfer") {
      apiGet<any>("/api/v1/bazaar/config")
        .then((res) => {
          if (res?.data) {
            const rawWa = (res.data.whatsappNumber || "").replace(/[^0-9]/g, "");
            setBankConfig({
              bankName: res.data.bankName || "Wema Bank",
              bankAccountName: res.data.bankAccountName || "GloTrade Platform Limited",
              bankAccountNumber: res.data.bankAccountNumber || "0127131496",
              whatsappNumber: rawWa && !rawWa.includes("8000000000") ? rawWa : "2347044600924",
            });
          }
        })
        .catch(() => {});
    }
  }, [method]);

  // Clear cart on successful checkout
  useEffect(() => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: 0 } }));
  }, []);

  const isBankTransfer = method === "bank_transfer";

  // Pre-filled WhatsApp message for this order
  const waMsg = `Hi GloTrade Team, I have placed an order via Bank Transfer:
- Order Ref: #${orderId || ''}
${amountParam ? `- Amount: ₦${Number(amountParam).toLocaleString("en-NG")}\n` : ''}
I have attached my payment receipt/proof of transfer. Please confirm and process my order!`;

  const waUrl = `https://wa.me/${bankConfig.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMsg)}`;

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse ${
                  isBankTransfer ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-blue-600 to-blue-500"
                }`}
              ></div>
              <div
                className={`relative rounded-full p-4 ${
                  isBankTransfer ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-blue-600 to-blue-500"
                }`}
              >
                {isBankTransfer ? (
                  <Building2 className="text-white" size={44} />
                ) : (
                  <CheckCircle className="text-white" size={48} />
                )}
              </div>
            </div>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold bg-clip-text text-transparent mb-2 ${
              isBankTransfer
                ? "bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400"
                : "bg-gradient-to-r from-blue-600 to-blue-500"
            }`}
          >
            {isBankTransfer ? "Order Placed — Pending Transfer Verification" : translate(locale, "cart.success.title")}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
            {isBankTransfer
              ? "Your items and stock are reserved! Please transfer the payment to our official bank account and send your receipt on WhatsApp to begin dispatch."
              : translate(locale, "cart.success.description")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          {/* Order ID Section */}
          {orderId && (
            <div
              className={`mb-6 p-4 rounded-xl border ${
                isBankTransfer
                  ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50"
                  : "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package
                  className={`h-5 w-5 flex-shrink-0 ${
                    isBankTransfer ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                    {translate(locale, "cart.success.orderId")}
                  </p>
                  <p
                    className={`font-mono text-sm font-bold ${
                      isBankTransfer ? "text-amber-700 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    #{orderId}
                  </p>
                </div>
                {amountParam && (
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Total Payable</p>
                    <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      ₦{Number(amountParam).toLocaleString("en-NG")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bank Transfer Details Box (if method === bank_transfer) */}
          {isBankTransfer && (
            <div className="mb-6 space-y-3">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-neutral-800 dark:to-neutral-900 border border-amber-300 dark:border-amber-700/60 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={15} className="text-amber-600" />
                    GloTrade Official Bank Account
                  </span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 rounded-full">
                    Transfer Beneficiary
                  </span>
                </div>

                <div className="bg-white dark:bg-neutral-950 p-3 rounded-lg border border-amber-200/80 dark:border-neutral-800 space-y-2">
                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                    <span>Bank Name:</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{bankConfig.bankName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                    <span>Account Name:</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{bankConfig.bankAccountName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span>Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                        {bankConfig.bankAccountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(bankConfig.bankAccountNumber);
                          setCopiedBankAcc(true);
                          setTimeout(() => setCopiedBankAcc(false), 2000);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 rounded transition-colors"
                      >
                        {copiedBankAcc ? (
                          <>
                            <Check size={13} className="text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug pt-1">
                  Once your transfer is completed, click the button below to send your transfer screenshot or receipt to our WhatsApp support team for immediate verification.
                </p>
              </div>

              {/* Direct WhatsApp Action Button */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquare size={18} />
                <span>Open WhatsApp to Send Payment Proof</span>
              </a>
            </div>
          )}

          {!isBankTransfer && (
            /* Standard Success Message */
            <div className="mb-6 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {translate(locale, "cart.success.message")}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {isLoggedIn && (
              <Link
                href={`/orders/${orderId ?? ""}`}
                className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-semibold py-3 rounded-lg shadow transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Package className="h-5 w-5" />
                <span>{translate(locale, "cart.success.viewOrder")}</span>
              </Link>
            )}

            <Link
              href="/"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold py-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{translate(locale, "cart.success.continueShopping")}</span>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {translate(locale, "cart.success.needHelp")}{" "}
            <Link href="/support" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              {translate(locale, "cart.success.contactSupport")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutSuccessForm />
    </Suspense>
  );
}

