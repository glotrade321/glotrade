import { MetadataRoute } from 'next';
import { apiGet } from '@/utils/api';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    const baseUrl = 'https://glotrade.online';

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/marketplace`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/best-selling`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/support`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    // Fetch products for dynamic routes
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const productsRes = await apiGet<{ status: string; data: { products: any[] } }>(
            '/api/v1/market/products',
            { query: { limit: 1000 } }
        );

        if (productsRes.status === 'success' && Array.isArray(productsRes.data?.products)) {
            productRoutes = productsRes.data.products.map((product: any) => ({
                url: `${baseUrl}/marketplace/${product._id}`,
                lastModified: new Date(product.updatedAt || product.createdAt || Date.now()),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            }));
        }
    } catch (error) {
        console.error('Error fetching products for sitemap:', error);
    }

    // Fetch categories for dynamic routes
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categoriesRes = await apiGet<{ status: string; data: any }>(
            '/api/v1/market/categories'
        );

        const categories = Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : Array.isArray(categoriesRes.data?.categories)
                ? categoriesRes.data.categories
                : [];

        if (categoriesRes.status === 'success' && Array.isArray(categories)) {
            categoryRoutes = categories.map((category: any) => ({
                url: `${baseUrl}/marketplace?category=${encodeURIComponent(category.name || category.slug || '')}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error('Error fetching categories for sitemap:', error);
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
