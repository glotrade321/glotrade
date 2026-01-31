"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Check, Trash2 } from "lucide-react";
import { API_BASE_URL, apiGet } from "@/utils/api";
import ProductCard from "../marketplace/ProductCard";
import type { ProductCardData } from "@/types/product";
import { getStoredLocale, translate, Locale } from "@/utils/i18n";

type ApiProduct = {
  _id: string;
  title: string;
  price: number;
  currency: string; // ATH label in UI, payments use NGN elsewhere
  discount?: number;
  images?: string[];
  brand?: string;
  seller?: string;
};

type ProductResponse = { status: string; data: ApiProduct };
type SearchResponse = { status: string; data: { products: ApiProduct[] } };

function readWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]) {
  try {
    localStorage.setItem("wishlist", JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("wishlist:update", { detail: { count: ids.length } }));
  } catch { }
}

export default function WishlistPage() {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState<ApiProduct[]>([]);
  const [locale, setLocale] = useState<Locale>("en");
  const hasItems = productIds.length > 0 && products.length > 0;

  useEffect(() => {
    setLocale(getStoredLocale());
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () => window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  useEffect(() => {
    let aborted = false;
    async function load() {
      setLoading(true);
      const ids = readWishlist();
      setProductIds(ids);
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
      } else {
        try {
          const results = await Promise.all(
            ids.map(async (id) => {
              const json = await apiGet<ProductResponse>(`/api/v1/market/products/${id}`);
              return json.data;
            })
          );
          if (!aborted) setProducts(results);
        } catch {
          if (!aborted) setProducts([]);
        } finally {
          if (!aborted) setLoading(false);
        }
      }

      // Picks: same strategy as Cart page (most viewed)
      try {
        const json = await apiGet<SearchResponse>(`/api/v1/market/products?sort=-views&limit=8`);
        if (!aborted) setPicks(Array.isArray(json.data?.products) ? json.data.products : []);
      } catch { }
    }
    load();
    return () => {
      aborted = true;
    };
  }, []);

  const clearAll = () => {
    writeWishlist([]);
    setProductIds([]);
    setProducts([]);
  };

  const removeOne = (id: string) => {
    const next = readWishlist().filter((x) => x !== id);
    writeWishlist(next);
    setProductIds(next);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  // Keep page in sync when user toggles wishlist on ProductCard
  useEffect(() => {
    let cancelled = false;
    async function syncFromStorage() {
      const ids = readWishlist();
      if (cancelled) return;
      setProductIds(ids);
      setProducts((prev) => prev.filter((p) => ids.includes(p._id)));
      const existing = new Set<string>(products.map((p) => p._id));
      const missing = ids.filter((id) => !existing.has(id));
      if (missing.length) {
        try {
          const results = await Promise.all(
            missing.map(async (id) => {
              const json = await apiGet<ProductResponse>(`/api/v1/market/products/${id}`);
              return json.data;
            })
          );
          if (!cancelled) setProducts((prev) => [...prev, ...results]);
        } catch { }
      }
    }
    const handler = () => { syncFromStorage(); };
    window.addEventListener("wishlist:update", handler as EventListener);
    return () => {
      cancelled = true;
      window.removeEventListener("wishlist:update", handler as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const discountedPrice = (p: ApiProduct) =>
    typeof p.discount === "number" && p.discount > 0
      ? Math.max(0, Math.round((p.price * (100 - p.discount)) / 100))
      : undefined;

  return (
    <main className="mx-auto md:w-[95%] w-full px-2 md:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="text-neutral-500 dark:text-neutral-400">{translate(locale, 'nav.home')}</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-500 dark:text-neutral-400">{translate(locale, 'wishlist.title')}</span>

      </nav>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h1 className="text-xl md:text-2xl font-semibold inline-flex items-center gap-2">
          <Heart size={22} className="text-rose-500" />
          {translate(locale, 'wishlist.title')}

        </h1>
        {hasItems ? (
          <div className="flex items-center gap-2">
            <button onClick={clearAll} className="text-sm rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              {translate(locale, 'wishlist.clearAll')}
            </button>
            <Link href="/marketplace" className="text-sm rounded-full bg-orange-500 text-white px-4 py-2">
              {translate(locale, 'wishlist.exploreMore')}
            </Link>
          </div>

        ) : null}
      </div>

      {/* Free Shipping Banner for consistency */}
      <div className="rounded border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 p-3 text-sm flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-200 text-[10px] sm:text-sm">
          <Check size={16} className="text-emerald-600" />
          {translate(locale, 'wishlist.freeShippingBanner')}
        </div>
        <div className="text-neutral-500 text-[10px] sm:text-sm">{translate(locale, 'wishlist.limitedTimeOffer')}</div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="text-sm text-neutral-500">{translate(locale, 'wishlist.loading')}</div>

      ) : !hasItems ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-800 p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-3">
            <Heart size={20} className="text-rose-500" />
          </div>
          <div className="text-lg font-semibold">{translate(locale, 'wishlist.empty.title')}</div>
          <p className="text-sm text-neutral-500 mt-1">{translate(locale, 'wishlist.empty.desc')}</p>
          <Link href="/marketplace" className="inline-flex items-center gap-2 mt-4 rounded-full bg-orange-500 text-white px-5 py-2.5">
            {translate(locale, 'wishlist.empty.cta')}
          </Link>

        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map((p) => (
            <div key={p._id} className="relative">
              <button
                aria-label="Remove from wishlist"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeOne(p._id); }}
                className="absolute right-2 bottom-2 z-20 inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500/95 text-neutral-700 shadow ring-1 ring-neutral-200"
                title="Remove"
              >
                <Trash2 size={12} className="text-white hover:h-4 hover:w-4 font-bold" />
              </button>
              <ProductCard product={p as unknown as ProductCardData} locale={locale} />
            </div>
          ))}
        </div>
      )}

      {/* Picks */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">{translate(locale, 'wishlist.picks.title')}</h2>
        {picks.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {picks.map((p) => (
              <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-500">{translate(locale, 'wishlist.picks.noPicks')}</div>
        )}
      </div>

    </main>
  );
}

