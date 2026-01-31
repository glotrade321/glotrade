"use client";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/app/marketplace/ProductCard";
import type { ProductCardData } from "@/types/product";
import { getStoredLocale, Locale, translate } from "@/utils/i18n";
import { apiGet } from "@/utils/api";

type Category = { _id: string; name: string; slug: string; parentId?: string };
type CategoriesResponse = { status: string; data: Category[] };
type Product = { _id: string; title: string; price: number; currency: string; images?: string[]; brand?: string; discount?: number; rating?: number; category?: string };

export default function HomeCategoryCascade({ items }: { items: Product[] }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [l1, setL1] = useState<Category | undefined>();
  const [l2, setL2] = useState<Category | undefined>();
  const [l3, setL3] = useState<Category | undefined>();
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

  useEffect(() => {
    async function run() {
      try {
        const json = await apiGet<CategoriesResponse>(`/api/v1/market/categories`);
        setCategories(json.data || []);
      } catch { setCategories([]); }
    }
    run();
  }, []);

  const level1 = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const childrenMap = useMemo(() => {
    const map: Record<string, Category[]> = {};
    categories.forEach((c) => { if (c.parentId) { map[c.parentId] = map[c.parentId] || []; map[c.parentId].push(c); } });
    return map;
  }, [categories]);
  const level2 = l1 ? childrenMap[l1.slug] || [] : [];
  const level3 = l2 ? childrenMap[l2.slug] || [] : [];

  // Compute allowed category names for current selection (handles parent levels by including descendants)
  const allowedCategoryNames = useMemo(() => {
    const collectDescendantNames = (cat?: Category): Set<string> => {
      const names = new Set<string>();
      if (!cat) return names;
      names.add(cat.name);
      const stack: Category[] = [...(childrenMap[cat.slug] || [])];
      while (stack.length) {
        const current = stack.pop()!;
        names.add(current.name);
        const kids = childrenMap[current.slug] || [];
        kids.forEach((k) => stack.push(k));
      }
      return names;
    };

    if (l3) return new Set<string>([l3.name]);
    if (l2) return collectDescendantNames(l2);
    if (l1) return collectDescendantNames(l1);
    return undefined; // no filtering
  }, [l1, l2, l3, childrenMap]);

  const filtered = useMemo(() => {
    if (!allowedCategoryNames) return items;
    return items.filter((p) => (p.category ? allowedCategoryNames.has(p.category) : false));
  }, [items, allowedCategoryNames]);

  const pill = (active: boolean) => `px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${active ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "border-neutral-300 dark:border-neutral-700"}`;

  return (
    <section className="mb-6">
      {/* Level 1 */}
      <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing">
        <button className={pill(!l1)} onClick={() => { setL1(undefined); setL2(undefined); setL3(undefined); }}>{translate(locale, "common.all")}</button>
        {level1.map((c) => (
          <button key={c._id} onClick={() => { setL1(c); setL2(undefined); setL3(undefined); }} className={pill(l1?.slug === c.slug)}>{c.name}</button>
        ))}
      </div>

      {/* Level 2 */}
      {l1 && level2.length > 0 ? (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing">
          <button className={pill(!l2)} onClick={() => { setL2(undefined); setL3(undefined); }}>{translate(locale, "common.all")}</button>
          {level2.map((c) => (
            <button key={c._id} onClick={() => { setL2(c); setL3(undefined); }} className={pill(l2?.slug === c.slug)}>{c.name}</button>
          ))}
        </div>
      ) : null}

      {/* Level 3 */}
      {l2 && level3.length > 0 ? (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing">
          <button className={pill(!l3)} onClick={() => setL3(undefined)}>{translate(locale, "common.all")}</button>
          {level3.map((c) => (
            <button key={c._id} onClick={() => setL3(c)} className={pill(l3?.slug === c.slug)}>{c.name}</button>
          ))}
        </div>
      ) : null}

      {/* Latest products (filtered client-side) */}
      <h2 className="mt-4 text-xl md:text-2xl font-semibold">{translate(locale, "common.latestProducts")}</h2>
      {filtered.length === 0 ? (
        <div className="text-sm text-neutral-500 mt-2">{translate(locale, "common.noProductsMatch")}</div>
      ) : (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}

