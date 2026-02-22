import ProductCard from "@/app/marketplace/ProductCard";
import { defaultLocale, Locale } from "@/utils/i18n";
import type { ProductCardData } from "@/types/product";
import { apiGet } from "@/utils/api";
import ProductFilters from "@/components/filters/ProductFilters";
import DesktopQuickChips from "@/app/marketplace/DesktopQuickChips";
import MobileCategoryBrowser from "@/app/marketplace/MobileCategoryBrowser";
import MobileQuickChips from "@/app/marketplace/MobileQuickChips";
import DesktopCategoryTree from "@/app/marketplace/DesktopCategoryTree";
import Link from "next/link";
import StoreHeader from "./StoreHeader";

type Product = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  images?: string[];
  likes?: number;
  featured?: boolean;
  brand?: string;
  discount?: number;
  rating?: number;
  shippingOptions?: { method: string; cost: number; estimatedDays: number }[];
};

type SellerResponse = { status: string; data: any };
type ProductsResponse = { status: string; data: Product[] };
type Category = { _id: string; name: string; slug: string; parentId?: string };
type CategoriesResponse = { status: string; data: Category[] };

export default async function StorefrontPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = defaultLocale as Locale;

  const selectedCategory = sp?.category;
  const minPrice = sp?.minPrice;
  const maxPrice = sp?.maxPrice;
  const condition = sp?.condition;
  const sort = sp?.sort;
  const ratingMin = sp?.ratingMin;
  const verifiedSeller = sp?.verifiedSeller;
  const freeShipping = sp?.freeShipping;
  const etaMaxDays = sp?.etaMaxDays;
  const discountMin = sp?.discountMin;
  const attributeEntries = Object.entries(sp || {}).filter(([k, v]) => k.startsWith("attr_") && v !== "");
  const attributeQuery: Record<string, string> = Object.fromEntries(attributeEntries as [string, string][]);

  const sellerRes = await apiGet<SellerResponse>(`/api/v1/sellers/${encodeURIComponent(slug)}`).catch(() => ({ status: 'success', data: null } as SellerResponse));
  const seller = sellerRes.data;
  // Fetch categories and products via search, scoped to seller
  const [categoriesRes, searchRes] = await Promise.all([
    apiGet<CategoriesResponse>(`/api/v1/market/categories`).catch(() => ({ status: 'success', data: [] } as CategoriesResponse)),
    apiGet<{ status: string; data: { products: Product[]; total: number } }>(`/api/v1/sellers/${encodeURIComponent(slug)}/search`, { query: { category: selectedCategory, minPrice, maxPrice, condition, sort, ratingMin, verifiedSeller, freeShipping, etaMaxDays, discountMin, ...attributeQuery, limit: 30 } }).catch(() => ({ status: 'success', data: { products: [], total: 0 } })),
  ]);
  const categories = categoriesRes.data || [];
  const products: Product[] = (searchRes.data?.products as any) || [];
  const itemsCount = products.length;

  return (
    <div className="w-full max-w-none mx-auto">
      <StoreHeader slug={slug} seller={seller} itemsCount={itemsCount} />
      <div className="px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              {/* <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-3"> */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* <img src={seller?.logoUrl || 'https://placehold.co/80x80?text=Logo'} alt="logo" className="h-12 w-12 rounded object-cover" />
                <div>
                  <div className="font-semibold">{seller?.name || slug}</div>
                  <div className="text-xs text-neutral-500">{seller?.country || ''}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">{seller?.description || '—'}</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                <span>{Array.isArray((seller as any)?.followers) ? (seller as any).followers.length : 0} followers</span>
                <span>•</span>
                <Link href={`/s/${slug}/about`} className="hover:underline">About store</Link>
              </div>
            </div> */}

              <DesktopCategoryTree categories={categories} params={sp} selectedCategoryName={selectedCategory} basePath={`/s/${slug}`} locale={locale} />

              {/* Reuse marketplace filters, but scoped to this seller via query param handling on API side (soon). */}
              <ProductFilters basePath={`/s/${slug}`} params={sp} selectedCategory={sp?.category} minPrice={sp?.minPrice} maxPrice={sp?.maxPrice} condition={sp?.condition} sort={sp?.sort} locale={locale} variant="desktop" />
            </div>
          </aside>

          <main>
            <DesktopQuickChips params={sp} basePath={`/s/${slug}`} locale={locale} />
            <div className="lg:hidden mb-4 space-y-3 sticky top-16 z-20 bg-white dark:bg-neutral-950 py-2">
              <MobileCategoryBrowser categories={categories} params={sp} selectedCategoryName={selectedCategory} basePath={`/s/${slug}`} locale={locale} />
              <MobileQuickChips params={sp} basePath={`/s/${slug}`} locale={locale} />
              <ProductFilters basePath={`/s/${slug}`} params={sp} selectedCategory={selectedCategory} minPrice={minPrice} maxPrice={maxPrice} condition={condition} sort={sort} locale={locale} variant="mobile" />
            </div>

            {products.length === 0 ? (
              <div className="text-sm text-neutral-500">No products yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
