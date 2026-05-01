"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/app/marketplace/ProductCard";
import type { ProductCardData } from "@/types/product";
import { getStoredLocale, Locale, translate } from "@/utils/i18n";
import { apiGet } from "@/utils/api";

type Category = { _id: string; name: string; slug: string; parentId?: string };
type CategoriesResponse = { status: string; data: Category[] };
type Product = { _id: string; title: string; price: number; currency: string; images?: string[]; brand?: string; discount?: number; rating?: number; category?: string };
type SearchResponse = { status: string; data: { products: Product[]; total: number; page: number; totalPages: number } };

const HOME_BATCH_SIZE = 24;
const HOME_AUTOLOAD_CAP = 72;
const HOME_MAX_VISIBLE = 72;

export default function HomeCategoryCascade({ items, initialTotalPages }: { items: Product[]; initialTotalPages: number }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [l1, setL1] = useState<Category | undefined>();
  const [l2, setL2] = useState<Category | undefined>();
  const [l3, setL3] = useState<Category | undefined>();
  const [locale, setLocale] = useState<Locale>("en");
  const [loadedItems, setLoadedItems] = useState<Product[]>(items);
  const [nextPage, setNextPage] = useState(2);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [autoloadStopped, setAutoloadStopped] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

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
    if (!allowedCategoryNames) return loadedItems;
    return loadedItems.filter((p) => (p.category ? allowedCategoryNames.has(p.category) : false));
  }, [loadedItems, allowedCategoryNames]);

  const activeCategory = l3?.slug || l2?.slug || l1?.slug;
  const shouldShowBrowseAll = autoloadStopped || filtered.length >= HOME_MAX_VISIBLE;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoadingMore(true);
      try {
        const query = {
          limit: HOME_BATCH_SIZE,
          page: 1,
          ...(activeCategory ? { category: activeCategory } : {}),
        };
        const json = await apiGet<SearchResponse>("/api/v1/market/products", { query });
        if (cancelled) return;
        const nextItems = Array.isArray(json.data?.products) ? json.data.products : [];
        const fetchedTotalPages = Number(json.data?.totalPages || 1);
        setLoadedItems(nextItems);
        setNextPage(2);
        setTotalPages(fetchedTotalPages);
        setHasMore(fetchedTotalPages > 1);
        setAutoloadStopped(false);
      } catch {
        if (cancelled) return;
        setLoadedItems([]);
        setNextPage(2);
        setTotalPages(1);
        setHasMore(false);
        setAutoloadStopped(false);
      } finally {
        if (!cancelled) {
          isLoadingRef.current = false;
          setIsLoadingMore(false);
        }
      }
    }

    if (activeCategory) {
      isLoadingRef.current = true;
      run();
      return () => { cancelled = true; };
    }

    setLoadedItems(items);
    setNextPage(2);
    setTotalPages(initialTotalPages);
    setHasMore(initialTotalPages > 1);
    setAutoloadStopped(false);
    return () => { cancelled = true; };
  }, [activeCategory, items, initialTotalPages]);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || autoloadStopped) return;
    if (loadedItems.length >= HOME_AUTOLOAD_CAP) {
      setAutoloadStopped(true);
      setHasMore(false);
      return;
    }
    if (nextPage > totalPages) {
      setHasMore(false);
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingMore(true);
    try {
      const query = {
        limit: HOME_BATCH_SIZE,
        page: nextPage,
        ...(activeCategory ? { category: activeCategory } : {}),
      };
      const json = await apiGet<SearchResponse>("/api/v1/market/products", { query });
      const nextItems = Array.isArray(json.data?.products) ? json.data.products : [];
      const fetchedTotalPages = Number(json.data?.totalPages || totalPages || 1);

      let mergedCount = loadedItems.length;
      setLoadedItems((current) => {
        const seen = new Set(current.map((item) => item._id));
        const merged = [...current];
        for (const item of nextItems) {
          if (!seen.has(item._id)) {
            seen.add(item._id);
            merged.push(item);
          }
        }
        mergedCount = merged.length;
        return merged;
      });

      const reachedCap = mergedCount >= HOME_AUTOLOAD_CAP;
      setTotalPages(fetchedTotalPages);
      setNextPage((current) => current + 1);
      setAutoloadStopped(reachedCap);
      setHasMore(!reachedCap && nextPage < fetchedTotalPages && nextItems.length > 0);
    } catch {
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [activeCategory, autoloadStopped, hasMore, loadedItems.length, nextPage, totalPages]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isLoadingMore || autoloadStopped) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        void loadMore();
      },
      { rootMargin: "900px 0px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [autoloadStopped, hasMore, isLoadingMore, loadMore]);

  const pill = (active: boolean) => `px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${active ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "border-neutral-300 dark:border-neutral-700"}`;
  const marketplaceHref = activeCategory ? `/marketplace?category=${encodeURIComponent(activeCategory)}` : "/marketplace";

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
        <>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.slice(0, HOME_MAX_VISIBLE).map((p) => (
              <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
          {isLoadingMore ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 opacity-80">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border border-neutral-200/70 bg-white/70 p-2.5 dark:border-neutral-800 dark:bg-neutral-900/60"
                >
                  <div className="aspect-square rounded-md bg-neutral-100/90 dark:bg-neutral-800/80 animate-pulse" />
                  <div className="mt-3 h-2.5 w-16 rounded-full bg-neutral-100/90 dark:bg-neutral-800/80 animate-pulse" />
                  <div className="mt-2 h-3.5 w-11/12 rounded-full bg-neutral-100/90 dark:bg-neutral-800/80 animate-pulse" />
                  <div className="mt-2 h-3.5 w-8/12 rounded-full bg-neutral-100/90 dark:bg-neutral-800/80 animate-pulse" />
                  <div className="mt-3 h-7 w-28 rounded-md bg-neutral-100/90 dark:bg-neutral-800/80 animate-pulse" />
                </div>
              ))}
            </div>
          ) : null}
          {shouldShowBrowseAll ? (
            <div className="mt-5 flex justify-center">
              <Link
                href={marketplaceHref}
                className="inline-flex items-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
              >
                {translate(locale, "home.seeMore")}
              </Link>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
