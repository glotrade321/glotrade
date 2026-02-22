"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Star, Truck, BadgeCheck, Tag, Heart, ShoppingCart } from "lucide-react";
import type { ProductCardData } from "@/types/product";


import { translate, Locale } from "@/utils/i18n";
import { getOptimizedImageUrl } from "@/utils/image";
import { formatCurrency } from "@/utils/format";

export default function ProductCard({ product, locale }: { product: ProductCardData; locale: Locale }) {
  const p = product;
  const router = useRouter();
  const pathname = usePathname();
  const src = useMemo(() => {
    if (!p.images?.[0]) return `https://placehold.co/1200x675?text=${encodeURIComponent(p.title)}`;

    // Use our new optimizer! 
    // Requesting 400px width (2x for retina) with 80% quality
    return getOptimizedImageUrl(p.images[0], { width: 400, quality: 80 });
  }, [p.images, p.title]);

  const hasFreeShipping = p.shippingOptions?.some((s) => (s.cost ?? 0) === 0);
  const eta = p.shippingOptions?.reduce((min, s) =>
    typeof s.estimatedDays === 'number' && s.estimatedDays < min ? s.estimatedDays : min
    , Number.MAX_SAFE_INTEGER);
  const discounted = typeof p.discount === 'number' && p.discount > 0
    ? Math.max(0, Math.round((p.price * (100 - p.discount)) / 100))
    : undefined;

  const [inCart, setInCart] = useState(false);
  const [wished, setWished] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    try {
      const cart: string[] = JSON.parse(localStorage.getItem("cart") || "[]");
      setInCart(cart.includes(p._id));
      const wish: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWished(wish.includes(p._id));
    } catch { }
  }, [p._id]);

  const toggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const cart: string[] = JSON.parse(localStorage.getItem("cart") || "[]");
      const exists = cart.includes(p._id);

      if (exists) {
        // Remove all instances of this product
        const newCart = cart.filter((id) => id !== p._id);
        localStorage.setItem("cart", JSON.stringify(newCart));
        setInCart(false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: newCart.length } }));
        }
      } else {
        // Add minOrderQuantity instances
        const qty = Math.max(1, p.minOrderQuantity || 1);
        for (let i = 0; i < qty; i++) cart.push(p._id);
        localStorage.setItem("cart", JSON.stringify(cart));
        setInCart(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: cart.length } }));
        }
      }
    } catch { }
  };

  const toggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // require sign-in for both add and remove
      const rawUser = localStorage.getItem("afritrade:user") || localStorage.getItem("user");
      const me = rawUser ? JSON.parse(rawUser) : null;
      const uid = me?.id || me?._id || me?.userId || me?.user?.id || me?.user?._id || me?.address;
      if (!uid) { setShowAuth(true); return; }
      const wish: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const idx = wish.indexOf(p._id);
      if (idx >= 0) {
        wish.splice(idx, 1);
      } else {
        wish.push(p._id);
      }
      localStorage.setItem("wishlist", JSON.stringify(wish));
      setWished(idx < 0);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("wishlist:update", { detail: { count: wish.length } }));
      }
    } catch { }
  };

  return (
    <Link prefetch={false} href={`/marketplace/${p._id}`} className="group rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 sm:p-4 hover:shadow-sm transition-shadow h-full flex flex-col">
      <div className="aspect-square rounded-md bg-neutral-100 dark:bg-neutral-900 mb-2 sm:mb-3 overflow-hidden relative">
        {p.featured ? (
          <span className="absolute left-1 sm:left-2 top-1 sm:top-2 z-10 rounded bg-amber-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 flex items-center gap-0.5 sm:gap-1 shadow-sm">
            <Tag size={10} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">{translate(locale, "product.featured")}</span><span className="sm:hidden">★</span>
          </span>
        ) : null}
        {typeof p.discount === 'number' && p.discount > 0 ? (
          <span className="absolute right-1 sm:right-2 top-1 sm:top-2 z-10 rounded bg-rose-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 shadow-sm">-{p.discount}%</span>
        ) : null}
        <button
          aria-label={translate(locale, "product.ariaWishlist")}
          onClick={toggleWish}
          className={`absolute right-1 sm:right-2 bottom-1 sm:bottom-2 p-1.5 sm:p-2 rounded-full bg-white/90 text-rose-500 hover:scale-105 transition ring-1 z-10 pointer-events-auto ${wished ? 'ring-rose-500' : 'ring-transparent'}`}
        >
          <Heart size={14} className="sm:w-4 sm:h-4" fill={wished ? 'currentColor' : 'none'} />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={p.title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            // Fallback to original R2 URL if optimization fails
            if (p.images?.[0] && e.currentTarget.src !== p.images[0]) {
              e.currentTarget.src = p.images[0];
            }
          }}
          className="relative z-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
        />
      </div>
      {p.brand ? (
        <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500 mb-0.5 sm:mb-1">{p.brand}</div>
      ) : null}
      {p.minOrderQuantity && p.minOrderQuantity > 1 ? (
        <div className="text-[10px] sm:text-[11px] text-orange-600 dark:text-orange-400 font-medium mb-0.5 sm:mb-1">
          {translate(locale, "product.minOrder")}: {p.minOrderQuantity}
        </div>
      ) : null}
      <div className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight">{p.title}</div>

      {/* Price Section - Current and Original price on same level */}
      <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="inline-flex items-baseline bg-orange-500 text-white rounded px-1.5 sm:px-2 py-0.5">
            <span className="text-base sm:text-xl font-extrabold leading-none">{formatCurrency(discounted ?? p.price)}</span>
            <span className="text-[8px] sm:text-[10px] font-semibold ml-0.5 sm:ml-1 leading-none">{p.currency}</span>
          </div>
          {discounted !== undefined && (
            <div className="text-xs sm:text-sm text-neutral-500">
              <span className="line-through hidden sm:inline">{formatCurrency(p.price)}<span className="text-[8px] sm:text-[10px]">{p.currency}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Rating and Cart Section - Rating and Cart icon on same level */}
      <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
          {typeof p.rating === 'number' ? (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-black"><StarRating value={p.rating} /><span className="hidden sm:inline">{p.rating.toFixed(1)}</span></span>
          ) : null}
        </div>
        <button
          onClick={toggleCart}
          aria-label={inCart ? translate(locale, "product.ariaRemoveFromCart") : translate(locale, "product.ariaAddToCart")}
          className={`p-1.5 sm:p-2 rounded-full border transition ${inCart ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}
        >
          <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Shipping and Verification Section - Free shipping and Verified on same level */}
      <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
        {hasFreeShipping ? (
          <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-success/15 text-success px-1 sm:px-1.5 py-0.5 rounded"><Truck size={10} className="sm:w-3 sm:h-3" /><span className="hidden sm:inline">{translate(locale, "product.freeShipping")}</span><span className="sm:hidden">{translate(locale, "product.free")}</span></span>
        ) : (typeof eta === 'number' && eta !== Number.MAX_SAFE_INTEGER) ? (
          <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-info/15 text-info px-1 sm:px-1.5 py-0.5 rounded"><Truck size={10} className="sm:w-3 sm:h-3" />≤ {eta}d</span>
        ) : null}
      </div>
      {showAuth ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
          <div className="relative w-[92%] max-w-md rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-2xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
            <div className="mb-1 text-lg font-semibold">{translate(locale, "product.signInRequired")}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-300">{translate(locale, "product.signInToWishlist")}</div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { const next = encodeURIComponent(pathname || "/"); router.push(`/auth/login?next=${next}`); }} className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95">{translate(locale, "product.okSignIn")}</button>
              <button onClick={() => setShowAuth(false)} className="flex-1 rounded-full border px-4 py-2 text-sm">{translate(locale, "common.cancel")}</button>
            </div>
          </div>
        </div>
      ) : null}
    </Link>
  );
}

function StarRating({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const widthPct = (clamped / 5) * 100;
  const stars = Array.from({ length: 5 });
  return (
    <span className="relative inline-flex align-middle">
      <span className="inline-flex text-neutral-300">
        {stars.map((_, i) => (<Star key={`b-${i}`} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />))}
      </span>
      <span className="absolute top-0 left-0 overflow-hidden text-amber-500" style={{ width: `${widthPct}%` }}>
        <span className="inline-flex">
          {stars.map((_, i) => (<Star key={`f-${i}`} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />))}
        </span>
      </span>
    </span>
  );
}
