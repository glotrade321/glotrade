"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { translate, Locale } from "@/utils/i18n";
import { formatCurrency } from "@/utils/format";

type BulkPricingTier = {
    minQuantity: number;
    maxQuantity?: number;
    pricePerUnit?: number;
    discountPercent?: number;
};

type Props = {
    productId: string;
    price: number;
    currency: string;
    tiers: BulkPricingTier[];
    locale: Locale;
};

function readCart(): string[] {
    try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
        return [];
    }
}

function writeCart(cart: string[]) {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: cart.length } }));
        }
    } catch { }
}

export default function BulkPricingTiers({ productId, price, currency, tiers, locale }: Props) {
    const [selectedTier, setSelectedTier] = useState<BulkPricingTier | null>(null);

    const handleTierClick = (tier: BulkPricingTier) => {
        setSelectedTier(tier);
    };

    const confirmUpdate = () => {
        if (selectedTier && typeof window !== "undefined") {
            const targetQty = selectedTier.minQuantity;
            const cart = readCart();
            const currentCount = cart.filter((id) => id === productId).length;

            // Update cart to match target quantity
            if (targetQty > currentCount) {
                const diff = targetQty - currentCount;
                cart.push(...Array.from({ length: diff }, () => productId));
            } else if (targetQty < currentCount) {
                let toRemove = currentCount - targetQty;
                for (let i = cart.length - 1; i >= 0 && toRemove > 0; i--) {
                    if (cart[i] === productId) {
                        cart.splice(i, 1);
                        toRemove--;
                    }
                }
            }

            writeCart(cart);

            // Notify other components to update their UI
            window.dispatchEvent(new CustomEvent("cart:qty", { detail: { productId, qty: targetQty } }));
        }
        setSelectedTier(null);
    };

    return (
        <>
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {translate(locale, "bulk.pricingTitle")}
                </h3>
                <div className="space-y-2">
                    {tiers.map((tier, idx) => {
                        const quantityRange = tier.maxQuantity
                            ? `${tier.minQuantity}-${tier.maxQuantity}`
                            : `${tier.minQuantity}+`;

                        let priceDisplay = '';
                        let savingsDisplay = '';

                        if (tier.pricePerUnit !== undefined && tier.pricePerUnit >= 0) {
                            const savings = price - tier.pricePerUnit;
                            const savingsPercent = ((savings / price) * 100).toFixed(0);
                            priceDisplay = `${currency} ${formatCurrency(tier.pricePerUnit)} ${translate(locale, "bulk.each")}`;
                            savingsDisplay = `${translate(locale, "bulk.save")} ${savingsPercent}%`;
                        } else if (tier.discountPercent !== undefined && tier.discountPercent > 0) {
                            const effectivePrice = price * (1 - tier.discountPercent / 100);
                            priceDisplay = `${currency} ${formatCurrency(effectivePrice)} ${translate(locale, "bulk.each")}`;
                            savingsDisplay = `${tier.discountPercent}% ${translate(locale, "product.off")}`;
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleTierClick(tier)}
                                className="w-full flex items-center justify-between text-xs sm:text-sm py-1.5 px-2 rounded bg-white dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer text-left"
                            >
                                <span className="font-medium text-blue-900 dark:text-blue-100">{quantityRange} {translate(locale, "bulk.units")}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-700 dark:text-blue-300">{priceDisplay}</span>
                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                                        {savingsDisplay}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Confirmation Modal */}
            {selectedTier && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTier(null)}>
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "bulk.modalTitle")}</h3>
                            </div>
                            <button onClick={() => setSelectedTier(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            {translate(locale, "bulk.modalDesc").replace("{qty}", String(selectedTier.minQuantity))}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedTier(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                            >
                                {translate(locale, "bulk.cancel")}
                            </button>
                            <button
                                onClick={confirmUpdate}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                {translate(locale, "bulk.addToCart")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
