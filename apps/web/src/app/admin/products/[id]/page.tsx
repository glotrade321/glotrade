"use client";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/Guards";
import { toast } from "@/components/common/Toast";
import { API_BASE_URL, apiGet, apiPut, apiDelete, getAuthHeader } from "@/utils/api";
import ProductImageUpload from "@/components/product/ProductImageUpload";
import { X } from "lucide-react";
import { getCountryNames } from "@/utils/countryData";

export default function ManageProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    price: 0,
    originalPrice: 0,
    currency: "NGN",
    category: "General",
    subcategory: "",
    images: [],
    condition: "new",
    location: { country: "Nigeria", city: "" },
    quantity: 1,
    minOrderQuantity: 1,
    brand: "",
    tags: "",
    discount: 0,
    featured: false,
    attributes: [{ key: "", value: "" }],
    variants: [],
    bulkPricing: [],
  });
  const [activeTab, setActiveTab] = useState<'details' | 'images'>('details');
  const [cats, setCats] = useState<Array<{ _id: string; name: string; slug: string; parentId?: string }>>([]);
  const [l1, setL1] = useState<string | undefined>(undefined);
  const [l2, setL2] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleFormChange = (updater: (prev: any) => any) => {
    setForm((prev: any) => {
      const next = updater(prev);
      // Auto-calculate discount if price or originalPrice changes
      if (next.price !== prev.price || next.originalPrice !== prev.originalPrice) {
        if (Number(next.originalPrice) > 0) {
          next.discount = Math.max(0, Math.min(100, Math.round((1 - Number(next.price) / Number(next.originalPrice)) * 100)));
        }
      }
      return next;
    });
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet('/api/v1/market/categories') as any;
        setCats(Array.isArray(response.data) ? response.data : []);
      } catch { }
    })();
  }, []);

  const level1 = useMemo(() => cats.filter((c) => !c.parentId), [cats]);
  const childrenMap = useMemo(() => {
    const map: Record<string, Array<{ _id: string; name: string; slug: string; parentId?: string }>> = {};
    cats.forEach((c) => { if (c.parentId) { (map[c.parentId] = map[c.parentId] || []).push(c); } });
    return map;
  }, [cats]);
  const level2 = l1 ? (childrenMap[l1] || []) : [];
  const level3 = l2 ? (childrenMap[l2] || []) : [];

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet(`/api/v1/market/products/${id}`) as any;
        const p = response?.data || null;
        setProduct(p);
        if (p) {
          setForm({
            title: p.title || "",
            description: p.description || "",
            price: p.price || 0,
            originalPrice: p.originalPrice || 0,
            currency: p.currency || "NGN",
            category: p.category || "General",
            subcategory: p.subcategory || "",
            images: p.images || [],
            condition: p.condition || "new",
            location: p.location || { country: "Nigeria", city: "" },
            quantity: p.quantity || 0,
            minOrderQuantity: p.minOrderQuantity || 1,
            brand: p.brand || "",
            tags: Array.isArray(p.tags) ? p.tags.join(', ') : "",
            discount: p.discount || 0,
            featured: !!p.featured,
            attributes: p.attributes ? Object.entries(p.attributes).map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }],
            variants: p.variants || [],
            bulkPricing: p.bulkPricing || [],
            shippingOptions: p.shippingOptions || [],
          });
        }
      } catch { }
      finally { setLoading(false); }
    })();
  }, [id]);

  const save = async () => {
    try {
      setLoading(true);
      const payload: any = {
        title: form.title,
        description: form.description,
        originalPrice: Number(form.originalPrice),
        price: Number(form.price),
        currency: String(form.currency || 'NGN'),
        category: form.subcategory || form.category || 'General',
        subcategory: form.subcategory || undefined,
        condition: String(form.condition || 'new').toLowerCase(),
        location: { country: form.location?.country || 'Nigeria', city: form.location?.city || undefined },
        quantity: Number(form.quantity || 0),
        minOrderQuantity: Number(form.minOrderQuantity || 1),
        brand: form.brand || undefined,
        tags: String(form.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        discount: Number(form.discount || 0),
        featured: !!form.featured,
        shippingOptions: (form.shippingOptions || []).filter((o: any) => o.method).map((o: any) => ({
          method: o.method,
          cost: Number(o.cost || 0),
          estimatedDays: Number(o.estimatedDays || 1)
        })),
        attributes: Object.fromEntries(
          (form.attributes || [])
            .filter((r: any) => r.key && (r.value ?? "") !== "")
            .map((r: any) => [
              r.key,
              String(r.value)
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean).length > 1
                ? String(r.value).split(",").map((v) => v.trim()).filter(Boolean)
                : String(r.value).trim()
            ])
        ),
        bulkPricing: Array.isArray(form.bulkPricing) ? form.bulkPricing.filter((tier: any) =>
          tier.minQuantity && tier.minQuantity > 0 && (tier.pricePerUnit !== undefined || tier.discountPercent !== undefined)
        ).map((tier: any) => ({
          minQuantity: Number(tier.minQuantity),
          maxQuantity: tier.maxQuantity ? Number(tier.maxQuantity) : undefined,
          pricePerUnit: tier.pricePerUnit !== undefined ? Number(tier.pricePerUnit) : undefined,
          discountPercent: tier.discountPercent !== undefined ? Number(tier.discountPercent) : undefined,
        })) : [],
      };

      if (Array.isArray(form.variants)) {
        payload.variants = form.variants.map((v: any) => ({
          sku: v.sku || undefined,
          price: v.price ? Number(v.price) : undefined,
          quantity: Number(v.quantity || 0),
          attributes: v.attributes || {}
        }));
      }

      await apiPut(`/api/v1/vendors/products/${id}`, payload);

      // Refresh product data after save
      const refreshData = await apiGet(`/api/v1/market/products/${id}`) as any;
      setProduct(refreshData?.data || null);
      setHasUnsavedChanges(false);
      toast('Product updated successfully', 'success');
    } catch (e) {
      console.warn(e);
      toast('Failed to update product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = async (newImages: string[]) => {
    try {
      setLoading(true);
      await apiPut(`/api/v1/vendors/products/${id}`, { images: newImages });

      // Update local product state
      setProduct((prev: any) => prev ? { ...prev, images: newImages } : null);
      toast('Images updated successfully', 'success');
    } catch (e) {
      console.warn(e);
      toast('Failed to update images', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <RequireAuth>
      <div className="fixed inset-0 bg-white dark:bg-neutral-950 overflow-y-auto z-50">
        <main className="min-h-full py-4 sm:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="text-center py-8">Loading...</div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
  if (!product) return (
    <RequireAuth>
      <div className="fixed inset-0 bg-white dark:bg-neutral-950 overflow-y-auto z-50">
        <main className="min-h-full py-4 sm:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="text-center py-8">Not found</div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );

  return (
    <RequireAuth>
      <div className="fixed inset-0 bg-white dark:bg-neutral-950 overflow-y-auto z-50">
        <main className="min-h-full py-4 sm:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-semibold">Manage product</h1>
              <Link href="/admin/products" className="text-sm underline">Back</Link>
            </div>

            {/* Product Info Header */}
            <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start gap-3 sm:gap-4">
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold mb-2">{product.title}</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span className="text-neutral-500">Category: {product.category}</span>
                    {product.subcategory && <span className="text-neutral-500">Subcategory: {product.subcategory}</span>}
                    <span className="text-neutral-500">Condition: {product.condition}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-4 flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'images'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
              >
                Product Images ({product.images?.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900 grid grid-cols-1 gap-4 sm:gap-6">

                {/* Basic Info */}
                <div>
                  <div className="mb-2 text-sm font-semibold">Product title</div>
                  <input required value={form.title} onChange={(e) => handleFormChange((s: any) => ({ ...s, title: e.target.value }))} placeholder="e.g., Nova X1 5G Smartphone" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm sm:text-base" />
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold">Description</div>
                  <textarea required value={form.description} onChange={(e) => handleFormChange((s: any) => ({ ...s, description: e.target.value }))} placeholder="Describe the product..." rows={4} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm sm:text-base" />
                </div>

                {/* Categories & Condition */}
                <div>
                  <div className="mb-2 text-sm font-semibold">Categories & Condition</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select value={l1 || ''} onChange={(e) => { setL1(e.target.value || undefined); setL2(undefined); handleFormChange((s: any) => ({ ...s, category: 'General', subcategory: '' })); }} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm">
                      <option value="">Department</option>
                      {level1.map(c => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                    </select>
                    <select value={l2 || ''} onChange={(e) => { setL2(e.target.value || undefined); handleFormChange((s: any) => ({ ...s, category: 'General', subcategory: '' })); }} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm">
                      <option value="">Category</option>
                      {level2.map(c => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                    </select>
                    <select value={form.subcategory} onChange={(e) => handleFormChange((s: any) => ({ ...s, subcategory: e.target.value, category: level2.find(x => x.slug === l2)?.name || level1.find(x => x.slug === l1)?.name || 'General' }))} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm">
                      <option value="">Subcategory</option>
                      {level3.map(c => (<option key={c.slug} value={c.name}>{c.name}</option>))}
                    </select>
                    <select value={form.condition} onChange={(e) => handleFormChange((s: any) => ({ ...s, condition: e.target.value }))} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm">
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">Currently: {form.category} {form.subcategory ? `> ${form.subcategory}` : ''}</div>
                </div>

                {/* Pricing & Stock */}
                <div>
                  <div className="mb-2 text-sm font-semibold">Pricing & Stock</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <div className="mb-1 text-xs text-neutral-500">Price</div>
                      <input type="number" min={0} value={form.price} onChange={(e) => handleFormChange((s: any) => ({ ...s, price: Number(e.target.value) }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-neutral-500">Original Price</div>
                      <input type="number" min={0} value={form.originalPrice} onChange={(e) => handleFormChange((s: any) => ({ ...s, originalPrice: Number(e.target.value) }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-neutral-500">Stock</div>
                      <input type="number" min={0} value={form.quantity} onChange={(e) => handleFormChange((s: any) => ({ ...s, quantity: Number(e.target.value) }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-neutral-500">Discount %</div>
                      <input type="number" min={0} max={100} value={form.discount} onChange={(e) => handleFormChange((s: any) => ({ ...s, discount: Number(e.target.value) }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Brand & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-neutral-500">Brand</div>
                    <input value={form.brand} onChange={(e) => handleFormChange((s: any) => ({ ...s, brand: e.target.value }))} placeholder="Brand (optional)" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-neutral-500">Tags (comma separated)</div>
                    <input value={form.tags} onChange={(e) => handleFormChange((s: any) => ({ ...s, tags: e.target.value }))} placeholder="e.g. mobile, electronics" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm" />
                  </div>
                </div>

                {/* Location & Shipping */}
                <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <div className="mb-2 text-sm font-semibold">Location & Shipping</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <div className="mb-1 text-xs text-neutral-500">Country</div>
                      <select value={form.location?.country || ''} onChange={(e) => handleFormChange((s: any) => ({ ...s, location: { ...s.location, country: e.target.value } }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm">
                        {getCountryNames().map(c => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-neutral-500">City (optional)</div>
                      <input value={form.location?.city || ''} onChange={(e) => handleFormChange((s: any) => ({ ...s, location: { ...s.location, city: e.target.value } }))} placeholder="City" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-neutral-500">Currency</div>
                      <select value={form.currency} onChange={(e) => handleFormChange((s: any) => ({ ...s, currency: e.target.value }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm">
                        {['NGN', 'GHS', 'XOF', 'KES', 'ZAR', 'USD'].map(c => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="text-xs font-medium text-neutral-500">Shipping Methods</div>
                    {(form.shippingOptions || []).map((opt: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 relative">
                        <button type="button" onClick={() => handleFormChange((s: any) => { const next = [...(s.shippingOptions || [])]; next.splice(idx, 1); return { ...s, shippingOptions: next }; })} className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"><X size={14} /></button>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input value={opt.method} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.shippingOptions || [])]; next[idx] = { ...next[idx], method: e.target.value }; return { ...s, shippingOptions: next }; })} placeholder="Method (e.g. Standard)" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                          <input type="number" min={0} value={opt.cost} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.shippingOptions || [])]; next[idx] = { ...next[idx], cost: Number(e.target.value) }; return { ...s, shippingOptions: next }; })} placeholder="Cost" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                          <input type="number" min={1} value={opt.estimatedDays} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.shippingOptions || [])]; next[idx] = { ...next[idx], estimatedDays: Number(e.target.value) }; return { ...s, shippingOptions: next }; })} placeholder="Days" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleFormChange((s: any) => ({ ...s, shippingOptions: [...(s.shippingOptions || []), { method: "", cost: 0, estimatedDays: 3 }] }))} className="text-xs text-blue-600 hover:underline">+ Add shipping method</button>
                  </div>
                </div>

                {/* Attributes */}
                <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <div className="mb-3 text-sm font-semibold">Attributes</div>
                  {(form.attributes || []).map((r: any, idx: number) => (
                    <div key={idx} className="mb-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 relative">
                      {(form.attributes || []).length > 1 && (
                        <button type="button" onClick={() => handleFormChange((s: any) => { const next = [...(s.attributes || [])]; next.splice(idx, 1); return { ...s, attributes: next }; })} className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"><X size={14} /></button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={r.key} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.attributes || [])]; next[idx] = { ...next[idx], key: e.target.value }; return { ...s, attributes: next }; })} placeholder="Name (e.g. Size)" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-xs" />
                        <input value={r.value} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.attributes || [])]; next[idx] = { ...next[idx], value: e.target.value }; return { ...s, attributes: next }; })} placeholder="Values (comma separated)" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-xs" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleFormChange((s: any) => ({ ...s, attributes: [...(s.attributes || []), { key: "", value: "" }] }))} className="text-xs text-blue-600 hover:underline">+ Add attribute</button>
                </div>

                {/* Bulk Pricing */}
                <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <div className="mb-3 text-sm font-semibold">Bulk Pricing Tiers</div>
                  {(form.bulkPricing || []).map((tier: any, idx: number) => (
                    <div key={idx} className="mb-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 relative">
                      <button type="button" onClick={() => handleFormChange((s: any) => { const next = [...(s.bulkPricing || [])]; next.splice(idx, 1); return { ...s, bulkPricing: next }; })} className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"><X size={14} /></button>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] text-neutral-500">Min Qty</label>
                          <input type="number" min={1} value={tier.minQuantity || ''} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.bulkPricing || [])]; next[idx] = { ...next[idx], minQuantity: Number(e.target.value) }; return { ...s, bulkPricing: next }; })} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-500">Max Qty</label>
                          <input type="number" min={tier.minQuantity} value={tier.maxQuantity || ''} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.bulkPricing || [])]; next[idx] = { ...next[idx], maxQuantity: e.target.value ? Number(e.target.value) : undefined }; return { ...s, bulkPricing: next }; })} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-500">Price Override</label>
                          <input type="number" value={tier.pricePerUnit !== undefined ? tier.pricePerUnit : ''} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.bulkPricing || [])]; next[idx] = { ...next[idx], pricePerUnit: e.target.value ? Number(e.target.value) : undefined, discountPercent: undefined }; return { ...s, bulkPricing: next }; })} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-500">Discount %</label>
                          <input type="number" min={0} max={100} value={tier.discountPercent !== undefined ? tier.discountPercent : ''} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.bulkPricing || [])]; next[idx] = { ...next[idx], discountPercent: e.target.value ? Number(e.target.value) : undefined, pricePerUnit: undefined }; return { ...s, bulkPricing: next }; })} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleFormChange((s: any) => ({ ...s, bulkPricing: [...(s.bulkPricing || []), { minQuantity: 1, maxQuantity: undefined, pricePerUnit: undefined, discountPercent: undefined }] }))} className="text-xs text-blue-600 hover:underline">+ Add pricing tier</button>
                </div>

                {/* Variants */}
                <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <div className="mb-3 text-sm font-semibold">Variants</div>
                  {(form.variants || []).length === 0 ? (<div className="text-xs text-neutral-500">No variants.</div>) : (
                    <div className="space-y-3">
                      {(form.variants || []).map((v: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 relative">
                          <button type="button" onClick={() => handleFormChange((s: any) => { const next = [...(s.variants || [])]; next.splice(idx, 1); return { ...s, variants: next }; })} className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"><X size={14} /></button>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-neutral-500">SKU</label>
                              <input value={v.sku || ''} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], sku: e.target.value }; return { ...s, variants: next }; })} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-neutral-500">Price</label>
                              <input type="number" min={0} value={v.price || ''} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], price: Number(e.target.value) }; return { ...s, variants: next }; })} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-neutral-500">Stock</label>
                              <input type="number" min={0} value={v.quantity || 0} onChange={(e) => handleFormChange((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], quantity: Number(e.target.value) }; return { ...s, variants: next }; })} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1 text-xs" />
                            </div>
                          </div>
                          <div className="mt-1 text-[10px] text-neutral-500">
                            {Object.entries(v.attributes || {}).map(([k, val]) => (<span key={k} className="mr-2">{k}: <strong>{String(val)}</strong></span>))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex gap-4">
                    <button type="button" onClick={() => handleFormChange((s: any) => ({ ...s, variants: [...(s.variants || []), { sku: '', price: undefined, quantity: 0, attributes: {} }] }))} className="text-xs text-blue-600 hover:underline">+ Add variant manually</button>
                    <button
                      type="button"
                      className="text-xs text-neutral-500 hover:underline"
                      onClick={() => {
                        const pairs = (form.attributes || []).filter((r: any) => r.key && r.value).map((r: any) => ({ key: r.key, values: String(r.value).split(',').map((v: string) => v.trim()).filter(Boolean) }));
                        if (!pairs.length) return toast("Add attributes first", "info");
                        const combinations: Array<Record<string, string>> = [];
                        const backtrack = (i: number, curr: Record<string, string>) => {
                          if (i === pairs.length) { combinations.push({ ...curr }); return; }
                          const { key, values } = pairs[i];
                          values.forEach((val: string) => { curr[key] = val; backtrack(i + 1, curr); });
                          delete curr[key];
                        };
                        backtrack(0, {});
                        handleFormChange((s: any) => ({ ...s, variants: combinations.map((attrs) => ({ sku: '', price: undefined, quantity: 0, attributes: attrs })) }));
                      }}
                    >
                      Regenerate from attributes
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <button onClick={save} disabled={loading} className="px-6 py-2.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 text-sm font-medium order-1 sm:order-2">
                    {loading ? 'Saving updates...' : 'Save Product Updates'}
                  </button>
                  <button onClick={() => { if (hasUnsavedChanges) setShowCancelConfirm(true); else router.back(); }} className="px-6 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm font-medium order-2 sm:order-1">
                    Discard Changes
                  </button>
                  <button onClick={async () => { if (!confirm('Archive this product?')) return; try { await apiDelete(`/api/v1/vendors/products/${id}`); router.replace('/admin/products'); } catch { } }} className="px-6 py-2.5 border border-rose-300 text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-sm font-medium order-3">Archive Product</button>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <ProductImageUpload
                  productId={id}
                  currentImages={product.images || []}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Discard changes?</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">You have unsaved changes. Are you sure you want to discard them and go back?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium">Keep Editing</button>
              <button onClick={() => { setHasUnsavedChanges(false); router.back(); }} className="flex-1 px-4 py-2 bg-rose-600 text-white这对 rounded-lg text-sm font-medium">Discard</button>
            </div>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}

