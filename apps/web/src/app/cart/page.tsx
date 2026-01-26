"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, Trash2, ShieldCheck, Lock, Leaf } from "lucide-react";
import AddressModal from "@/components/cart/AddressModal";
import { useRouter } from "next/navigation";
import ProductCard from "../marketplace/ProductCard";
import type { ProductCardData } from "@/types/product";
import { API_BASE_URL, apiGet } from "@/utils/api";
import { getStoredLocale, translate, Locale } from "@/utils/i18n";
import { getOptimizedImageUrl } from "@/utils/image";

// types
type ApiProduct = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  images?: string[];
  discount?: number;
  rating?: number;
  brand?: string;
  minOrderQuantity?: number;
  bulkPricing?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    pricePerUnit?: number;
    discountPercent?: number;
  }>;
};

type ProductResponse = { status: string; data: ApiProduct };
type SearchResponse = { status: string; data: { products: ApiProduct[] } };

function readCart(): string[] {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function commitCart(cart: string[]) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: cart.length } }));
  } catch { }
}

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [idToQty, setIdToQty] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [picks, setPicks] = useState<ApiProduct[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const router = useRouter();

  useEffect(() => {
    setLocale(getStoredLocale());
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () => window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  useEffect(() => {
    let aborted = false;
    async function run() {
      setLoading(true);
      const ids = readCart();
      const map: Record<string, number> = {};
      ids.forEach((id) => (map[id] = (map[id] || 0) + 1));
      const uniqueIds = Object.keys(map);
      try {
        const results = await Promise.all(
          uniqueIds.map(async (id) => {
            const res = await fetch(new URL(`/api/v1/market/products/${id}`, API_BASE_URL).toString(), { cache: "no-store" });
            const json: ProductResponse = await res.json();
            return json.data;
          })
        );
        const initialSelected: Record<string, boolean> = {};
        results.forEach((p) => (initialSelected[p._id] = true));
        if (!aborted) {
          setIdToQty(map);
          setProducts(results);
          setSelected(initialSelected);
        }
      } catch {
        if (!aborted) {
          setIdToQty({});
          setProducts([]);
          setSelected({});
        }
      } finally {
        if (!aborted) {
          setLoading(false);
          setInitialized(true);
        }
      }

      try {
        const res = await fetch(new URL(`/api/v1/market/products?sort=-views&limit=8`, API_BASE_URL).toString(), { cache: "no-store" });
        const json: SearchResponse = await res.json();
        if (!aborted) setPicks(Array.isArray(json.data?.products) ? json.data.products : []);
      } catch { }

      try {
        // First check database for addresses if user is logged in
        let hasAddressInDB = false;
        try {
          const raw = localStorage.getItem('afritrade:user');
          console.log('Cart: User data from localStorage:', raw ? 'exists' : 'missing');

          if (raw) {
            const user = JSON.parse(raw);
            console.log('Cart: Parsed user:', { id: user?.id, _id: user?._id, username: user?.username });

            if (user?.id || user?._id) {
              console.log('Cart: Fetching addresses from database...');
              // Use apiGet to ensure correct Authorization header (Bearer token) is used
              const addressData = await apiGet<{ status: string; data: any[] }>(`/api/v1/users/me/addresses`);

              console.log('Cart: Address data received:', addressData);

              hasAddressInDB = addressData.data && addressData.data.length > 0;
              console.log('Cart: Has address in DB:', hasAddressInDB);

              // If we have database addresses, always sync with localStorage to keep it fresh
              if (hasAddressInDB) {
                const defaultAddr = addressData.data.find((a: any) => a.isDefault) || addressData.data[0];

                // Map database fields to expected format
                const mappedAddr = {
                  ...defaultAddr,
                  address: defaultAddr.street, // Map street to address
                  // Use user's firstName/lastName, fallback to username
                  displayName: `${user?.firstName || user?.username || 'User'} ${user?.lastName || ''}`.trim()
                };

                localStorage.setItem("shippingAddress", JSON.stringify(mappedAddr));
                console.log('Cart: Synced address to localStorage:', mappedAddr);
              }
            }
          }
        } catch (error) {
          console.log('Could not fetch user addresses from database:', error);
        }

        // Fall back to localStorage check
        const addr = localStorage.getItem("shippingAddress");
        if (!aborted) setHasAddress(hasAddressInDB || !!addr);
      } catch { }
    }
    run();
    return () => { aborted = true; };
  }, []);

  // helper to apply quantity map and persist immediately
  const applyQtyMap = (nextMap: Record<string, number>) => {
    setIdToQty(nextMap);
    const cartArr: string[] = [];
    Object.entries(nextMap).forEach(([pid, q]) => {
      for (let i = 0; i < (q || 0); i++) cartArr.push(pid);
    });
    commitCart(cartArr);
    setSelected((prev) => {
      const nextSel: Record<string, boolean> = {};
      Object.keys(nextMap).forEach((pid) => {
        if ((nextMap as any)[pid] > 0) nextSel[pid] = prev[pid] ?? true;
      });
      return nextSel;
    });
  };

  const changeQty = (id: string, next: number, minQty: number = 1) => {
    const bounded = Math.max(minQty, Math.min(5, next));
    const map = { ...idToQty };
    if (bounded <= 0) delete map[id];
    else map[id] = bounded;
    applyQtyMap(map);
  };

  const removeItem = (id: string) => {
    const map = { ...idToQty };
    delete map[id];
    applyQtyMap(map);
  };

  const displayedProducts = useMemo(() => products.filter((p) => (idToQty[p._id] || 0) > 0), [products, idToQty]);
  const allSelected = useMemo(() => displayedProducts.length > 0 && displayedProducts.every((p) => selected[p._id]), [displayedProducts, selected]);
  const toggleAll = () => {
    const next = !allSelected;
    const map: Record<string, boolean> = {};
    displayedProducts.forEach((p) => (map[p._id] = next));
    setSelected(map);
  };

  const summary = useMemo(() => {
    let items = 0;
    let subtotal = 0;
    let discount = 0;
    let bulkSavings = 0;

    displayedProducts.forEach((p) => {
      if (!selected[p._id]) return;
      const qty = idToQty[p._id] || 0;
      items += qty;

      // Calculate base price with regular discount
      const regularDiscount = typeof p.discount === "number" && p.discount > 0
        ? Math.round((p.price * p.discount) / 100)
        : 0;

      // Check for bulk pricing
      let effectivePrice = p.price;
      let bulkDiscountApplied = false;

      if (p.bulkPricing && p.bulkPricing.length > 0) {
        const applicableTier = p.bulkPricing.find((tier) => {
          const meetsMin = qty >= tier.minQuantity;
          const meetsMax = !tier.maxQuantity || qty <= tier.maxQuantity;
          return meetsMin && meetsMax;
        });

        if (applicableTier) {
          if (applicableTier.pricePerUnit !== undefined && applicableTier.pricePerUnit >= 0) {
            effectivePrice = applicableTier.pricePerUnit;
            bulkDiscountApplied = true;
          } else if (applicableTier.discountPercent !== undefined && applicableTier.discountPercent > 0) {
            effectivePrice = p.price * (1 - applicableTier.discountPercent / 100);
            bulkDiscountApplied = true;
          }
        }
      }

      // If bulk pricing applied, calculate bulk savings; otherwise use regular discount
      if (bulkDiscountApplied) {
        bulkSavings += (p.price - effectivePrice) * qty;
        subtotal += p.price * qty;
      } else {
        discount += regularDiscount * qty;
        subtotal += p.price * qty;
      }
    });

    const totalDiscount = discount + bulkSavings;
    const total = subtotal - totalDiscount;
    return { items, subtotal, discount: totalDiscount, bulkSavings, total };
  }, [displayedProducts, idToQty, selected]);

  return (
    <main className="mx-auto md:w-[95%] w-full px-2 md:px-6 py-4 sm:py-5">
      <nav className="mb-3 text-sm text-neutral-500"><Link href="/">{translate(locale, "home.title")}</Link> <span className="mx-2">›</span> <span className="text-neutral-700">{translate(locale, "cart.title")}</span></nav>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section>
          <div className="rounded border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 p-2 text-sm flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-semibold text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-sm"><Check size={16} /> {translate(locale, "cart.freeShippingBanner")}</div>
            <div className="text-grey-500 font-semibold text-[10px] sm:text-sm">{translate(locale, "cart.limitedTimeOffer")}</div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>{translate(locale, "cart.selectAll")} ({Object.keys(idToQty).length})</span>
            </label>
          </div>

          <div className="mt-3 space-y-3">
            {loading ? (
              <div className="text-sm text-neutral-500">{translate(locale, "cart.loading")}</div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-sm text-neutral-500">{translate(locale, "cart.empty")}</div>
            ) : (
              displayedProducts.map((p) => {
                const qty = idToQty[p._id] || 0;
                const hasDiscount = typeof p.discount === "number" && p.discount > 0;
                const discounted = hasDiscount ? Math.max(0, Math.round((p.price * (100 - p.discount!)) / 100)) : undefined;
                return (
                  <div key={p._id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 flex items-start gap-3">
                    <input type="checkbox" className="mt-2 sm:mt-3" checked={!!selected[p._id]} onChange={() => setSelected((s) => ({ ...s, [p._id]: !s[p._id] }))} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images?.[0] ? getOptimizedImageUrl(p.images[0], { width: 200, quality: 75 }) : `https://placehold.co/200x200?text=${encodeURIComponent(p.title)}`}
                      alt={p.title}
                      onError={(e) => {
                        if (p.images?.[0] && e.currentTarget.src !== p.images[0]) {
                          e.currentTarget.src = p.images[0];
                        }
                      }}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover bg-neutral-100 dark:bg-neutral-900 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">{p.title}</div>
                      {p.minOrderQuantity && p.minOrderQuantity > 1 && (
                        <div className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                          {translate(locale, "cart.minOrder")}: {p.minOrderQuantity}
                        </div>
                      )}
                      <div className="mt-1 inline-flex items-baseline bg-orange-500 text-white rounded px-2 py-0.5">
                        <span className="text-base sm:text-lg font-extrabold leading-none">{discounted ?? p.price}</span>
                        <span className="text-[10px] font-semibold ml-1 leading-none">{p.currency}</span>
                      </div>
                      {hasDiscount ? (
                        <div className="inline-flex items-center gap-2 ml-2">
                          <span className="text-xs sm:text-sm text-neutral-500 line-through hidden sm:inline">{p.price} {p.currency}</span>
                          <span className="rounded bg-rose-500 text-white text-xs px-2 py-0.5">-{p.discount}%</span>
                        </div>
                      ) : null}
                      <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button onClick={() => changeQty(p._id, qty - 1, p.minOrderQuantity || 1)} disabled={qty <= (p.minOrderQuantity || 1)} className="h-7 w-7 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-full border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"><Minus size={16} className="sm:w-4 sm:h-4" /></button>
                          <span className="text-sm sm:text-base text-center font-medium min-w-[24px]">{qty}</span>
                          <button onClick={() => changeQty(p._id, qty + 1, p.minOrderQuantity || 1)} className="h-7 w-7 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-full border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors touch-manipulation"><Plus size={16} className="sm:w-4 sm:h-4" /></button>
                        </div>
                        <button onClick={() => removeItem(p._id)} className="h-8 px-3 sm:h-8 sm:px-2 inline-flex items-center gap-1 rounded-full border text-xs sm:text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors touch-manipulation"><Trash2 size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">{translate(locale, "cart.remove")}</span></button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 hidden lg:block">
            <h2 className="text-lg font-semibold mb-3">{translate(locale, "cart.explorePicks")}</h2>
            {picks.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {picks.map((p) => (
                  <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500">{translate(locale, "cart.noPicks")}</div>
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-20 h-max">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{translate(locale, "cart.orderSummary")}</h3>
            <div className="space-y-2 sm:space-y-1">
              <div className="flex items-center justify-between text-sm py-1"><span>{translate(locale, "cart.itemsTotal")}</span><span className="line-through">{summary.subtotal.toLocaleString()} NGN</span></div>
              <div className="flex items-center justify-between text-sm py-1"><span>{translate(locale, "cart.itemsDiscount")}</span><span className="text-rose-600">-{summary.discount.toLocaleString()} NGN</span></div>
              {summary.bulkSavings > 0 && (
                <div className="flex items-center justify-between text-sm py-1 text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {translate(locale, "cart.bulkSavings")}
                  </span>
                  <span className="font-semibold">-{summary.bulkSavings.toLocaleString()} NGN</span>
                </div>
              )}
              <div className="my-2 h-px bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex items-center justify-between font-semibold text-base sm:text-lg py-1"><span>{translate(locale, "cart.total")}</span><span className="text-orange-600">{summary.total.toLocaleString()} NGN</span></div>
            </div>
            <div className="mt-3 text-xs text-neutral-500">{translate(locale, "cart.youWillNotBeCharged")}</div>
            <button
              disabled={summary.items === 0}
              onClick={() => {
                if (summary.items === 0) return;
                if (!hasAddress) {
                  setAddressModalOpen(true);
                  return;
                }
                router.push("/checkout");
              }}
              className={`mt-4 w-full rounded-full px-4 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-colors ${summary.items ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700" : "bg-neutral-200 text-neutral-500 cursor-not-allowed"}`}
            >
              {translate(locale, "cart.checkout")} ({summary.items})
            </button>

            <div className="mt-5 space-y-3 sm:space-y-4 text-xs sm:text-sm">
              <div className="font-semibold text-sm sm:text-base">{translate(locale, "cart.guestCheckout")}</div>

              <div>
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base"><ShieldCheck size={16} /> {translate(locale, "cart.safePaymentOptions")}</div>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-neutral-700">
                  {['VISA', 'Mastercard', 'Wave', 'Orange Money', 'Apple&nbsp;Pay', 'Google&nbsp;Pay'].map((l) => (
                    <span key={l} className="inline-flex items-center justify-center rounded border border-neutral-200 px-1.5 sm:px-2 py-1 bg-white dark:bg-neutral-900" dangerouslySetInnerHTML={{ __html: l }} />
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-sm sm:text-base">{translate(locale, "cart.securityCertification")}</div>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-neutral-700">
                  {['PCI&nbsp;DSS', 'VISA&nbsp;Secure', 'ID&nbsp;Check', 'SafeKey', 'ProtectBuy', 'J/Secure'].map((l) => (
                    <span key={l} className="inline-flex items-center justify-center rounded border border-neutral-200 px-1.5 sm:px-2 py-1 bg-white dark:bg-neutral-900" dangerouslySetInnerHTML={{ __html: l }} />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base"><Lock size={16} /> {translate(locale, "cart.securePrivacy")}</div>
                <p className="mt-1 text-[10px] sm:text-xs text-neutral-500 leading-relaxed">{translate(locale, "cart.securePrivacyDesc")}</p>
                <Link href="#" className="text-[10px] sm:text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">{translate(locale, "cart.learnMore")}</Link>
              </div>

              <div>
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base"><ShieldCheck size={16} /> {translate(locale, "cart.purchaseProtection")}</div>
                <p className="mt-1 text-[10px] sm:text-xs text-neutral-500">{translate(locale, "cart.purchaseProtectionDesc")}</p>
                <Link href="#" className="text-[10px] sm:text-xs text-blue-600 hover:underline inline-flex items-center gap-1">{translate(locale, "cart.seeProgramTerms")}</Link>
              </div>

              <div className="flex items-center gap-2 font-semibold text-sm sm:text-base"><Leaf size={16} /> {translate(locale, "cart.treePlanting")}</div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 lg:hidden">
        <h2 className="text-lg font-semibold mb-3">{translate(locale, "cart.explorePicks")}</h2>
        {picks.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {picks.map((p) => (
              <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-500">{translate(locale, "cart.noPicks")}</div>
        )}
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSaved={() => {
          setHasAddress(true);
          setAddressModalOpen(false);
          setToastMsg(translate(locale, "cart.addressSaved"));
          setTimeout(() => setToastMsg(null), 2500);
        }}
      />

      {toastMsg ? (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-full bg-emerald-600 text-white text-sm px-4 py-2 shadow">{toastMsg}</div>
        </div>
      ) : null}
    </main>
  );
}

