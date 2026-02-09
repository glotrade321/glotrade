"use client";

function formatDisplay(v?: string) {
  if (!v) return "";
  try { const d = new Date(v); return d.toLocaleDateString(); } catch { return v; }
}

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { API_BASE_URL, apiGet } from "@/utils/api";
import { ShoppingBag, CircleDollarSign, CheckCircle, BarChart2, Search, ChevronRight, CalendarDays, ChevronLeft, ChevronRight as ChevronRightIcon, ArrowLeft } from "lucide-react";
import dynamic from 'next/dynamic';
import { getStoredLocale, Locale, translate } from "@/utils/i18n";
import { getOptimizedImageUrl } from "@/utils/image";

// Dynamically import Chart.js components to reduce initial bundle size
const OrdersChart = dynamic(() => import('./OrdersChart').then(mod => ({ default: mod.default })), { ssr: false });
const StatusDoughnutChart = dynamic(() => import('./StatusDoughnutChart').then(mod => ({ default: mod.default })), { ssr: false });

type OrderDoc = { _id: string; status: string; paymentStatus?: string; createdAt?: string; totalPrice?: number; currency?: string; lineItems?: { productId: string; qty: number; unitPrice: number; productTitle?: string; productImage?: string }[] };

function getUserId(): string | null { try { const raw = localStorage.getItem("afritrade:user"); if (!raw) return null; const u = JSON.parse(raw); return u?.id || u?._id || null; } catch { return null; } }

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<{ totalOrders: number; delivered: number; spendTotal: number; avgOrderValue: number }>({ totalOrders: 0, delivered: 0, spendTotal: 0, avgOrderValue: 0 });
  const [analytics, setAnalytics] = useState<{ timeSeries: { bucket: string; count: number }[]; statusBreakdown: Record<string, number> }>({ timeSeries: [], statusBreakdown: {} });
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [productMeta, setProductMeta] = useState<Record<string, { title?: string; image?: string }>>({});
  const loadingMetaRef = useRef<Set<string>>(new Set());
  const autoCloseTimersRef = useRef<Record<string, number>>({});
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getStoredLocale());
    const handleLangChange = () => setLocale(getStoredLocale());
    window.addEventListener("i18n:locale", handleLangChange);
    return () => window.removeEventListener("i18n:locale", handleLangChange);
  }, []);

  const toggleExpanded = (orderId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
        const t = autoCloseTimersRef.current[orderId];
        if (t) { clearTimeout(t); delete autoCloseTimersRef.current[orderId]; }
      } else {
        next.add(orderId);
        const existing = autoCloseTimersRef.current[orderId];
        if (existing) clearTimeout(existing);
        autoCloseTimersRef.current[orderId] = window.setTimeout(() => {
          setExpanded(curr => { const c = new Set(curr); c.delete(orderId); return c; });
          delete autoCloseTimersRef.current[orderId];
        }, 6000); // 6 seconds
      }
      return next;
    });
  };

  const pageSize = 5;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const uid = getUserId(); if (!uid) return;
      const params = new URLSearchParams({ buyerId: uid, page: String(page), limit: String(pageSize) });
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      if (range.from) params.set("from", range.from);
      if (range.to) params.set("to", range.to);

      const json = await apiGet<any>(`/api/v1/orders?${params.toString()}`);
      setOrders(json?.data?.orders || []);
      setTotal(json?.data?.total || 0);
    } catch { }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    try {
      const uid = getUserId(); if (!uid) return;
      const params = new URLSearchParams({ buyerId: uid });
      if (range.from) params.set("from", range.from);
      if (range.to) params.set("to", range.to);

      const json = await apiGet<any>(`/api/v1/orders/analytics/overview?${params.toString()}`);
      const d = json?.data || {};
      setKpi({ totalOrders: d.totalOrders || 0, delivered: d.delivered || 0, spendTotal: d.spendTotal || 0, avgOrderValue: d.avgOrderValue || 0 });
      setAnalytics({ timeSeries: Array.isArray(d.timeSeries) ? d.timeSeries : [], statusBreakdown: d.statusBreakdown || {} });
    } catch { }
  };

  useEffect(() => { fetchOrders(); }, [page, status]);
  useEffect(() => { fetchAnalytics(); }, [range]);

  // Load product metadata lazily for expanded orders
  useEffect(() => {
    const pids: string[] = [];
    orders.forEach(o => {
      if (!expanded.has(o._id)) return;
      (o.lineItems || []).forEach(li => {
        const id = li.productId;
        if (!id) return;
        if (!productMeta[id] && !loadingMetaRef.current.has(id)) pids.push(id);
      });
    });
    if (pids.length === 0) return;
    (async () => {
      for (const pid of pids) {
        try {
          loadingMetaRef.current.add(pid);
          const json = await apiGet<any>(`/api/v1/market/products/${pid}`);
          const data = json?.data || json?.product || {};
          const title = data?.title || "Product";
          const image = Array.isArray(data?.images) && data.images[0] ? data.images[0] : undefined;
          setProductMeta(prev => ({ ...prev, [pid]: { title, image } }));
        } catch { }
        finally { loadingMetaRef.current.delete(pid); }
      }
    })();
  }, [expanded, orders]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => { Object.values(autoCloseTimersRef.current).forEach(t => clearTimeout(t)); };
  }, []);

  const card = "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">{translate(locale, "orders.breadcrumb.home")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/profile" className="hover:text-gray-900 dark:hover:text-white transition-colors">{translate(locale, "orders.breadcrumb.profile")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-white font-medium">{translate(locale, "orders.breadcrumb.orders")}</span>
        </nav>

        {/* Back Button */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {translate(locale, "orders.breadcrumb.back")}
        </Link>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{translate(locale, "orders.title")}</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          {/* From date */}
          <div className="group relative inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm transition">
            <CalendarDays className="mr-2 w-4 h-4 text-gray-500" />
            <button type="button" onClick={() => { setShowFromPicker((v) => !v); setShowToPicker(false); }} className="w-[9.5rem] text-left text-gray-800 dark:text-gray-100 outline-none">{formatDisplay(range.from) || translate(locale, "orders.filters.from")}</button>
          </div>
          {/* To date */}
          <div className="group relative inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm transition">
            <CalendarDays className="mr-2 w-4 h-4 text-gray-500" />
            <button type="button" onClick={() => { setShowToPicker((v) => !v); setShowFromPicker(false); }} className="w-[9.5rem] text-left text-gray-800 dark:text-gray-100 outline-none">{formatDisplay(range.to) || translate(locale, "orders.filters.to")}</button>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-[14rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              placeholder={translate(locale, "orders.filters.searchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchOrders(); }}
              className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {q ? (
              <button
                aria-label="Clear"
                onClick={() => { setQ(""); fetchOrders(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
              >
                {translate(locale, "orders.filters.clear")}
              </button>
            ) : null}
          </div>
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{translate(locale, "orders.stats.orders")}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.totalOrders}</div>
          </div>
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>{translate(locale, "orders.stats.delivered")}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.delivered}</div>
          </div>
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <CircleDollarSign className="w-4 h-4" />
              <span>{translate(locale, "orders.stats.spend")}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">NGN {kpi.spendTotal.toLocaleString()}</div>
          </div>
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <BarChart2 className="w-4 h-4" />
              <span>{translate(locale, "orders.stats.avgValue")}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">NGN {Math.round(kpi.avgOrderValue).toLocaleString()}</div>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
          <div className={`lg:col-span-2 ${card} p-6`}>
            <div className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.charts.ordersOverTime")}</div>
            <div className="h-80">
              <OrdersChart data={analytics.timeSeries} locale={locale} />
            </div>
          </div>
          <div className={`${card} p-6`}>
            <div className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.charts.statusBreakdown")}</div>
            <StatusDoughnutChart data={analytics.statusBreakdown} locale={locale} />
          </div>
        </section>

        {/* Status Filters */}
        <div className={`${card} p-6 flex flex-wrap items-center gap-2 mb-4`}>
          {["", "pending", "processing", "shipped", "delivered", "cancelled", "disputed"].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${status === s
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {s ? translate(locale, `orders.status.${s}`) : translate(locale, "orders.filters.all")}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-500">{total} {translate(locale, "orders.filters.results")}</div>
        </div>

        {/* Orders List */}
        <section className={`${card} p-6`}>
          {loading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => (<div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />))}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{translate(locale, "orders.list.noOrdersTitle")}</h3>
              <p className="text-gray-600 dark:text-gray-400">{translate(locale, "orders.list.noOrdersDesc")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((o) => {
                const itemCount = (o.lineItems || []).reduce((s, li) => s + (li.qty || 0), 0);
                const hasMany = (o.lineItems || []).length > 1;
                const isOpen = expanded.has(o._id);
                const statusColor: Record<string, string> = {
                  pending: 'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
                  processing: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
                  shipped: 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
                  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
                  cancelled: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
                  disputed: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700'
                };
                return (
                  <div key={o._id} className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {hasMany ? (
                          <button aria-label="Toggle items" onClick={() => toggleExpanded(o._id)} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                            <ChevronRight className={`w-4 h-4 ${isOpen ? 'rotate-90' : ''} transition-transform`} />
                          </button>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.list.order")} {o._id.slice(-6)}</div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{new Date(o.createdAt || '').toLocaleDateString()}</span>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium capitalize ${statusColor[o.status] || 'border-gray-300'}`}>{translate(locale, `orders.status.${o.status}`)}</span>
                            {/* Payment status might not be in all orders */}
                            {o.paymentStatus && <span className="capitalize">{translate(locale, `orders.paymentStatus.${o.paymentStatus}`) || o.paymentStatus}</span>}
                            {itemCount ? <span>{itemCount} {itemCount > 1 ? translate(locale, "orders.list.items") : translate(locale, "orders.list.item")}</span> : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{(o.totalPrice || 0).toLocaleString()} {o.currency || 'NGN'}</div>
                        <Link href={`/orders/${o._id}`} className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{translate(locale, "orders.list.view")}</Link>
                      </div>
                    </div>
                    {isOpen ? (
                      <div className="mt-3 space-y-3 pl-9">
                        {(o.lineItems || []).map((li, idx) => {
                          const meta = { title: li.productTitle, image: li.productImage, ...(productMeta[li.productId] || {}) };
                          const lineTotal = (li.unitPrice || 0) * (li.qty || 0);
                          return (
                            <div key={idx} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <img
                                  src={meta.image ? getOptimizedImageUrl(meta.image, { width: 100, quality: 75 }) : '/next.svg'}
                                  alt={meta.title || 'Product'}
                                  onError={(e) => {
                                    if (meta.image && e.currentTarget.src !== meta.image) {
                                      e.currentTarget.src = meta.image;
                                    }
                                  }}
                                  className="h-9 w-9 rounded-md object-cover bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                                />
                                <Link href={`/marketplace/${li.productId}`} className="truncate text-sm text-gray-700 dark:text-gray-200 hover:underline">{meta.title || 'Product'} <span className="text-xs text-gray-500">× {li.qty}</span></Link>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap flex-shrink-0">
                                <div className="font-medium text-gray-900 dark:text-white">{lineTotal.toLocaleString()} {o.currency || 'NGN'}</div>
                                <div className="text-xs text-gray-500">@ {li.unitPrice.toLocaleString()} {o.currency || 'NGN'}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
          {/* Pagination */}
          {total > pageSize ? (
            <div className="mt-6 flex items-center justify-end gap-2 text-sm">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{translate(locale, "orders.list.prev")}</button>
              <span className="text-gray-600 dark:text-gray-400">{translate(locale, "orders.list.page", { number: page })}</span>
              <button disabled={(page * pageSize) >= total} onClick={() => setPage((p) => p + 1)} className={`rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium ${((page * pageSize) >= total) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{translate(locale, "orders.list.next")}</button>
            </div>
          ) : null}
        </section>

        {/* Calendar Popups */}
        {showFromPicker ? (
          <>
            <div className="fixed inset-0 z-[9998] bg-black/20" onClick={() => setShowFromPicker(false)} />
            <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 sm:left-auto sm:right-auto sm:top-[220px] sm:translate-y-0 z-[9999] w-auto sm:w-[18rem] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Calendar locale={locale} value={range.from} onChange={(v) => { setRange((r) => ({ ...r, from: v })); setShowFromPicker(false); }} />
            </div>
          </>
        ) : null}

        {showToPicker ? (
          <>
            <div className="fixed inset-0 z-[9998] bg-black/20" onClick={() => setShowToPicker(false)} />
            <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 sm:left-auto sm:right-auto sm:top-[220px] sm:translate-y-0 z-[9999] w-auto sm:w-[18rem] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Calendar locale={locale} value={range.to} onChange={(v) => { setRange((r) => ({ ...r, to: v })); setShowToPicker(false); }} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}


// Minimal calendar popover (no dependency)
function Calendar({ value, onChange, locale }: { value?: string; onChange: (v: string) => void; locale: Locale }) {
  const today = new Date(value || Date.now());
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const leading: (number | null)[] = Array.from({ length: startDay }, () => null);
  const days: (number | null)[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks: (number | null)[] = leading.concat(days);
  const rows = Math.ceil(weeks.length / 7);
  const grid: (number | null)[][] = Array.from({ length: rows }, (_, r) => weeks.slice(r * 7, r * 7 + 7));
  const pad = (n: number) => String(n).padStart(2, '0');
  const sel = value ? new Date(value) : null;
  const isSel = (d: number) => sel && sel.getFullYear() === y && sel.getMonth() === m && sel.getDate() === d;
  const label = new Date(y, m, 1).toLocaleString(locale, { month: 'long', year: 'numeric' });
  return (
    <div className="w-full select-none">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => setM((mm) => (mm === 0 ? (setY(y - 1), 11) : mm - 1))} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft className="w-4 h-4" /></button>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
        <button onClick={() => setM((mm) => (mm === 11 ? (setY(y + 1), 0) : mm + 1))} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {[...Array(7)].map((_, i) => {
          const d = new Date(2024, 0, 7 + i); // Jan 7, 2024 was a Sunday
          return <div key={i}>{d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2)}</div>;
        })}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
        {grid.flat().map((d, i) => (
          <button key={i} disabled={!d} onClick={() => onChange(`${y}-${pad(m + 1)}-${pad(d!)}`)} className={`h-8 rounded text-sm ${!d ? 'opacity-0' : isSel(d!) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{d || ''}</button>
        ))}
      </div>
    </div>
  );
}


