"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPatch, apiGetBlob, getAuthHeader } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { Check, ChevronRight, Package, Truck, BadgeCheck, Printer, ChevronLeft, RotateCcw, FileText, MapPin, Clock, X, Star, ArrowLeft } from "lucide-react";
import ReviewForm from "@/components/reviews/ReviewForm";
import { getStoredLocale, Locale, translate } from "@/utils/i18n";
import { getOptimizedImageUrl } from "@/utils/image";


type OrderDoc = {
  _id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "disputed";
  paymentStatus?: "pending" | "completed" | "failed" | "refunded";
  totalPrice?: number;
  currency?: string;
  createdAt?: string;
  lineItems?: { productId: string; vendorId?: string; qty: number; unitPrice: number; currency?: string; productTitle?: string; productImage?: string }[];
  shippingDetails?: { address: string; city: string; country: string; postalCode?: string };
  buyer?: { username?: string; email?: string; phone?: string; country?: string };
  invoiceNumber?: string;
  purchaseOrderNumber?: string;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrack, setShowTrack] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [reorderDone, setReorderDone] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{
    productId: string;
    productTitle: string;
    productImage?: string;
  } | null>(null);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getStoredLocale());
    const handleLangChange = () => setLocale(getStoredLocale());
    window.addEventListener("i18n:locale", handleLangChange);
    return () => window.removeEventListener("i18n:locale", handleLangChange);
  }, []);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const json = await apiGet<{ status: string; data: OrderDoc }>(`/api/v1/orders/${id}`);
      setOrder(json?.data || null);
    } catch (e: any) {
      toast(e?.message || translate(locale, "orders.details.toast.failedLoad"), "error");
    } finally { setLoading(false); }

  };

  useEffect(() => { fetchOrder(); }, [id]);

  // Check which products have already been reviewed
  useEffect(() => {
    const checkReviewedProducts = async () => {
      if (!order?.lineItems) return;

      try {
        const reviewedSet = new Set<string>();

        // Check each product in the order
        for (const item of order.lineItems) {
          const productId = String(item.productId);
          try {
            const json = await apiGet<any>(`/api/v1/market/products/${productId}/reviews`);
            const reviews = json?.data?.reviews || json?.data || [];

            // Check if current user has reviewed this product
            const user = JSON.parse(localStorage.getItem('afritrade:user') || '{}');
            const userId = user?.id || user?._id;

            if (userId && reviews.some((review: any) => review.user._id === userId)) {
              reviewedSet.add(productId);
            }
          } catch (error) {
            console.error(`Failed to check reviews for product ${productId}:`, error);
          }
        }

        setReviewedProducts(reviewedSet);
      } catch (error) {
        console.error('Failed to check reviewed products:', error);
      }
    };

    if (order?.status === 'delivered') {
      checkReviewedProducts();
    }
  }, [order]);

  const total = useMemo(() => order?.totalPrice || 0, [order]);
  const currency = order?.currency || "NGN";

  const updateStatus = async (status: string) => {
    try {
      await apiPatch(`/api/v1/orders/${id}/status`, { status });
      toast(translate(locale, "orders.details.toast.updated"), "success");
      fetchOrder();
    } catch (e: any) { toast(e?.message || translate(locale, "orders.details.toast.updateFailed"), "error"); }

  };

  const handleDownloadInvoice = async () => {
    try {
      toast(translate(locale, "orders.details.toast.generatingInvoice"), "info");
      // Download invoice
      const blob = await apiGetBlob(`/api/v1/orders/${id}/invoice/download`);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order?.invoiceNumber || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast(translate(locale, "orders.details.toast.invoiceDownloaded"), "success");
    } catch (e: any) {
      console.error("Download error:", e);
      toast(translate(locale, "orders.details.toast.invoiceFailed"), "error");
    }

  };

  const performReorder = () => {
    try {
      const items = order?.lineItems || [];
      // Build current cart map id -> qty
      const oldArr: string[] = JSON.parse(localStorage.getItem("cart") || "[]");
      const currentMap = oldArr.reduce<Record<string, number>>((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
      // For each line item, ensure cart qty is at least li.qty (merge, not duplicate on repeated reorder)
      for (const li of items) {
        const pid = String(li.productId);
        const desired = Math.max(1, li.qty || 1);
        currentMap[pid] = Math.max(currentMap[pid] || 0, desired);
      }
      // Expand back to array
      const mergedArr: string[] = [];
      Object.entries(currentMap).forEach(([pid, qty]) => {
        for (let i = 0; i < qty; i++) mergedArr.push(pid);
      });
      localStorage.setItem("cart", JSON.stringify(mergedArr));
      window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: mergedArr.length } }));
      setReorderDone(true);
    } catch { }
  };

  const hasAllItemsInCart = (): boolean => {
    try {
      const items = order?.lineItems || [];
      const oldArr: string[] = JSON.parse(localStorage.getItem("cart") || "[]");
      const map = oldArr.reduce<Record<string, number>>((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
      for (const li of items) {
        const pid = String(li.productId);
        const need = Math.max(1, li.qty || 1);
        if ((map[pid] || 0) < need) return false;
      }
      return true;
    } catch { return false; }
  };

  useEffect(() => {
    const onCart = () => {
      if (showReorder) setReorderDone(hasAllItemsInCart());
    };
    window.addEventListener("cart:update", onCart as EventListener);
    return () => window.removeEventListener("cart:update", onCart as EventListener);
  }, [showReorder, order]);

  const StatusChip = ({ s }: { s?: string }) => {
    if (!s) return null;
    const map: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300", delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300", disputed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[s] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}>{translate(locale, `orders.status.${s}`)}</span>;
  };
  const PayChip = ({ s }: { s?: string }) => {
    if (!s) return null;
    const map: Record<string, string> = { completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200", failed: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300", refunded: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[s] || map.pending}`}>{translate(locale, `orders.paymentStatus.${s}`)}</span>;
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">{translate(locale, "orders.breadcrumb.home")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/orders" className="hover:text-gray-900 dark:hover:text-white transition-colors">{translate(locale, "orders.breadcrumb.orders")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-white font-medium">{translate(locale, "orders.breadcrumb.orderDetails", { id: String(id).slice(-6) })}</span>
        </nav>


        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          {loading ? (
            <div className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
          ) : !order ? (
            <div className="text-sm text-gray-500">{translate(locale, "orders.details.notFound")}</div>
          ) : (

            <div className="space-y-4">
              {/* Back Button */}
              <Link href="/orders" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {translate(locale, "orders.breadcrumb.back")}
              </Link>


              {/* Header */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/90 to-blue-600 text-white shadow-lg"><Package size={16} className="sm:w-[18px] sm:h-[18px]" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.details.title", { id: order._id.slice(-6) })}</div>

                    <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                      <StatusChip s={order.status} />
                      <PayChip s={order.paymentStatus} />
                      <span className="hidden sm:inline">• {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</span>
                      <span className="sm:hidden">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</span>
                      {order.purchaseOrderNumber && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          PO: {order.purchaseOrderNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                  <button onClick={() => setShowTrack(true)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><Truck className="w-4 h-4" /> {translate(locale, "orders.details.actions.track")}</button>
                  <button onClick={() => { setReorderDone(hasAllItemsInCart()); setShowReorder(true); }} className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{translate(locale, "orders.details.actions.reorder")}</button>
                  <button onClick={() => setShowInvoicePreview(true)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><FileText className="w-4 h-4" /> {translate(locale, "orders.details.actions.invoice")}</button>
                  <button onClick={() => window.print()} className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><Printer className="w-4 h-4" /> {translate(locale, "orders.details.actions.print")}</button>
                </div>

              </div>

              {/* Items */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.details.invoice.items")}</div>

                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {(order.lineItems || []).map((li, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={li.productImage ? getOptimizedImageUrl(li.productImage, { width: 150, quality: 75 }) : '/next.svg'}
                          alt={li.productTitle || `Product ${String(li.productId).slice(-6)}`}
                          onError={(e) => {
                            if (li.productImage && e.currentTarget.src !== li.productImage) {
                              e.currentTarget.src = li.productImage;
                            }
                          }}
                          className="h-12 w-12 rounded object-cover bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate text-gray-900 dark:text-white">{li.productTitle || `Product ${String(li.productId).slice(-6)}`}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{translate(locale, "orders.details.items.qty", { count: String(li.qty) })} • {(li.unitPrice || 0).toLocaleString()} {li.currency || "NGN"}</div>
                        </div>


                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{(li.unitPrice * li.qty).toLocaleString()} {li.currency || "NGN"}</div>
                        {/* Individual Review Button for each product */}
                        {order.status === "delivered" && (
                          reviewedProducts.has(String(li.productId)) ? (
                            // Already reviewed - show disabled button
                            <button
                              disabled
                              className="rounded-full border border-green-300 px-3 py-1 text-xs inline-flex items-center gap-1 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:border-green-700 dark:text-green-400"
                            >
                              <Check className="w-3 h-3" /> {translate(locale, "orders.details.items.reviewed")}
                            </button>


                          ) : (
                            // Not reviewed yet - show active review button
                            <button
                              onClick={() => {
                                setSelectedProductForReview({
                                  productId: String(li.productId),
                                  productTitle: li.productTitle || `Product ${String(li.productId).slice(-6)}`,
                                  productImage: li.productImage
                                });
                                setShowReviewModal(true);
                              }}
                              className="rounded-full border border-orange-200 px-3 py-1 text-xs inline-flex items-center gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300 transition-colors"
                            >
                              <Star className="w-3 h-3" /> {translate(locale, "orders.details.items.review")}
                            </button>


                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary & Shipping */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.details.summary.title")}</div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{translate(locale, "orders.details.summary.subtotal")}</span><span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString()} {currency}</span></div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.details.summary.shipping")}</div>


                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{order.shippingDetails?.address}</div>
                      <div className="text-gray-500 text-xs">{order.shippingDetails?.city}, {order.shippingDetails?.country}</div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{order.buyer?.username}{order.buyer?.email ? ` • ${order.buyer.email}` : ''}{order.buyer?.phone ? ` • ${order.buyer.phone}` : ''}{order.buyer && (order as any).buyer.city ? ` • ${(order as any).buyer.city}` : ''}{order.buyer?.country ? ` • ${order.buyer.country}` : ''}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contextual actions */}
              <div className="flex flex-wrap items-center gap-2">
                {(order.status === "pending" || order.status === "processing") && (
                  <button onClick={() => setShowCancelConfirm(true)} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium inline-flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><X className="w-4 h-4" /> {translate(locale, "orders.details.actions.cancel")}</button>
                )}
                {order.status === "shipped" && (
                  <button onClick={() => updateStatus("delivered")} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium inline-flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><Check className="w-4 h-4" /> {translate(locale, "orders.details.actions.markReceived")}</button>
                )}
              </div>

            </div>
          )}
        </section>

        {/* Tracking modal */}
        {showTrack ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowTrack(false)} />
            <div className="relative z-10 w-[95%] max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-2xl mt-4 mb-4">
              <div className="mb-4 text-base font-semibold inline-flex items-center gap-2 text-gray-900 dark:text-white"><Truck className="w-5 h-5" /> {translate(locale, "orders.details.tracking.title")}</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Clock className="w-4 h-4" /> {translate(locale, "orders.details.tracking.status")}</div>
              </div>
              <div className="mt-6 flex gap-2"><button onClick={() => setShowTrack(false)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{translate(locale, "orders.details.tracking.close")}</button></div>
            </div>

          </div>
        ) : null}

        {/* Reorder confirm modal */}
        {showReorder ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowReorder(false)} />
            <div className="relative z-10 w-[95%] max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-2xl mt-4 mb-4">
              <div className="text-base font-semibold mb-2 text-gray-900 dark:text-white">{reorderDone ? translate(locale, "orders.details.reorder.successTitle") : translate(locale, "orders.details.reorder.confirmTitle")}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{translate(locale, "orders.details.reorder.desc")}</div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => { if (!reorderDone) { performReorder(); } }} disabled={reorderDone} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${reorderDone ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'}`}>{reorderDone ? translate(locale, "orders.details.reorder.added") : translate(locale, "orders.details.reorder.confirm")}</button>
                <button onClick={() => { setShowReorder(false); setReorderDone(false); }} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{translate(locale, "orders.details.reorder.close")}</button>
              </div>
            </div>

          </div>
        ) : null}

        {/* Order Cancellation Confirmation Modal */}
        {showCancelConfirm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelConfirm(false)} />
            <div className="relative z-10 w-[95%] max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-2xl mt-4 mb-4">
              <div className="text-center mb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {translate(locale, "orders.details.cancel.modalTitle", { id: id?.slice(-6) || '' })}
                </h3>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                <p className="mb-3">
                  {translate(locale, "orders.details.cancel.confirm")}
                </p>

                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <div className="font-medium text-amber-800 dark:text-amber-200 mb-2 text-sm">{translate(locale, "orders.details.cancel.consequencesTitle")}</div>
                  <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                    <li>• {translate(locale, "orders.details.cancel.consequences.marked")}</li>
                    <li>• {translate(locale, "orders.details.cancel.consequences.refunded")}</li>
                    <li>• {translate(locale, "orders.details.cancel.consequences.notified")}</li>
                    <li>• {translate(locale, "orders.details.cancel.consequences.restored")}</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {translate(locale, "orders.details.cancel.keep")}
                </button>
                <button
                  onClick={async () => {
                    try {
                      await updateStatus("cancelled");
                      setShowCancelConfirm(false);
                    } catch (error) {
                      // Error already handled in updateStatus
                    }
                  }}
                  className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                >
                  {translate(locale, "orders.details.cancel.yesCancel")}
                </button>

              </div>
            </div>
          </div>
        ) : null}

        {/* Invoice Preview Modal */}
        {showInvoicePreview ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowInvoicePreview(false)} />
            <div className="relative z-10 w-[95%] max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl mt-4 mb-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.details.invoice.preview")}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{translate(locale, "orders.details.title", { id: order?._id.slice(-6) || '' })}</p>
                  </div>

                </div>
                <button onClick={() => setShowInvoicePreview(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Invoice Content */}
              <div className="p-6 space-y-6">
                {/* Invoice Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{translate(locale, "orders.details.invoice.number")}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order?.invoiceNumber || `INV-${order?._id.slice(-8)}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{translate(locale, "orders.details.invoice.date")}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{translate(locale, "orders.details.invoice.status")}</p>
                    <div className="inline-block"><StatusChip s={order?.status} /></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{translate(locale, "orders.details.invoice.paymentStatus")}</p>
                    <div className="inline-block"><PayChip s={order?.paymentStatus} /></div>
                  </div>
                </div>


                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700" />

                {/* Shipping Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{translate(locale, "orders.details.invoice.shippingAddress")}</h4>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{order?.buyer?.username}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{order?.shippingDetails?.address}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{order?.shippingDetails?.city}, {order?.shippingDetails?.country}</p>
                    {order?.shippingDetails?.postalCode && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{order.shippingDetails.postalCode}</p>
                    )}
                    {order?.buyer?.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{order.buyer.email}</p>
                    )}
                    {order?.buyer?.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{order.buyer.phone}</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700" />

                {/* Line Items */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{translate(locale, "orders.details.invoice.items")}</h4>

                  <div className="space-y-3">
                    {(order?.lineItems || []).map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex items-start gap-3 flex-1">
                          <img
                            src={item.productImage ? getOptimizedImageUrl(item.productImage, { width: 150, quality: 75 }) : '/next.svg'}
                            alt={item.productTitle || 'Product'}
                            onError={(e) => {
                              if (item.productImage && e.currentTarget.src !== item.productImage) {
                                e.currentTarget.src = item.productImage;
                              }
                            }}
                            className="w-12 h-12 rounded object-cover bg-gray-100 dark:bg-gray-700"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.productTitle || `Product ${String(item.productId).slice(-6)}`}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{translate(locale, "orders.details.items.qty", { count: String(item.qty) })}: {item.qty} × {(item.unitPrice || 0).toLocaleString()} {item.currency || 'NGN'}</p>
                          </div>


                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{((item.unitPrice || 0) * item.qty).toLocaleString()} {item.currency || 'NGN'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700" />

                {/* Total */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">{translate(locale, "orders.details.invoice.totalAmount")}</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{total.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
                <button onClick={() => setShowInvoicePreview(false)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-white dark:hover:bg-gray-800 transition-colors">{translate(locale, "orders.details.reorder.close")}</button>
                <button onClick={() => { handleDownloadInvoice(); setShowInvoicePreview(false); }} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  {translate(locale, "orders.details.invoice.download")}
                </button>

              </div>
            </div>
          </div>
        ) : null}

        {/* Review Modal */}
        {showReviewModal && selectedProductForReview && (
          <ReviewForm
            productId={selectedProductForReview.productId}
            productTitle={selectedProductForReview.productTitle}
            orderInfo={{
              orderId: id || "",
              isVerifiedPurchase: true
            }}
            onReviewSubmitted={() => {
              setShowReviewModal(false);
              setSelectedProductForReview(null);
              toast(translate(locale, "orders.details.messages.reviewSubmitted"), "success");
              // Refresh the reviewed products list

              if (order?.lineItems) {
                const updatedReviewed = new Set(reviewedProducts);
                updatedReviewed.add(selectedProductForReview.productId);
                setReviewedProducts(updatedReviewed);
              }
            }}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedProductForReview(null);
            }}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
