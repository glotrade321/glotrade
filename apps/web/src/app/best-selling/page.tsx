import ProductCard from "../marketplace/ProductCard";
import type { ProductCardData } from "@/types/product";
import { apiGet } from "@/utils/api";
import Link from "next/link";
import CategorySelect from "@/components/best-selling/CategorySelect";
import { cookies } from "next/headers";
import { getStoredLocale, translate, Locale } from "@/utils/i18n";

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

type SearchResponse = { status: string; data: { products: Product[]; total: number; page: number; totalPages: number } };

export default async function BestSellingPage({ searchParams }: { searchParams: Promise<{ days?: string; category?: string }> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value || "en") as Locale;
  let items: Product[] = [];
  try {
    const query: Record<string, string | number> = { limit: 48, sort: "-views" };
    if (params?.days) query.createdSinceDays = Number(params.days);
    if (params?.category && params.category !== "Recommended") query.category = params.category;
    const res = await apiGet<SearchResponse>("/api/v1/market/products", { 
      query,
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    items = Array.isArray(res.data?.products) ? res.data.products : [];
  } catch { }

  const categories = await fetchCategories();
  const options = [
    { label: translate(locale, "bestSelling.filters.recommended"), value: "Recommended" },
    ...categories.map(c => ({ label: c, value: c }))
  ];

  return (
    <main className="mx-auto md:w-[95%] w-full px-2 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <h1 className="text-lg md:text-2xl font-semibold whitespace-nowrap shrink-0">{translate(locale, "bestSelling.title")}</h1>
          <div className="flex items-center gap-2 sm:ml-2 overflow-x-auto w-full min-w-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-2 sm:mt-0">
            {[
              { label: translate(locale, "bestSelling.filters.last30Days"), short: translate(locale, "bestSelling.filters.30d"), value: 30 },
              { label: translate(locale, "bestSelling.filters.last14Days"), short: translate(locale, "bestSelling.filters.14d"), value: 14 },
              { label: translate(locale, "bestSelling.filters.last7Days"), short: translate(locale, "bestSelling.filters.7d"), value: 7 },
            ].map((opt) => {
              const active = String(opt.value) === (params?.days || "30");
              const href = `/best-selling?days=${opt.value}${params?.category ? `&category=${encodeURIComponent(params.category)}` : ""}`;
              return (
                <Link
                  key={opt.value}
                  href={href}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs md:text-sm whitespace-nowrap shrink-0 ${active ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "border-neutral-300 dark:border-neutral-700"}`}
                >
                  <span className="md:hidden">{opt.short}</span>
                  <span className="hidden md:inline">{opt.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <CategorySelect
            current={params?.category || "Recommended"}
            days={params?.days || "30"}
            options={options}
            locale={locale}
          />
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-neutral-500">{translate(locale, "bestSelling.noProducts")}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
          ))}
        </div>
      )}
    </main>
  );
}

type Category = { _id: string; name: string; slug: string; parentId?: string };

async function fetchCategories(): Promise<string[]> {
  try {
    const json = await apiGet<{ status: string; data: Category[] }>("/api/v1/market/categories", {
      next: { revalidate: 3600 } // Revalidate every 1 hour
    });
    if (Array.isArray(json.data)) return json.data.map((c: Category) => c.name);
  } catch { }
  return [];
}

// client select moved to components/best-selling/CategorySelect.tsx

