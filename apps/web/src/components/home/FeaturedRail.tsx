"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "@/app/marketplace/ProductCard";
import type { ProductCardData } from "@/types/product";
import { getStoredLocale, Locale, translate } from "@/utils/i18n";
import EmptyState from "../common/EmptyState";
import { ShoppingBag } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  images?: string[];
  brand?: string;
  discount?: number;
  rating?: number;
  category?: string;
};

export default function FeaturedRail() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  // lightweight interest hints from localStorage
  const hints = useMemo(() => {
    try {
      const recentBrands: string[] = JSON.parse(localStorage.getItem("recentBrands") || "[]");
      const recentCategories: string[] = JSON.parse(localStorage.getItem("recentCategories") || "[]");
      return {
        recentBrands: recentBrands.slice(0, 4),
        recentCategories: recentCategories.slice(0, 6),
      };
    } catch {
      return { recentBrands: [], recentCategories: [] };
    }
  }, []);

  useEffect(() => {
    let aborted = false;
    async function run() {
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const urls: URL[] = [];
      // 1) True featured by backend flag
      urls.push(new URL(`/api/v1/market/products/featured?limit=12`, base));
      // 2) Popular by views (different signal) with category/brand hints to diversify
      const u2 = new URL(`/api/v1/market/products`, base);
      u2.searchParams.set("limit", "24");
      u2.searchParams.set("sort", "-views");
      if (hints.recentBrands.length) u2.searchParams.set("brand", hints.recentBrands[0]);
      urls.push(u2);
      // 3) Discounted picks (deal-focused)
      const u3 = new URL(`/api/v1/market/products`, base);
      u3.searchParams.set("limit", "24");
      u3.searchParams.set("discountMin", "5");
      urls.push(u3);

      try {
        const resps = await Promise.all(urls.map((u) => fetch(u.toString(), { cache: "no-store" }).then(r => r.json()).catch(() => null)));
        const all: Product[] = [];
        for (const r of resps) {
          if (!r) continue;
          if (Array.isArray(r.data)) all.push(...(r.data as Product[]));
          if (r.data && Array.isArray(r.data.products)) all.push(...(r.data.products as Product[]));
        }
        // de-duplicate by id and diversify by category (max 2 per category)
        const seen = new Set<string>();
        const categoryCount = new Map<string, number>();
        const diversified: Product[] = [];
        for (const p of all) {
          if (!p || seen.has(p._id)) continue;
          const cat = p.category || "uncategorized";
          const count = categoryCount.get(cat) || 0;
          if (count >= 2) continue; // cap per category
          seen.add(p._id);
          categoryCount.set(cat, count + 1);
          diversified.push(p);
          if (diversified.length >= 12) break;
        }
        if (!aborted) setItems(diversified);
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => { aborted = true; };
  }, [hints.recentBrands, hints.recentCategories]);

  const railRef = useRef<HTMLDivElement | null>(null);
  // drag-to-scroll support
  useEffect(() => {
    const el = railRef.current; if (!el) return;
    let isDown = false; let startX = 0; let scrollLeft = 0;
    const down = (e: MouseEvent) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
    const leave = () => { isDown = false; };
    const up = () => { isDown = false; };
    const move = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; const walk = (x - startX); el.scrollLeft = scrollLeft - walk; };
    el.addEventListener("mousedown", down);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mouseup", up);
    el.addEventListener("mousemove", move);
    return () => { el.removeEventListener("mousedown", down); el.removeEventListener("mouseleave", leave); el.removeEventListener("mouseup", up); el.removeEventListener("mousemove", move); };
  }, []);


  if (loading) return (
    <div className="flex gap-4 overflow-hidden mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="min-w-[160px] h-[240px] rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      ))}
    </div>
  );

  if (items.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{translate(locale, "home.featuredForYou")}</h2>
        <EmptyState
          title="New Arrivals Coming Soon"
          description="We are stocking up our shelves with amazing products. Check back shortly!"
          icon={<ShoppingBag size={48} strokeWidth={1} />}
        />
      </section>
    );
  }

  return (
    <section className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold">{translate(locale, "home.featuredForYou")}</h2>
        <Link href="/marketplace?sort=-views" className="text-xs sm:text-sm text-neutral-600 hover:underline">{translate(locale, "home.seeMore")}</Link>
      </div>
      <div ref={railRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((p) => (
          <div key={p._id} className="min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] md:min-w-[220px] md:max-w-[220px] snap-start">
            <ProductCard product={p as unknown as ProductCardData} locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}

