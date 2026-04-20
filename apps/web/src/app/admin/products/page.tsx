"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiDelete } from "@/utils/api";
import {
    Package,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Download,
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Image as ImageIcon,
    Layers,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { getOptimizedImageUrl } from "@/utils/image";

interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    currency: string;
    category: string;
    subcategory?: string;
    images: string[];
    condition: string;
    quantity: number;
    brand?: string;
    featured: boolean;
    discount: number;
    createdAt?: string;
    updatedAt?: string;
    seller?: {
        _id: string;
        username: string;
    };
}

interface ProductOverviewItem {
    _id: string;
    title: string;
    status: string;
    quantity: number;
    price: number;
    currency: string;
    images?: string[];
    updatedAt?: string;
    issue?: string;
}

interface ProductOverview {
    summary: {
        totalProducts: number;
        activeProducts: number;
        suspendedProducts: number;
        soldProducts: number;
        outOfStock: number;
        lowStock: number;
        addedThisMonth: number;
        updatedThisWeek: number;
        needsImages: number;
        needsDescription: number;
        staleProducts: number;
        totalViews: number;
        inventoryUnits: number;
    };
    attentionQueue: ProductOverviewItem[];
    recentUpdates: ProductOverviewItem[];
    categoryBreakdown: Array<{ category?: string; count: number }>;
    lowStockThreshold: number;
}

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [conditionFilter, setConditionFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    const [overview, setOverview] = useState<ProductOverview | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const itemsPerPage = 20;

    // Fetch products
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response: any = await apiGet(`/api/v1/market/products?page=${currentPage}&limit=${itemsPerPage}`);

            if (response.status === 'success') {
                setProducts(response.data.products || response.data || []);
                setFilteredProducts(response.data.products || response.data || []);
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error: any) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOverview = async () => {
        setOverviewLoading(true);
        try {
            const response = await apiGet<{ status: string; data: ProductOverview }>('/api/v1/vendors/products/manager-overview');
            if (response.status === 'success') {
                setOverview(response.data);
            }
        } catch (error) {
            console.error("Error fetching product overview:", error);
        } finally {
            setOverviewLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    useEffect(() => {
        fetchOverview();
    }, []);

    // Filter products
    useEffect(() => {
        let filtered = products;

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

        if (conditionFilter !== "all") {
            filtered = filtered.filter(product => product.condition === conditionFilter);
        }

        setFilteredProducts(filtered);
    }, [products, searchTerm, categoryFilter, conditionFilter]);

    const openDeleteModal = (product: Product) => {
        setDeleteModal({ isOpen: true, product });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, product: null });
    };

    const confirmDelete = async () => {
        if (!deleteModal.product) return;

        try {
            await apiDelete(`/api/v1/vendors/products/${deleteModal.product._id}`);
            closeDeleteModal();
            fetchProducts();
            fetchOverview();
        } catch (error: any) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product: " + error.message);
        }
    };

    const formatCurrency = (amount: number, currency: string = "NGN") => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) {
            return "N/A";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    const formatCompactNumber = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            notation: value >= 10000 ? 'compact' : 'standard',
            maximumFractionDigits: 1,
        }).format(value || 0);
    };

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "N/A";

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Get unique categories from products
    const categories = Array.from(new Set(products.map(p => p.category)));
    const summary = overview?.summary;
    const productHealthIssues = (summary?.outOfStock || 0) + (summary?.lowStock || 0) + (summary?.needsImages || 0) + (summary?.needsDescription || 0);
    const activeRate = summary?.totalProducts ? Math.round((summary.activeProducts / summary.totalProducts) * 100) : 0;
    const maxCategoryCount = Math.max(...(overview?.categoryBreakdown || []).map((item) => item.count), 1);
    const metricCards = summary ? [
        {
            label: "Total Products",
            value: formatCompactNumber(summary.totalProducts),
            helper: `${formatCompactNumber(summary.inventoryUnits)} units in inventory`,
            icon: <Package size={20} />,
            className: "bg-blue-50 text-blue-700 border-blue-100",
        },
        {
            label: "Active Rate",
            value: `${activeRate}%`,
            helper: `${formatCompactNumber(summary.activeProducts)} active listings`,
            icon: <CheckCircle2 size={20} />,
            className: "bg-emerald-50 text-emerald-700 border-emerald-100",
        },
        {
            label: "Needs Attention",
            value: formatCompactNumber(productHealthIssues),
            helper: `${summary.outOfStock} out, ${summary.lowStock} low stock`,
            icon: <AlertTriangle size={20} />,
            className: "bg-amber-50 text-amber-700 border-amber-100",
        },
        {
            label: "This Month",
            value: formatCompactNumber(summary.addedThisMonth),
            helper: `${summary.updatedThisWeek} updated this week`,
            icon: <TrendingUp size={20} />,
            className: "bg-indigo-50 text-indigo-700 border-indigo-100",
        },
    ] : [];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage all products in your store
                        </p>
                    </div>
                    <Link
                        href="/admin/products/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
                    >
                        <Plus size={20} />
                        Add Product
                    </Link>
                </div>

                {/* Product Manager Overview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Product Overview</h2>
                            <p className="text-sm text-gray-600">Fast catalog health checks and recent progress.</p>
                        </div>
                        <button
                            type="button"
                            onClick={fetchOverview}
                            disabled={overviewLoading}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                            Refresh
                        </button>
                    </div>

                    {overviewLoading && !overview ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {[0, 1, 2, 3].map((item) => (
                                <div key={item} className="h-32 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="h-4 w-24 rounded bg-gray-100" />
                                    <div className="mt-5 h-8 w-20 rounded bg-gray-100" />
                                    <div className="mt-4 h-3 w-36 rounded bg-gray-100" />
                                </div>
                            ))}
                        </div>
                    ) : overview ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                {metricCards.map((card) => (
                                    <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                                            </div>
                                            <div className={`rounded-lg border p-2 ${card.className}`}>
                                                {card.icon}
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm text-gray-600">{card.helper}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-1">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-amber-600" />
                                        <h3 className="font-semibold text-gray-900">Attention Queue</h3>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {overview.attentionQueue.length === 0 ? (
                                            <p className="text-sm text-gray-500">No urgent product issues found.</p>
                                        ) : overview.attentionQueue.slice(0, 5).map((item) => (
                                            <Link key={item._id} href={`/admin/products/${item._id}`} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50">
                                                <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    {item.images?.[0] ? (
                                                        <img src={getOptimizedImageUrl(item.images[0], { width: 90, quality: 60 })} alt={item.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ImageIcon size={18} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                                                    <p className="text-xs text-amber-700">{item.issue}</p>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500">{item.quantity}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock3 size={18} className="text-blue-600" />
                                        <h3 className="font-semibold text-gray-900">Recent Updates</h3>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {overview.recentUpdates.slice(0, 5).map((item) => (
                                            <div key={item._id} className="flex items-center justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
                                                <Link href={`/marketplace/${item._id}`} target="_blank" className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                                                    <p className="text-xs text-gray-500">{item.status} · {item.quantity} units · preview</p>
                                                </Link>
                                                <div className="flex flex-shrink-0 items-center gap-3">
                                                    <span className="text-xs text-gray-500">{formatShortDate(item.updatedAt)}</span>
                                                    <Link
                                                        href={`/admin/products/${item._id}`}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Edit Product"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                        {overview.recentUpdates.length === 0 && (
                                            <p className="text-sm text-gray-500">No recent product updates yet.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Layers size={18} className="text-indigo-600" />
                                        <h3 className="font-semibold text-gray-900">Category Spread</h3>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {overview.categoryBreakdown.length === 0 ? (
                                            <p className="text-sm text-gray-500">No category data available.</p>
                                        ) : overview.categoryBreakdown.map((item) => (
                                            <div key={item.category || 'Uncategorized'}>
                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                    <span className="truncate font-medium text-gray-700">{item.category || 'Uncategorized'}</span>
                                                    <span className="text-gray-500">{item.count}</span>
                                                </div>
                                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                                                    <div
                                                        className="h-full rounded-full bg-indigo-500"
                                                        style={{ width: `${Math.max(8, Math.round((item.count / maxCategoryCount) * 100))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <p className="text-xs font-medium text-gray-500">Needs Images</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">{overview.summary.needsImages}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <p className="text-xs font-medium text-gray-500">Needs Description</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">{overview.summary.needsDescription}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <p className="text-xs font-medium text-gray-500">Review Old Listings</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">{overview.summary.staleProducts}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <p className="text-xs font-medium text-gray-500">Total Views</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">{formatCompactNumber(overview.summary.totalViews)}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
                            Product overview is unavailable right now.
                        </div>
                    )}
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products by title, description, or brand..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="w-full sm:w-48">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Condition Filter */}
                        <div className="w-full sm:w-48">
                            <select
                                value={conditionFilter}
                                onChange={(e) => setConditionFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Conditions</option>
                                <option value="new">New</option>
                                <option value="used">Used</option>
                                <option value="refurbished">Refurbished</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Products ({filteredProducts.length})
                            </h3>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2">
                                <Download size={16} />
                                Export
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading products...</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Condition
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Updated
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img src={getOptimizedImageUrl(product.images[0], { width: 100, quality: 70 })} alt={product.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package size={24} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div
                                                                className="text-sm font-medium text-gray-900 line-clamp-2 max-w-[200px] sm:max-w-xs whitespace-normal"
                                                                title={product.title}
                                                            >
                                                                {product.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                {product.brand || 'No brand'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{product.category}</div>
                                                    {product.subcategory && (
                                                        <div className="text-xs text-gray-500">{product.subcategory}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(product.price, product.currency)}
                                                    </div>
                                                    {product.discount > 0 && (
                                                        <div className="text-xs text-green-600">
                                                            {product.discount}% off
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {product.quantity.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        units available
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`w-fit inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.condition === 'new'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {product.condition}
                                                        </span>
                                                        {product.featured && (
                                                            <span className="w-fit inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(product.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(product.updatedAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/marketplace/${product._id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="View Product"
                                                            target="_blank"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/products/${product._id}`}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Edit Product"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => openDeleteModal(product)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="p-4">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product.images && product.images.length > 0 ? (
                                                    <img src={getOptimizedImageUrl(product.images[0], { width: 150, quality: 70 })} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={32} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4
                                                    className="text-sm font-medium text-gray-900 line-clamp-2 whitespace-normal"
                                                    title={product.title}
                                                >
                                                    {product.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                                                {(product.createdAt || product.updatedAt) && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {product.updatedAt ? `Updated ${formatDate(product.updatedAt)}` : `Created ${formatDate(product.createdAt)}`}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(product.price, product.currency)}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.quantity > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : product.quantity > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {product.quantity.toLocaleString()} in stock
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Link
                                                        href={`/marketplace/${product._id}`}
                                                        className="text-blue-600 hover:text-blue-900 text-sm"
                                                        target="_blank"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/products/${product._id}`}
                                                        className="text-green-600 hover:text-green-900 text-sm"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => openDeleteModal(product)}
                                                        className="text-red-600 hover:text-red-900 text-sm"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <Trash2 size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>

                            {deleteModal.product && (
                                <div className="mb-6">
                                    <p className="text-sm text-gray-600 mb-3">
                                        Are you sure you want to delete this product?
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                        {deleteModal.product.images && deleteModal.product.images.length > 0 && (
                                            <img
                                                src={getOptimizedImageUrl(deleteModal.product.images[0], { width: 100, quality: 60 })}
                                                alt={deleteModal.product.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-sm font-medium text-gray-900 line-clamp-2 whitespace-normal"
                                                title={deleteModal.product.title}
                                            >
                                                {deleteModal.product.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatCurrency(deleteModal.product.price, deleteModal.product.currency)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                    Delete Product
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
