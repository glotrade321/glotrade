// removed unused imports
import { apiGet } from "@/utils/api";
import FeaturedRail from "@/components/home/FeaturedRail";
import HomeCategoryCascade from "@/components/home/HomeCategoryCascade";
import SecurityBanner from "@/components/home/SecurityBanner";
import AdBanner from "@/components/home/AdBanner";

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

export default async function Home() {
  let items: Product[] = [];
  try {
    const res = await apiGet<SearchResponse>("/api/v1/market/products", { query: { limit: 24 }, next: { revalidate: 3600 } });
    items = Array.isArray(res.data?.products) ? res.data.products : [];
  } catch { }

  let banners: any[] = [];
  try {
    const bannerRes = await apiGet<{ status: string; data: { banners: any[] } }>("/api/v1/banners?active=true", { next: { revalidate: 3600 } });
    if (bannerRes.status === 'success') {
      banners = bannerRes.data.banners;
    }
  } catch { }

  return (
    <main className="mx-auto md:w-[95%] w-full px-2 md:px-6 py-6">
      <AdBanner banners={banners} />
      <SecurityBanner />
      <FeaturedRail />
      <HomeCategoryCascade items={items} />
    </main>
  );
}
