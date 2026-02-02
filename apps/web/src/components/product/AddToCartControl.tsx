"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { translate, Locale } from "@/utils/i18n";

type Props = {
  productId: string;
  variantLabel?: string;
  minQty?: number;
  maxQty?: number;
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

// Auto-scrolling text component for variant labels (inspired by SecurityBanner)
function AutoScrollText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  // Check if text is likely to overflow (simple heuristic)
  const isLongText = text.length > 15;

  if (!isLongText) {
    // Short text - display normally
    return (
      <div className={className} title={text}>
        {text}
      </div>
    );
  }

  // Long text - use smooth scrolling with duplicated content
  return (
    <div className="relative overflow-hidden" style={{ maxWidth: '120px' }} title={text}>
      <div className="flex animate-scroll gap-4 whitespace-nowrap">
        <span className={className}>{text}</span>
        <span className={className}>{text}</span>
      </div>
    </div>
  );
}

export default function AddToCartControl({ productId, variantLabel, minQty = 1, maxQty = 5, locale }: Props) {
  const [qty, setQty] = useState<number>(0);
  const [pendingQty, setPendingQty] = useState<number | null>(null);
  const MIN_QTY = Math.max(1, Number(minQty));
  const MAX_QTY = Math.max(MIN_QTY, Number(maxQty));
  const [showMaxToast, setShowMaxToast] = useState<boolean>(false);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  const triggerMaxToast = () => {
    try { if (toastTimer) clearTimeout(toastTimer); } catch { }
    setShowMaxToast(true);
    toastTimer = setTimeout(() => setShowMaxToast(false), 1800);
  };

  useEffect(() => {
    try {
      const cart = readCart();
      const count = cart.filter((id) => id === productId).length;
      setQty(count);
    } catch { }
    // Stay in sync with external qty changes (e.g., QtySelectControl)
    const onPending = (e: Event) => {
      const detail = (e as CustomEvent).detail as { productId: string; qty: number };
      if (detail.productId !== productId) return;
      if (qty === 0) {
        // Control closed: remember pending qty, don't commit yet
        setPendingQty(detail.qty);
      } else {
        // Control open: commit immediately and sync everywhere
        setQuantity(Math.max(0, Math.min(MAX_QTY, detail.qty)));
      }
    };
    const onVariant = (e: Event) => {
      const detail = (e as CustomEvent).detail as { productId: string; label: string };
      if (detail.productId !== productId) return;
      try {
        const el = document.getElementById(`variant-label-${productId}`);
        if (el) el.textContent = detail.label;
      } catch { }
    };
    const onQty = (e: Event) => {
      const detail = (e as CustomEvent).detail as { productId: string; qty: number };
      if (detail.productId === productId) {
        setQty(detail.qty);
        // Also clear pending qty if any, as we have a definitive update
        setPendingQty(null);
      }
    };
    window.addEventListener("cart:pendingQty", onPending as EventListener);
    window.addEventListener("product:variantLabel", onVariant as EventListener);
    window.addEventListener("cart:qty", onQty as EventListener);
    return () => {
      window.removeEventListener("cart:pendingQty", onPending as EventListener);
      window.removeEventListener("product:variantLabel", onVariant as EventListener);
      window.removeEventListener("cart:qty", onQty as EventListener);
    };
  }, [productId, qty]);

  const setQuantity = (nextQty: number) => {
    const bounded = Math.max(0, Math.min(MAX_QTY, nextQty));
    if (nextQty > MAX_QTY) triggerMaxToast();
    // Don't allow going below MIN_QTY when cart is open
    if (qty > 0 && bounded > 0 && bounded < MIN_QTY) {
      return; // Prevent decrementing below MOQ
    }
    setQty(bounded);
    const cart = readCart();
    const currentCount = cart.filter((id) => id === productId).length;
    if (bounded > currentCount) {
      const diff = bounded - currentCount;
      cart.push(...Array.from({ length: diff }, () => productId));
      writeCart(cart);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:qty", { detail: { productId, qty: bounded } }));
      }
      return;
    }
    if (bounded < currentCount) {
      let toRemove = currentCount - bounded;
      for (let i = cart.length - 1; i >= 0 && toRemove > 0; i--) {
        if (cart[i] === productId) {
          cart.splice(i, 1);
          toRemove--;
        }
      }
      writeCart(cart);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:qty", { detail: { productId, qty: bounded } }));
      }
    }
  };

  if (qty === 0) {
    if (MAX_QTY <= 0) {
      return (
        <button className="flex justify-center w-full md:w-[70%] inline-flex items-center gap-2 rounded-full bg-neutral-300 text-neutral-600 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold cursor-not-allowed" disabled>
          {translate(locale, "product.outOfStock")}
        </button>
      );
    }
    return (
      <button
        className="flex justify-center w-full md:w-[70%] inline-flex items-center gap-2 rounded-full bg-orange-500 text-white px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold hover:bg-orange-600 active:bg-orange-700 transition-colors"
        onClick={() => {
          // If user preselected a pending qty, honor it; else start at MIN_QTY
          setQuantity(Math.max(MIN_QTY, Math.min(MAX_QTY, pendingQty || MIN_QTY)));
          setPendingQty(null);
        }}
      >
        <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
        {translate(locale, "product.addToCart")}
      </button>
    );
  }

  return (
    <div className="flex flex-row items-center gap-2 sm:gap-4 overflow-hidden">
      <div className="flex-1 sm:flex-none flex items-center justify-between gap-1 sm:gap-6 rounded-full border border-neutral-300 dark:border-neutral-700 px-2 sm:px-3 py-1 sm:py-1.5 select-none bg-white dark:bg-neutral-900">
        <button
          aria-label="Decrease"
          onClick={() => setQuantity(Math.max(0, qty - 1))}
          className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-1 transition-colors"
        >
          <Minus size={16} className="sm:w-5 sm:h-5" />
        </button>
        <div className="flex flex-col items-center justify-center min-w-[40px]">
          <div className="text-[10px] sm:text-xs font-bold leading-none">{qty}</div>
          <div className="text-[8px] sm:text-[10px] text-neutral-500 uppercase font-medium leading-none mt-0.5">{translate(locale, "product.added")}</div>
        </div>
        <button
          aria-label="Increase"
          onClick={() => setQuantity(qty + 1)}
          className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-1 transition-colors"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
      <Link
        href="/cart"
        className="flex-shrink-0 inline-flex justify-center items-center rounded-full bg-orange-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold hover:bg-orange-600 active:bg-orange-700 transition"
      >
        {translate(locale, "product.goToCart")}
      </Link>
      {showMaxToast ? (
        <div className="fixed left-1/2 bottom-20 -translate-x-1/2 z-50 pointer-events-none" aria-live="polite">
          <div className="rounded-full bg-black/85 text-white px-3 py-1.5 text-xs shadow-xl backdrop-blur-sm">
            {translate(locale, "product.maxLimit")}
          </div>
        </div>
      ) : null}
    </div>
  );
}

