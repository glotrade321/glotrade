
export function getOptimizedImageUrl(src: string, options: { width?: number; height?: number; quality?: number; fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' } = {}) {
    if (!src) return '';

    // If it's already an absolute URL (e.g. from seed data or external), return as is
    // Unless it's our own R2 bucket URL which we might want to rewrite later
    if (src.startsWith('http')) return src;

    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.fit) params.set('fit', options.fit);

    const queryString = params.toString();
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/images/${encodeURIComponent(src)}${queryString ? `?${queryString}` : ''}`;
}
