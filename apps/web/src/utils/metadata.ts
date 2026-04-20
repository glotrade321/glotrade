import { Metadata } from 'next';

export const defaultMetadata = {
    siteName: 'GloTrade',
    siteUrl: 'https://glotrade.online',
    defaultTitle: 'GloTrade - Your Trusted African E-Commerce Marketplace',
    defaultDescription: 'Shop the best products across Africa with GloTrade. Secure payments, fast delivery, and quality guaranteed.',
    defaultImage: '/glotrade_logo.png',
};

export function generatePageMetadata({
    title,
    description,
    image,
    path = '',
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string;
    path?: string;
    noIndex?: boolean;
}): Metadata {
    const pageTitle = title ? `${title} | ${defaultMetadata.siteName}` : defaultMetadata.defaultTitle;
    const pageDescription = description || defaultMetadata.defaultDescription;
    const pageImage = image || defaultMetadata.defaultImage;
    const pageUrl = `${defaultMetadata.siteUrl}${path}`;

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: pageUrl,
            siteName: defaultMetadata.siteName,
            images: [
                {
                    url: pageImage,
                    width: 1200,
                    height: 630,
                    alt: title || defaultMetadata.siteName,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            images: [pageImage],
        },
        robots: noIndex
            ? {
                index: false,
                follow: false,
            }
            : {
                index: true,
                follow: true,
            },
    };
}

export function generateProductMetadata({
    title,
    description,
    price,
    currency,
    image,
    productId,
}: {
    title: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    productId: string;
}): Metadata {
    const pageUrl = `${defaultMetadata.siteUrl}/products/${productId}`;

    return {
        title: `${title} | ${defaultMetadata.siteName}`,
        description: description,
        openGraph: {
            title: title,
            description: description,
            url: pageUrl,
            siteName: defaultMetadata.siteName,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [image],
        },
    };
}

// Structured Data (JSON-LD) helpers
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: defaultMetadata.siteName,
        url: defaultMetadata.siteUrl,
        logo: `${defaultMetadata.siteUrl}${defaultMetadata.defaultImage}`,
        sameAs: [
            'https://www.youtube.com/@GLOTRADE.online/videos',
            'https://www.instagram.com/glotrade_platform?igsh=cXJ6c2t6cGU2NzFq',
            'https://www.tiktok.com/@glotradeproducts?_r=1&_t=ZS-95hYR9R3X1N',
            'https://www.facebook.com/share/18cWJ3yrjz/?mibextid=wwXIfr',
            'https://x.com/glotradeproduct?s=21',
        ],
    };
}

export function generateProductSchema({
    name,
    description,
    image,
    price,
    currency,
    availability,
    brand,
    rating,
    reviewCount,
}: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    brand?: string;
    rating?: number;
    reviewCount?: number;
}) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image,
        offers: {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
            availability: `https://schema.org/${availability}`,
            url: defaultMetadata.siteUrl,
        },
    };

    if (brand) {
        schema.brand = {
            '@type': 'Brand',
            name: brand,
        };
    }

    if (rating && reviewCount) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: reviewCount,
        };
    }

    return schema;
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${defaultMetadata.siteUrl}${item.url}`,
        })),
    };
}
