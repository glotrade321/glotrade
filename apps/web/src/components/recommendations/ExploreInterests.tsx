"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/app/marketplace/ProductCard";
import type { ProductCardData } from "@/types/product";
import { translate, Locale } from "@/utils/i18n";
import { apiGet } from "@/utils/api";

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

export default function ExploreInterests({ productId, seedBrand, seedCategory, locale }: { productId: string; seedBrand?: string; seedCategory?: string; locale: Locale }) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // collect lightweight personalization hints
  const hints = useMemo(() => {
    try {
      const recentBrands: string[] = JSON.parse(localStorage.getItem("recentBrands") || "[]");
      const recentCategories: string[] = JSON.parse(localStorage.getItem("recentCategories") || "[]");
      const mergedBrands = Array.from(new Set([...(seedBrand ? [seedBrand] : []), ...recentBrands]));
      const mergedCategories = Array.from(new Set([...(seedCategory ? [seedCategory] : []), ...recentCategories]));
      // persist merges
      localStorage.setItem("recentBrands", JSON.stringify(mergedBrands.slice(0, 10)));
      localStorage.setItem("recentCategories", JSON.stringify(mergedCategories.slice(0, 10)));
      return {
        recentBrands: mergedBrands.slice(0, 5),
        recentCategories: mergedCategories.slice(0, 5),
      };
    } catch {
      return { recentBrands: [], recentCategories: [] };
    }
  }, [seedBrand, seedCategory]);

  useEffect(() => {
    let aborted = false;
    async function run() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({ limit: "12" });
        if (hints.recentBrands.length) queryParams.set("recentBrands", hints.recentBrands.join(","));
        if (hints.recentCategories.length) queryParams.set("recentCategories", hints.recentCategories.join(","));

        const json = await apiGet<any>(`/api/v1/market/products/${productId}/recommendations?${queryParams.toString()}`);
        if (!aborted) setItems(Array.isArray(json.data) ? json.data : []);
      } catch {
        if (!aborted) setItems([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [productId, hints.recentBrands, hints.recentCategories]);

  if (loading || items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-semibold">{translate(locale, "product.exploreInterests")}</h2>
        <Link href="/marketplace" className="text-sm text-neutral-600 hover:underline">{translate(locale, "product.seeMore")}</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {items.map((p) => (
          <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
        ))}
      </div>
    </section>
  );
}
