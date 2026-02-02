"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/Guards";
import { toast } from "@/components/common/Toast";
import { API_BASE_URL, apiGet, apiPost, apiPut, getAuthHeader } from "@/utils/api";
import ProductImageUpload from "@/components/product/ProductImageUpload";
import AdminGuard from "@/components/auth/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { X } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const countryList = [
    { code: 'NG', name: 'Nigeria', currency: 'NGN' },
    { code: 'GH', name: 'Ghana', currency: 'GHS' },
    { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF' },
    { code: 'KE', name: 'Kenya', currency: 'KES' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  ];
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
    shippingOptions: [{ method: "standard", cost: 0, estimatedDays: 3 }],
    freeShipping: true,
    shippingDays: 3,
    bulkPricing: [],
  });
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'images'>('details');
  const [cats, setCats] = useState<Array<{ _id: string; name: string; slug: string; parentId?: string }>>([]);
  const [l1, setL1] = useState<string | undefined>(undefined);
  const [l2, setL2] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  const handleFormChange = (updater: (prev: any) => any) => {
    setForm(updater);
    setHasUnsavedChanges(true);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      router.back();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    router.back();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Normalize payload to match API schema
      const discountPct = (Number(form.originalPrice) && Number(form.originalPrice) > 0)
        ? Math.max(0, Math.min(100, Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)))
        : Number(form.discount || 0) || 0;

      const payload: any = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        currency: String(form.currency || 'NGN'),
        category: form.subcategory || form.category || 'General',
        subcategory: form.subcategory || undefined,
        images: [], // Start with empty images array
        condition: String(form.condition || 'new').toLowerCase(),
        location: { country: form.location?.country || 'Nigeria', city: form.location?.city || undefined },
        quantity: Number(form.quantity || 0),
        minOrderQuantity: Number(form.minOrderQuantity || 1),
        brand: form.brand || undefined,
        tags: String(form.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        discount: discountPct,
        featured: Boolean(form.featured),
        attributes: (form.attributes || [])
          .filter((r: any) => r.key && (r.value ?? "") !== "")
          .reduce((acc: any, r: any) => {
            const values = String(r.value)
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);

            const existing = acc[r.key]
              ? (Array.isArray(acc[r.key]) ? acc[r.key] : [acc[r.key]])
              : [];

            const combined = Array.from(new Set([...existing, ...values]));
            acc[r.key] = combined.length > 1 ? combined : combined[0];
            return acc;
          }, {}),
        shippingOptions: [{ method: 'standard', cost: form.freeShipping ? 0 : Number((form.shippingOptions?.[0]?.cost) || 0), estimatedDays: Number(form.shippingDays || 0) }],
        bulkPricing: Array.isArray(form.bulkPricing) ? form.bulkPricing.filter((tier: any) =>
          tier.minQuantity && tier.minQuantity > 0 && (tier.pricePerUnit !== undefined || tier.discountPercent !== undefined)
        ).map((tier: any) => ({
          minQuantity: Number(tier.minQuantity),
          maxQuantity: tier.maxQuantity ? Number(tier.maxQuantity) : undefined,
          pricePerUnit: tier.pricePerUnit !== undefined ? Number(tier.pricePerUnit) : undefined,
          discountPercent: tier.discountPercent !== undefined ? Number(tier.discountPercent) : undefined,
        })) : [],
        variants: Array.isArray(form.variants) ? form.variants.filter((v: any) => v && Object.keys(v.attributes || {}).length && (v.quantity || 0) >= 0).map((v: any) => ({
          sku: v.sku || undefined,
          price: v.price ? Number(v.price) : undefined,
          quantity: Number(v.quantity || 0),
          attributes: v.attributes,
        })) : undefined,
      };
      const result = await apiPost(`/api/v1/vendors/products`, payload) as any;

      if (result.status === 'success' && result.data?.product?._id) {
        setProductId(result.data.product._id);
        setStep('images');
        toast('Product created! Now add your images.', 'success');
      } else {
        throw new Error('Failed to create product');
      }
    } catch (e: any) {
      toast(e?.message || 'Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onImagesComplete = async () => {
    if (form.images.length === 0) {
      toast('Please add at least one image to continue', 'error');
      return;
    }

    try {
      setLoading(true);
      // Update product with final image URLs
      await apiPut(`/api/v1/vendors/products/${productId}`, { images: form.images });

      toast('Product created successfully with images!', 'success');
      router.replace('/admin/products');
    } catch (e: any) {
      toast(e?.message || 'Failed to update product with images', 'error');
    } finally {
      setLoading(false);
    }
  };

  // When country changes, auto-suggest currency (editable by seller)
  useEffect(() => {
    try {
      const selected = countryList.find(c => c.name === form.location?.country || c.code === form.location?.country);
      if (selected && form.currency !== selected.currency) {
        setForm((s: any) => ({ ...s, currency: selected.currency }));
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.location?.country]);

  if (step === 'images' && productId) {
    return (
      <RequireAuth>
        <AdminGuard>
          <AdminLayout>
            <div className="max-w-4xl mx-auto px-3 sm:px-4">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold mb-2">Add Product Images</h1>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                  Product "{form.title}" has been created. Now add images to make it more attractive to buyers.
                </p>
              </div>

              <ProductImageUpload
                productId={productId}
                currentImages={form.images}
                onImagesChange={(images) => setForm((s: any) => ({ ...s, images }))}
                maxImages={10}
              />

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 pb-8">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm sm:text-base"
                >
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={onImagesComplete}
                  disabled={loading || form.images.length === 0}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? 'Saving...' : 'Complete Product'}
                </button>
              </div>
            </div>
          </AdminLayout>
        </AdminGuard>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <AdminGuard>
        <AdminLayout>
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-semibold">Add product</h1>
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                aria-label="Close form"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:gap-6 pb-8">
              {/* Basic */}
              <div>
                <div className="mb-2 text-sm sm:text-base font-semibold">Product title</div>
                <input required value={form.title} onChange={(e) => handleFormChange((s: any) => ({ ...s, title: e.target.value }))} placeholder="e.g., Nova X1 5G Smartphone" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
              </div>
              <div>
                <div className="mb-2 text-sm sm:text-base font-semibold">Description</div>
                <textarea required value={form.description} onChange={(e) => handleFormChange((s: any) => ({ ...s, description: e.target.value }))} placeholder="Describe the product, key features, specs..." rows={4} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
              </div>

              {/* Pricing & Region */}
              <div>
                <div className="mb-2 text-sm sm:text-base font-semibold">Pricing & Region</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <div className="mb-2 text-xs sm:text-sm text-neutral-500">Price</div>
                    <input type="number" min={0} value={form.price} onChange={(e) => handleFormChange((s: any) => ({ ...s, price: Number(e.target.value) }))} placeholder="0" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
                  </div>
                  <div>
                    <div className="mb-2 text-xs sm:text-sm text-neutral-500">Original price</div>
                    <input type="number" min={0} value={form.originalPrice} onChange={(e) => setForm((s: any) => ({ ...s, originalPrice: Number(e.target.value) }))} placeholder="0" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
                  </div>
                  <div>
                    <div className="mb-2 text-xs sm:text-sm text-neutral-500">Currency</div>
                    <select value={form.currency} onChange={(e) => setForm((s: any) => ({ ...s, currency: e.target.value }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base">
                      {['NGN', 'GHS', 'XOF', 'KES', 'ZAR', 'ATH'].map(c => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <div>
                    <div className="mb-2 text-xs sm:text-sm text-neutral-500">Country</div>
                    <select value={form.location.country} onChange={(e) => setForm((s: any) => ({ ...s, location: { ...s.location, country: e.target.value } }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base">
                      {countryList.map(c => (<option key={c.code} value={c.name}>{c.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="mb-2 text-xs sm:text-sm text-neutral-500">Stock</div>
                    <input type="number" min={0} value={form.quantity} onChange={(e) => setForm((s: any) => ({ ...s, quantity: Number(e.target.value) }))} placeholder="0" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
                  </div>
                  <div>
                    <div className="mb-2 text-xs sm:text-sm text-neutral-500">Min. Order Qty</div>
                    <input type="number" min={1} value={form.minOrderQuantity} onChange={(e) => setForm((s: any) => ({ ...s, minOrderQuantity: Number(e.target.value) }))} placeholder="1" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
                  </div>
                  <div>
                    <div className="mb-2 text-xs sm:text-sm text-neutral-500">City (optional)</div>
                    <input value={form.location.city || ''} onChange={(e) => setForm((s: any) => ({ ...s, location: { ...s.location, city: e.target.value } }))} placeholder="City" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
                  </div>
                </div>
                <div className="mt-3 text-xs sm:text-sm text-neutral-500">
                  <span>Price</span> is the current selling price. <span>Original price</span> is the pre‑discount list price (MSRP or previous price). We automatically compute the discount shown to shoppers.
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm sm:text-base font-semibold">Categories & Condition</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <select value={l1 || ''} onChange={(e) => { setL1(e.target.value || undefined); setL2(undefined); setForm((s: any) => ({ ...s, category: 'General', subcategory: '' })); }} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base">
                    <option value="">Department</option>
                    {level1.map(c => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                  </select>
                  <select value={l2 || ''} onChange={(e) => { setL2(e.target.value || undefined); setForm((s: any) => ({ ...s, category: 'General', subcategory: '' })); }} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base">
                    <option value="">Category</option>
                    {level2.map(c => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                  </select>
                  <select value={form.subcategory} onChange={(e) => setForm((s: any) => ({ ...s, subcategory: e.target.value, category: level2.find(x => x.slug === l2)?.name || level1.find(x => x.slug === l1)?.name || 'General' }))} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base">
                    <option value="">Subcategory</option>
                    {level3.map(c => (<option key={c.slug} value={c.name}>{c.name}</option>))}
                  </select>
                  <select value={form.condition} onChange={(e) => setForm((s: any) => ({ ...s, condition: e.target.value }))} className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base">
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              {/* Images - Now handled in separate step */}
              <div className="rounded-xl border border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
                <div className="mb-2 text-sm sm:text-base font-semibold">Product Images</div>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                  Images will be added after creating the product. You can upload up to 10 high-quality images.
                </p>
              </div>

              {/* Brand & tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input value={form.brand} onChange={(e) => setForm((s: any) => ({ ...s, brand: e.target.value }))} placeholder="Brand (optional)" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
                <input value={form.tags} onChange={(e) => setForm((s: any) => ({ ...s, tags: e.target.value }))} placeholder="Tags (comma separated)" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
              </div>

              {/* Discount / Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input type="number" min={0} max={100} value={form.discount} onChange={(e) => setForm((s: any) => ({ ...s, discount: Number(e.target.value) }))} placeholder="Discount % (optional)" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base" />
                <label className="inline-flex items-center gap-2 text-sm sm:text-base py-2.5 sm:py-3"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((s: any) => ({ ...s, featured: e.target.checked }))} className="w-4 h-4" /> Featured</label>
              </div>

              {/* Bulk Pricing Tiers */}
              <div className="rounded-xl border border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
                <div className="mb-3 text-sm sm:text-base font-semibold">Bulk Pricing Tiers (Wholesale Discounts)</div>
                <div className="mb-3 text-xs text-neutral-500">Offer discounts for larger quantities. Customers will see savings when they order more.</div>
                {(form.bulkPricing || []).map((tier: any, idx: number) => (
                  <div key={idx} className="mb-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Tier {idx + 1}</span>
                      {(form.bulkPricing || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => setForm((s: any) => {
                            const next = [...(s.bulkPricing || [])];
                            next.splice(idx, 1);
                            return { ...s, bulkPricing: next };
                          })}
                          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 transition-colors"
                          title="Remove tier"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Min Quantity *</label>
                        <input
                          type="number"
                          min={1}
                          value={tier.minQuantity || ''}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.bulkPricing || [])]; next[idx] = { ...next[idx], minQuantity: Number(e.target.value) }; return { ...s, bulkPricing: next }; })}
                          placeholder="e.g., 10"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Max Quantity</label>
                        <input
                          type="number"
                          min={tier.minQuantity || 1}
                          value={tier.maxQuantity || ''}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.bulkPricing || [])]; next[idx] = { ...next[idx], maxQuantity: e.target.value ? Number(e.target.value) : undefined }; return { ...s, bulkPricing: next }; })}
                          placeholder="Leave empty for +"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Price Per Unit (₦)</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={tier.pricePerUnit !== undefined ? tier.pricePerUnit : ''}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.bulkPricing || [])]; next[idx] = { ...next[idx], pricePerUnit: e.target.value ? Number(e.target.value) : undefined, discountPercent: undefined }; return { ...s, bulkPricing: next }; })}
                          placeholder="Fixed price"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">OR Discount %</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={tier.discountPercent !== undefined ? tier.discountPercent : ''}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.bulkPricing || [])]; next[idx] = { ...next[idx], discountPercent: e.target.value ? Number(e.target.value) : undefined, pricePerUnit: undefined }; return { ...s, bulkPricing: next }; })}
                          placeholder="% off"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    {tier.minQuantity && (tier.pricePerUnit !== undefined || tier.discountPercent !== undefined) && (
                      <div className="mt-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                        Preview: {tier.minQuantity}{tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} units
                        {tier.pricePerUnit !== undefined ? ` = ₦${tier.pricePerUnit} each` : ''}
                        {tier.discountPercent !== undefined ? ` = ${tier.discountPercent}% off (₦${(form.price * (1 - tier.discountPercent / 100)).toFixed(2)} each)` : ''}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm((s: any) => ({ ...s, bulkPricing: [...(s.bulkPricing || []), { minQuantity: '', maxQuantity: '', pricePerUnit: '', discountPercent: '' }] }))}
                  className="w-full rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                >
                  + Add pricing tier
                </button>
              </div>

              {/* Attributes */}
              <div className="rounded-xl border border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
                <div className="mb-3 text-sm sm:text-base font-semibold">Product Attributes</div>
                <div className="mb-3 text-xs text-neutral-500">Add product characteristics like size, color, material, etc.</div>
                {(form.attributes || []).map((r: any, idx: number) => (
                  <div key={idx} className="mb-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Attribute {idx + 1}</span>
                      {(form.attributes || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => setForm((s: any) => {
                            const next = [...(s.attributes || [])];
                            next.splice(idx, 1);
                            return { ...s, attributes: next };
                          })}
                          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 transition-colors"
                          title="Remove attribute"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Attribute Name</label>
                        <input
                          value={r.key}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.attributes || [])]; next[idx] = { ...next[idx], key: e.target.value }; return { ...s, attributes: next }; })}
                          placeholder="e.g., Size, Color, Material"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Values (comma-separated)</label>
                        <input
                          value={r.value}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.attributes || [])]; next[idx] = { ...next[idx], value: e.target.value }; return { ...s, attributes: next }; })}
                          placeholder="e.g., S, M, L, XL or Red, Blue, Green"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm((s: any) => ({ ...s, attributes: [...(s.attributes || []), { key: "", value: "" }] }))}
                  className="w-full rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                >
                  + Add attribute
                </button>
                {/* Variant generator */}
                <div className="mt-4 sm:mt-6">
                  <div className="mb-3 text-sm sm:text-base font-semibold">Product Variants</div>
                  <div className="mb-3 text-xs text-neutral-500">Generate variants automatically from your attributes or add them manually</div>
                  <button
                    type="button"
                    className="w-full rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                    onClick={() => {
                      const rawAttributes = (form.attributes || []).filter((r: any) => r.key && r.value);
                      const mergedMap = rawAttributes.reduce((acc: any, r: any) => {
                        const vals = String(r.value).split(',').map((v: string) => v.trim()).filter(Boolean);
                        acc[r.key] = [...(acc[r.key] || []), ...vals];
                        return acc;
                      }, {});
                      const pairs = Object.entries(mergedMap).map(([key, values]) => ({ key, values: values as string[] }));

                      if (!pairs.length) {
                        toast("Please add attributes first to generate variants", "info");
                        return;
                      }
                      const combinations: Array<Record<string, string>> = [];
                      const backtrack = (i: number, curr: Record<string, string>) => {
                        if (i === pairs.length) { combinations.push({ ...curr }); return; }
                        const { key, values } = pairs[i];
                        values.forEach((val: string) => { curr[key] = val; backtrack(i + 1, curr); });
                        delete curr[key];
                      };
                      backtrack(0, {});
                      setForm((s: any) => ({ ...s, variants: combinations.map((attrs) => ({ sku: '', price: '', quantity: 0, attributes: attrs })) }));
                    }}
                  >
                    + Generate variants from attributes
                  </button>
                  {(form.variants || []).length ? (
                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                      {(form.variants || []).map((v: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Variant {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setForm((s: any) => {
                                const next = [...(s.variants || [])];
                                next.splice(idx, 1);
                                return { ...s, variants: next };
                              })}
                              className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 transition-colors"
                              title="Remove variant"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">SKU (optional)</label>
                              <input
                                value={v.sku || ''}
                                onChange={(e) => setForm((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], sku: e.target.value }; return { ...s, variants: next }; })}
                                placeholder="e.g., PROD-001-S"
                                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Price Override (₦)</label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={v.price || ''}
                                onChange={(e) => setForm((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], price: Number(e.target.value) }; return { ...s, variants: next }; })}
                                placeholder="Leave empty to use base price"
                                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-500 mb-1">Stock Quantity</label>
                              <input
                                type="number"
                                min={0}
                                value={v.quantity || 0}
                                onChange={(e) => setForm((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], quantity: Number(e.target.value) }; return { ...s, variants: next }; })}
                                placeholder="0"
                                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                              />
                            </div>
                          </div>
                          <div className="mt-2 text-xs sm:text-sm text-neutral-500">
                            <span className="font-medium">Attributes:</span> {Object.entries(v.attributes || {}).map(([k, val]) => (<span key={k} className="mr-2">{k}: <strong>{String(val)}</strong></span>))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Shipping options */}
              <div className="rounded-xl border border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
                <div className="mb-3 text-sm sm:text-base font-semibold">Shipping options</div>
                <div className="mb-3 text-xs text-neutral-500">Add different shipping methods with their costs and delivery times</div>
                {(form.shippingOptions || []).map((r: any, idx: number) => (
                  <div key={idx} className="mb-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Shipping Option {idx + 1}</span>
                      {(form.shippingOptions || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => setForm((s: any) => {
                            const next = [...(s.shippingOptions || [])];
                            next.splice(idx, 1);
                            return { ...s, shippingOptions: next };
                          })}
                          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 transition-colors"
                          title="Remove shipping option"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Shipping Method</label>
                        <input
                          value={r.method}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.shippingOptions || [])]; next[idx] = { ...next[idx], method: e.target.value }; return { ...s, shippingOptions: next }; })}
                          placeholder="e.g., Standard, Express, Overnight"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Cost (₦)</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={r.cost}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.shippingOptions || [])]; next[idx] = { ...next[idx], cost: Number(e.target.value) }; return { ...s, shippingOptions: next }; })}
                          placeholder="0.00"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Delivery Time (days)</label>
                        <input
                          type="number"
                          min={1}
                          value={r.estimatedDays}
                          onChange={(e) => setForm((s: any) => { const next = [...(s.shippingOptions || [])]; next[idx] = { ...next[idx], estimatedDays: Number(e.target.value) }; return { ...s, shippingOptions: next }; })}
                          placeholder="3"
                          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm((s: any) => ({ ...s, shippingOptions: [...(s.shippingOptions || []), { method: "", cost: 0, estimatedDays: 0 }] }))}
                  className="w-full rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                >
                  + Add shipping option
                </button>
              </div>
              {/* moved country near price */}
              <button disabled={loading} type="submit" className="w-full rounded-full bg-neutral-900 text-white px-6 sm:px-8 py-3 sm:py-4 font-semibold dark:bg-neutral-100 dark:text-black text-sm sm:text-base hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Creating Product...' : 'Create Product & Add Images'}</button>
            </form>
          </div>
        </AdminLayout>
        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelConfirm(false)} />
            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <X size={24} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Discard Changes?
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
                  You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 rounded-full border px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="flex-1 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminGuard>
    </RequireAuth>
  );
}
