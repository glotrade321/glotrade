
export function getOptimizedImageUrl(src: string, options: { width?: number; height?: number; quality?: number; fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' } = {}) {
    if (!src) return '';

    let key = src;

    // If it's an R2 public URL, extract the key (path after the domain)
    if (src.startsWith('http')) {
        try {
            const url = new URL(src);
            // Extract everything after the domain (e.g., /products/abc/image.jpg -> products/abc/image.jpg)
            key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
        } catch {
            // If URL parsing fails, return original (might be external image)
            return src;
        }
    }

    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.fit) params.set('fit', options.fit);

    const queryString = params.toString();
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/images/${encodeURIComponent(key)}${queryString ? `?${queryString}` : ''}`;
}
