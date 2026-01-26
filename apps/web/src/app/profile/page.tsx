"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag, TicketPercent, Building, Wallet, MapPin, CreditCard, Globe, Sun, Shield, Bell, Settings, PackageSearch, Store, UserPlus, LogOut, ChevronRight, Trash2, Star, Clock, XCircle, AlertTriangle, Eye, ArrowLeft, Briefcase, CheckCircle2, Camera, Mail, Phone, RefreshCw } from "lucide-react";
import { RequireAuth } from "@/components/auth/Guards";
import Modal from "@/components/common/Modal";
import { toast } from "@/components/common/Toast";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/utils/api";
import { clearUserData, logout, getUserId } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { getCountryPhoneCode, getStatesForCountry, getCitiesForState, getCountryNames } from "@/utils/countryData";
import { getStoredLocale, setStoredLocale, translate, Locale } from "@/utils/i18n";
import { getOptimizedImageUrl } from "@/utils/image";

// Shared UI classes for headers inside cards (module scope so subcomponents can reuse)
const CARD_HEADER = "flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 px-3 py-2";

interface Bank {
  name: string;
  code: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const fetchLocale = () => {
      const stored = getStoredLocale();
      setLocale(stored);
      setPrefs(prev => ({ ...prev, language: stored }));
    };
    fetchLocale();
    window.addEventListener("i18n:locale", fetchLocale);
    return () => window.removeEventListener("i18n:locale", fetchLocale);
  }, []);

  const [firstName, setFirstName] = useState(translate(locale, "common.guest"));
  const [lastName, setLastName] = useState("");
  const [tier, setTier] = useState<"Bronze" | "Silver" | "Gold">("Bronze");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, wallet: 0 });
  const [userWalletId, setUserWalletId] = useState<string | null>(null);
  const [sellerStats, setSellerStats] = useState({
    activeProducts: 0,
    pendingSales: 0,
    completedSales: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });
  const [sellerStatsLoading, setSellerStatsLoading] = useState(false);
  const [addrMeta, setAddrMeta] = useState<{ count: number; defaultLine: string }>({ count: 0, defaultLine: "" });
  const [emailVerified, setEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  type Address = { id: string; street: string; city: string; state: string; country: string; phone: string; isDefault?: boolean };
  const [addrList, setAddrList] = useState<Address[]>([]);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [trackModal, setTrackModal] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState({ old: "", next: "", confirm: "" });

  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Copy wallet ID function
  const copyWalletId = () => {
    if (userWalletId) {
      navigator.clipboard.writeText(userWalletId);
      // You can add a toast notification here if you have a toast system
      alert(translate(locale, "profile.toast.walletIdCopied"));
    }
  };
  const [deletionStatus, setDeletionStatus] = useState<{
    isDeletionRequested: boolean;
    deletionRequestedAt?: Date;
    gracePeriodEndsAt?: Date;
    canDelete: boolean;
    reason?: string;
    unsettledOrders?: number;
  } | null>(null);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [showUnsettledOrdersModal, setShowUnsettledOrdersModal] = useState(false);
  const [unsettledOrdersInfo, setUnsettledOrdersInfo] = useState<{
    reason: string;
    unsettledOrders: number;
  } | null>(null);
  const [prefLangOpen, setPrefLangOpen] = useState(false);
  const [prefCountryOpen, setPrefCountryOpen] = useState(false);
  const [prefs, setPrefs] = useState({ language: "en", currency: "ATH", country: "Nigeria", theme: "system" });
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{ username: string; email: string; phone: string; profileImage?: string }>({ username: "", email: "", phone: "" });

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("afritrade:user");
      if (raw) {
        const obj = JSON.parse(raw);
        const f = obj?.username || obj?.firstName || (obj?.name ? String(obj.name).split(" ")[0] : translate(locale, "common.guest"));
        const l = obj?.lastName || (obj?.name ? String(obj.name).split(" ").slice(1).join(" ") : "");
        setFirstName(String(f)); setLastName(String(l));
        setEmailVerified(Boolean(obj?.emailVerified));
        setUserEmail(String(obj?.email || ""));

        // SINGLE VENDOR: Only admin is considered "seller" for UI purposes
        const admin = ['admin', 'superadmin'].includes(String(obj?.role || "").toLowerCase());
        setIsAdmin(admin);
        setIsSeller(admin); // Reuse isSeller to show/hide relevant cards if needed, or manage separately

        // Initialize form with user data
        setForm({ username: obj?.username || "", email: obj?.email || "", phone: obj?.phone || "", profileImage: obj?.profileImage || "" });

        // Initialize account type and business info from local storage
        setAccountType(obj?.accountType || "individual");
        setBusinessInfo(obj?.businessInfo || null);

        // Load avatar from user data - ensure it's a full URL
        const profileImage = obj?.profileImage;
        if (profileImage && !profileImage.startsWith('http')) {
          // If it's just a filename, don't set it as avatar
          setAvatar(null);
        } else {
          setAvatar(profileImage || null);
        }
        // simple tier heuristic
        setTier("Bronze");
      }
    } catch { }
    // Ensure seller status reflects server (in case local cache is stale)
    (async () => {
      try {
        const uid = getUserId(); if (!uid) return;
        const json = await apiGet<{ data: any }>(`/api/v1/users/profile/${uid}`);
        const u = json?.data || {};

        const admin = ['admin', 'superadmin'].includes(String(u?.role || "").toLowerCase());
        setIsAdmin(admin);
        setIsSeller(admin);

        // Load avatar from server data - ensure it's a full URL
        const profileImage = u?.profileImage;
        if (profileImage && !profileImage.startsWith('http')) {
          // If it's just a filename, don't set it as avatar
          setAvatar(null);
        } else {
          setAvatar(profileImage || null);
        }

        // Load wallet ID
        setUserWalletId(u?.walletId || null);

        // Set account type and business info
        setAccountType(u?.accountType || "individual");
        setBusinessInfo(u?.businessInfo || null);

        // hydrate local user cache with role/store to keep UI consistent
        try {
          const raw = localStorage.getItem("afritrade:user");
          if (raw) {
            const prev = JSON.parse(raw);
            const next = { ...prev, role: u?.role || prev?.role, store: u?.store || prev?.store };
            localStorage.setItem("afritrade:user", JSON.stringify(next));
            window.dispatchEvent(new CustomEvent("auth:update", { detail: { user: next } }));
          }
        } catch { }
      } catch { }
    })();
    try {
      const cartRaw = localStorage.getItem("cart");
      const wishRaw = localStorage.getItem("wishlist");
      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      const wish = wishRaw ? JSON.parse(wishRaw) : [];
      setStats((s) => ({ ...s, wishlist: wish.length }));
    } catch { }
    // Fetch orders count
    (async () => {
      try {
        const uid = getUserId(); if (!uid) return;
        const json = await apiGet<{ data: { total: number } }>(`/api/v1/orders`, { query: { buyerId: uid, limit: 1 } });
        const total = json?.data?.total || 0;
        setStats((s) => ({ ...s, orders: Number(total) || 0 }));
      } catch { }
    })();
    // Load addresses meta for Payments & Address card
    (async () => {
      try {
        const json = await apiGet<{ data: Address[] }>(`/api/v1/users/me/addresses`);
        const list: Address[] = Array.isArray(json?.data) ? json.data : [];
        const def = list.find((a: any) => a.isDefault);
        setAddrMeta({ count: list.length, defaultLine: def ? `${def.street}, ${def.city}` : "" });
        setAddrList(list);
      } catch { }
    })();





    // Load user reviews
    (async () => {
      try {
        setReviewsLoading(true);
        const json = await apiGet<{ data: { reviews: any[] } }>(`/api/v1/market/reviews`, { query: { limit: 100 } });
        const reviewsData = json?.data || {};
        const reviewsArray = reviewsData.reviews || [];
        setReviews(reviewsArray);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    })();

    // Check account deletion status
    checkDeletionStatus();

    // Fetch seller statistics if user is a seller
    (async () => {
      try {
        const uid = getUserId(); if (!uid) return;
        const json = await apiGet<{ data: any }>(`/api/v1/users/profile/${uid}`);
        const user = json?.data || {};
        // Check if user is admin (in single-vendor mode, admin manages the store)
        const isAdminUser = ['admin', 'superadmin'].includes(String(user?.role || "").toLowerCase());
        if (isAdminUser) {
          setSellerStatsLoading(true);
          try {
            // Use admin dashboard endpoint for accurate stats
            const dashboardJson = await apiGet<{ data: any }>(`/api/v1/admin/dashboard`);
            const data = dashboardJson?.data || {};

            setSellerStats({
              activeProducts: data.totalProducts || 0,
              totalRevenue: data.totalRevenue || 0,
              pendingOrders: data.totalOrders || 0,
              pendingSales: 0,
              completedSales: 0,
              totalOrders: 0,
              shippedOrders: 0,
              deliveredOrders: 0,
              cancelledOrders: 0
            });
          } catch { } finally { setSellerStatsLoading(false); }
        }
      } catch { }
    })();
    const onWish = (e: Event) => { const count = (e as CustomEvent).detail?.count ?? 0; setStats((s) => ({ ...s, wishlist: Number(count) || 0 })); };
    window.addEventListener("wishlist:update", onWish as EventListener);

    // Initial prefs hydration
    try {
      const storedPrefs = localStorage.getItem("afritrade:prefs");
      if (storedPrefs) {
        setPrefs(prev => ({ ...prev, ...JSON.parse(storedPrefs) }));
      }
    } catch { }

    return () => { window.removeEventListener("wishlist:update", onWish as EventListener); };
  }, []);

  const name = useMemo(() => `${firstName}${lastName ? ` ${lastName}` : ""}`, [firstName, lastName]);

  // neumorphic + flat hybrid card style
  const card = "rounded-2xl border border-neutral-200 bg-white p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] shadow-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/60";
  const iconWrap = "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-black to-black text-white shadow-sm";
  // const cardHeader = CARD_HEADER;

  const savePrefs = async (patch: Partial<typeof prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try { localStorage.setItem("afritrade:prefs", JSON.stringify(next)); } catch { }

    //  if (patch.theme) {
    //   const t = patch.theme;
    //   if (t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) document.documentElement.classList.add("dark");
    //   else document.documentElement.classList.remove("dark");
    //   try { localStorage.setItem("theme", t === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : t); } catch { }
    // }

    // Force light mode
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    if (patch.language) { setStoredLocale(patch.language as Locale); }
    if (patch.currency) { try { localStorage.setItem("currency", patch.currency); } catch { } }
    if (patch.country) { try { localStorage.setItem("country", patch.country); } catch { } }

    window.dispatchEvent(new CustomEvent("prefs:update", { detail: patch }));
    try { await apiPut("/api/v1/users/me", { preferences: next }); } catch { }
  };

  const checkDeletionStatus = async () => {
    try {
      const json = await apiGet<{ data: any }>(`/api/v1/users/me/deletion-status`);
      setDeletionStatus(json.data);
    } catch (error) {
      console.error('Failed to check deletion status:', error);
    }
  };

  const requestAccountDeletion = async (reason?: string) => {
    try {
      setDeletionLoading(true);
      const res = await apiPost<{ message: string }>(`/api/v1/users/me/delete-account`, { reason });

      toast(res.message || translate(locale, "profile.delete.status.requested"), 'success');

      // Logout user and redirect to homepage
      try {
        clearUserData();
      } catch (e) {
        console.error('Failed to clear auth data:', e);
      }

      // Redirect to homepage
      window.location.href = '/';
    } catch (e: any) {
      // Check if it's an unsettled orders error (400 status)
      if (e?.message && e.message.includes('unsettled order')) {
        setUnsettledOrdersInfo({
          reason: e.message,
          unsettledOrders: parseInt(e.message.match(/(\d+)/)?.[1] || '0')
        });
        setShowUnsettledOrdersModal(true);
      } else {
        toast(e?.message || translate(locale, "profile.delete.status.failedRequest"), 'error');
      }
    } finally {
      setDeletionLoading(false);
    }
  };

  const reactivateAccount = async () => {
    try {
      setDeletionLoading(true);
      const res = await apiPost<{ message: string }>(`/api/v1/users/me/reactivate-account`);

      toast(res.message || translate(locale, "profile.delete.status.reactivated"), 'success');
      await checkDeletionStatus(); // Refresh status
      setShowDelete(false);
    } catch (e: any) {
      toast(e?.message || translate(locale, "profile.delete.status.failedReactivate"), 'error');
    } finally {
      setDeletionLoading(false);
    }
  };

  const onSave = async () => {
    try {
      // Prefer userStore.js if present
      try {
        // @ts-ignore
        if (window.userStore?.updateUserProfile) {
          // @ts-ignore
          await window.userStore.updateUserProfile(form);
        } else {
          await apiPut("/api/v1/users/me", { username: form.username, email: form.email, phone: form.phone, profileImage: form.profileImage });
        }
        // update local cache
        try { const raw = localStorage.getItem("afritrade:user"); if (raw) { const u = JSON.parse(raw); const next = { ...u, ...form }; localStorage.setItem("afritrade:user", JSON.stringify(next)); window.dispatchEvent(new CustomEvent("auth:update", { detail: { user: next } })); } } catch { }
        toast(translate(locale, "profile.toast.profileUpdated"), "success");
        setEditing(false);
        // Update local state to reflect changes
        setFirstName(form.username || translate(locale, "common.guest"));
        setLastName("");
        setAvatar(form.profileImage || null);
      } catch (e: any) {
        toast(e?.message || translate(locale, "profile.toast.updateFailed"), "error");
      }
    } catch (e: any) {
      toast(e?.message || translate(locale, "profile.toast.updateFailed"), "error");
    }
  };

  const handleChangePassword = async () => {
    if (!pwd.next || pwd.next !== pwd.confirm) {
      toast(translate(locale, "profile.security.toast.match"), 'error');
      return;
    }
    try {
      await apiPost('/api/v1/auth/change-password', {
        oldPassword: pwd.old,
        newPassword: pwd.next,
        email: userEmail
      });
      toast(translate(locale, "profile.security.toast.updated"), 'success');
      setShowPwd(false);
      setPwd({ old: '', next: '', confirm: '' });
    } catch (e: any) {
      toast(e?.message || translate(locale, "profile.security.toast.failed"), 'error');
    }
  };

  // Card Component Definitions
  function AddressesCard({ cardClass }: { cardClass: string }) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddr, setEditingAddr] = useState<Address | null>(null);
    const [addrForm, setAddrForm] = useState({ street: "", city: "", state: "", country: "Nigeria", phone: "" });

    // Get available states and cities based on selected country
    const availableStates = getStatesForCountry(addrForm.country);
    const availableCities = addrForm.state ? getCitiesForState(addrForm.country, addrForm.state) : [];

    const loadAddresses = async () => {
      setLoading(true);
      try {
        const json = await apiGet<{ data: Address[] }>(`/api/v1/users/me/addresses`);
        setAddresses(Array.isArray(json?.data) ? json.data : []);
      } catch { } finally { setLoading(false); }
    };

    useEffect(() => { loadAddresses(); }, []);

    const saveAddress = async () => {
      try {
        const url = editingAddr
          ? `/api/v1/users/me/addresses/${editingAddr.id}`
          : `/api/v1/users/me/addresses`;
        const res = editingAddr ? await apiPut(url, addrForm) : await apiPost(url, addrForm);

        toast(editingAddr ? translate(locale, "profile.addresses.toast.updated") : translate(locale, "profile.addresses.toast.added"), "success");
        setShowModal(false);
        setEditingAddr(null);
        setAddrForm({ street: "", city: "", state: "", country: "Nigeria", phone: "" });
        loadAddresses();
      } catch (e: any) { toast(e?.message || translate(locale, "profile.addresses.toast.addedFailed"), "error"); }
    };

    const deleteAddress = async (id: string) => {
      try {
        await apiDelete(`/api/v1/users/me/addresses/${id}`);
        toast(translate(locale, "profile.addresses.toast.deleted"), "success");
        loadAddresses();
      } catch (e: any) { toast(e?.message || translate(locale, "profile.addresses.toast.deleteFailed"), "error"); }
    };

    const setDefaultAddress = async (id: string) => {
      try {
        await apiPut(`/api/v1/users/me/addresses/${id}/default`);
        toast(translate(locale, "profile.addresses.toast.defaultUpdated"), "success");
        loadAddresses();
      } catch (e: any) { toast(e?.message || translate(locale, "profile.addresses.toast.updatedFailed"), "error"); }
    };

    return (
      <div id="addresses" className={`${cardClass}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "profile.addresses.title")}</h3>
          </div>
          <button onClick={() => { setEditingAddr(null); setAddrForm({ street: "", city: "", state: "", country: "Nigeria", phone: "" }); setShowModal(true); }} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            + {translate(locale, "profile.addresses.addNew")}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">{translate(locale, "profile.addresses.noAddresses")}</div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="group relative rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{addr.street}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{translate(locale, "profile.addresses.default")}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {addr.city}, {addr.state}, {addr.country} • {addr.phone}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingAddr(addr); setAddrForm(addr); setShowModal(true); }} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                      {translate(locale, "common.edit")}
                    </button>
                    <button onClick={() => deleteAddress(addr.id)} className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-100 rounded-lg hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50">
                      {translate(locale, "common.delete")}
                    </button>
                  </div>
                </div>
                {!addr.isDefault && (
                  <button onClick={() => setDefaultAddress(addr.id)} className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {translate(locale, "profile.addresses.setAsDefault")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={<span className="text-lg font-semibold">{editingAddr ? translate(locale, "profile.addresses.modal.editTitle") : translate(locale, "profile.addresses.modal.addTitle")}</span>}
          size="md"
          footer={(
            <>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">{translate(locale, "common.cancel")}</button>
              <button onClick={saveAddress} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">{translate(locale, "common.save")}</button>
            </>
          )}
        >
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.addresses.modal.street")}</label>
              <input value={addrForm.street} onChange={(e) => setAddrForm((s) => ({ ...s, street: e.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.addresses.modal.country")}</label>
                <select
                  value={addrForm.country}
                  onChange={(e) => {
                    setAddrForm((s) => ({
                      ...s,
                      country: e.target.value,
                      state: "", // Reset state when country changes
                      city: ""   // Reset city when state changes
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                >
                  {getCountryNames().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.addresses.modal.phone")}</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600">
                    {getCountryPhoneCode(addrForm.country)}
                  </span>
                  <input value={addrForm.phone} onChange={(e) => setAddrForm((s) => ({ ...s, phone: e.target.value }))} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.addresses.modal.state")}</label>
                <select
                  value={addrForm.state}
                  onChange={(e) => {
                    setAddrForm((s) => ({
                      ...s,
                      state: e.target.value,
                      city: "" // Reset city when state changes
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                >
                  <option value="">{translate(locale, "profile.addresses.modal.selectState")}</option>
                  {availableStates.map(state => (
                    <option key={state.name} value={state.name}>{state.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.addresses.modal.city")}</label>
                <select
                  value={addrForm.city}
                  onChange={(e) => setAddrForm((s) => ({ ...s, city: e.target.value }))}
                  disabled={!addrForm.state}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 ${!addrForm.state ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">{addrForm.state ? translate(locale, "profile.addresses.modal.selectCity") : translate(locale, "profile.addresses.modal.selectState")}</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  function OrdersCard({ cardClass }: { cardClass: string }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState<{ open: boolean; orderId: string | null }>({ open: false, orderId: null });

    useEffect(() => {
      (async () => {
        try {
          const uid = getUserId(); if (!uid) return;
          setLoading(true);
          const json = await apiGet<{ data: { orders: any[] } }>(`/api/v1/orders`, { query: { buyerId: uid, limit: 5 } });
          if (json?.data?.orders) {
            setOrders(Array.isArray(json?.data?.orders) ? json.data.orders : []);
          }
        } catch { } finally { setLoading(false); }
      })();
    }, []);

    const cancelOrder = async () => {
      if (!cancelModal.orderId) return;
      try {
        await apiPost(`/api/v1/orders/${cancelModal.orderId}/cancel`);
        toast(translate(locale, "profile.orders.toast.cancelled"), "success");
        setCancelModal({ open: false, orderId: null });
        setOrders(orders.filter(o => o._id !== cancelModal.orderId));
      } catch (e: any) { toast(e?.message || translate(locale, "profile.orders.toast.cancelledFailed"), "error"); }
    };

    return (
      <div className={`${cardClass}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "profile.orders.title")}</h3>
          </div>
          <Link href="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">{translate(locale, "profile.orders.viewAll")}</Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">{translate(locale, "profile.orders.noOrders")}</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{translate(locale, "reviews.form.order")} {order.orderId || order._id.slice(-8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          order.status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()} • {prefs.currency} {order.totalAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/orders/${order._id}`} className="flex-1 px-3 py-1.5 text-xs font-medium text-center text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    {translate(locale, "profile.orders.viewDetails")}
                  </Link>
                  {order.status === 'pending' && (
                    <button onClick={() => setCancelModal({ open: true, orderId: order._id })} className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-100 rounded-lg hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300">
                      {translate(locale, "profile.orders.cancel")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          open={cancelModal.open}
          onClose={() => setCancelModal({ open: false, orderId: null })}
          title={<span className="flex items-center gap-2 text-rose-600"><XCircle size={18} /> {translate(locale, "profile.orders.modal.title")}</span>}
          size="sm"
          footer={(
            <>
              <button onClick={() => setCancelModal({ open: false, orderId: null })} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">{translate(locale, "profile.orders.modal.keep")}</button>
              <button onClick={cancelOrder} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700">{translate(locale, "profile.orders.modal.confirm")}</button>
            </>
          )}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">{translate(locale, "profile.orders.modal.message")}</p>
        </Modal>
      </div>
    );
  }

  function WishlistCard({ cardClass }: { cardClass: string }) {
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadWishlist = async () => {
        try {
          const raw = localStorage.getItem("wishlist");
          const ids: string[] = raw ? JSON.parse(raw) : [];

          if (ids.length === 0) {
            setWishlistItems([]);
            setLoading(false);
            return;
          }

          // Fetch details for top 3 items
          const topIds = ids.slice(0, 3);
          const items = await Promise.all(
            topIds.map(async (id) => {
              try {
                const json = await apiGet<{ data: any }>(`/api/v1/market/products/${id}`);
                return json.data;
              } catch {
                return null;
              }
            })
          );

          setWishlistItems(items.filter(Boolean));
        } catch {
          setWishlistItems([]);
        } finally {
          setLoading(false);
        }
      };

      loadWishlist();

      const onWishUpdate = () => loadWishlist();
      window.addEventListener("wishlist:update", onWishUpdate);
      return () => window.removeEventListener("wishlist:update", onWishUpdate);
    }, []);

    return (
      <div className={`${cardClass}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "profile.wishlist.title")}</h3>
          </div>
          <Link href="/wishlist" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">{translate(locale, "profile.orders.viewAll")}</Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">{translate(locale, "profile.wishlist.empty")}</div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((item, idx) => (
              <Link href={`/marketplace/${item._id}`} key={item._id || idx} className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:border-rose-300 dark:hover:border-rose-700 transition-all group">
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0] ? getOptimizedImageUrl(item.images[0], { width: 100, quality: 70 }) : `https://placehold.co/100?text=${encodeURIComponent(item.title)}`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <PackageSearch size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.currency || prefs.currency} {item.price?.toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  function SecurityCard({ cardClass }: { cardClass: string }) {
    return (
      <div className={`${cardClass}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "profile.security.title")}</h3>
        </div>

        <div className="space-y-4">
          <button onClick={() => setShowPwd(true)} className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.security.changePassword")}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "profile.security.updateRegularly")}</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.security.twoFactor")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "profile.security.comingSoon")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function BankAccountCard({ cardClass }: { cardClass: string }) {
    const [bankAccount, setBankAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [form, setForm] = useState({ accountNumber: "", bankCode: "", accountName: "", bankName: "" });
    const [error, setError] = useState("");

    const loadBankInfo = async () => {
      try {
        setLoading(true);
        const uid = getUserId();
        const json = await apiGet<{ data: any }>(`/api/v1/users/profile/${uid}`);
        const user = json.data;
        setBankAccount(user.bankAccount);
        if (user.bankAccount) {
          setForm(user.bankAccount);
        }
      } catch (err) {
        console.error("Error loading bank info:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchBanks = async () => {
      try {
        setLoadingBanks(true);
        const json = await apiGet<{ data: Bank[] }>("/api/v1/withdrawals/banks");
        setBanks(json.data);
      } catch (err) {
        console.error("Error fetching banks:", err);
      } finally {
        setLoadingBanks(false);
      }
    };

    const resolveAccount = async () => {
      if (!form.accountNumber || !form.bankCode) return;
      try {
        setIsResolving(true);
        setError("");
        const json = await apiGet<{ data: { accountName: string } }>(`/api/v1/withdrawals/resolve-account`, {
          query: { accountNumber: form.accountNumber, bankCode: form.bankCode }
        });
        setForm(s => ({ ...s, accountName: json.data.accountName }));
      } catch (err: any) {
        setError(err?.message || translate(locale, "profile.bank.modal.error.failed"));
      } finally {
        setIsResolving(false);
      }
    };

    const handleSave = async () => {
      try {
        await apiPut(`/api/v1/users/me`, { bankAccount: form });
        toast(translate(locale, "profile.bank.toast.updated"), "success");
        setShowModal(false);
        loadBankInfo();
      } catch (err: any) {
        toast(err?.message || translate(locale, "profile.bank.toast.failed"), "error");
      }
    };

    useEffect(() => {
      loadBankInfo();
    }, []);

    useEffect(() => {
      if (showModal && banks.length === 0) {
        fetchBanks();
      }
    }, [showModal]);

    useEffect(() => {
      if (form.accountNumber.length === 10 && form.bankCode) {
        resolveAccount();
      }
    }, [form.accountNumber, form.bankCode]);

    return (
      <div id="bank-account" className={`${cardClass}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "profile.bank.title")}</h3>
          </div>
          <button onClick={() => setShowModal(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            {bankAccount ? translate(locale, "profile.bank.edit") : `+ ${translate(locale, "profile.bank.add")}`}
          </button>
        </div>

        {loading ? (
          <div className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ) : !bankAccount ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            {translate(locale, "profile.bank.noDetails")}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{bankAccount.accountName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {bankAccount.bankName} • {bankAccount.accountNumber}
                </div>
              </div>
            </div>
          </div>
        )}

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={<span className="text-lg font-semibold">{translate(locale, "profile.bank.modal.title")}</span>}
          size="sm"
          footer={(
            <>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600">{translate(locale, "common.cancel")}</button>
              <button onClick={handleSave} disabled={!form.accountName} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{translate(locale, "profile.bank.modal.save")}</button>
            </>
          )}
        >
          <div className="space-y-4 py-2">
            {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{translate(locale, "profile.bank.modal.selectBank")}</label>
              <select
                value={form.bankCode}
                onChange={(e) => {
                  const b = banks.find(x => x.code === e.target.value);
                  setForm(s => ({ ...s, bankCode: e.target.value, bankName: b?.name || "" }));
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-600"
              >
                <option value="">{loadingBanks ? translate(locale, "common.loading") : translate(locale, "profile.bank.modal.selectBank")}</option>
                {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{translate(locale, "profile.bank.modal.accountNumber")}</label>
              <input
                maxLength={10}
                value={form.accountNumber}
                onChange={(e) => setForm(s => ({ ...s, accountNumber: e.target.value.replace(/\D/g, "") }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{translate(locale, "profile.bank.modal.accountName")}</label>
              <div className="relative">
                <input
                  readOnly
                  value={form.accountName}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
                  placeholder={isResolving ? translate(locale, "profile.bank.modal.resolving") : translate(locale, "profile.bank.modal.autoResolve")}
                />
                {isResolving && <div className="absolute right-3 top-1/2 -translate-y-1/2"><RefreshCw size={12} className="animate-spin text-blue-500" /></div>}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  function NotificationsCard({ cardClass }: { cardClass: string }) {
    const [notifPrefs, setNotifPrefs] = useState({
      orderUpdates: true,
      promotions: false,
      newsletter: false
    });

    const toggleNotif = (key: keyof typeof notifPrefs) => {
      const next = { ...notifPrefs, [key]: !notifPrefs[key] };
      setNotifPrefs(next);
      try { localStorage.setItem("notif-prefs", JSON.stringify(next)); } catch { }
    };

    return (
      <div className={`${cardClass}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "profile.notifications.title")}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.notifications.orderUpdates")}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "profile.notifications.orderUpdatesDesc")}</div>
            </div>
            <button
              onClick={() => toggleNotif('orderUpdates')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs.orderUpdates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPrefs.orderUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.notifications.promotions")}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "profile.notifications.promotionsDesc")}</div>
            </div>
            <button
              onClick={() => toggleNotif('promotions')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs.promotions ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPrefs.promotions ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.notifications.newsletter")}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "profile.notifications.newsletterDesc")}</div>
            </div>
            <button
              onClick={() => toggleNotif('newsletter')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs.newsletter ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPrefs.newsletter ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">{translate(locale, "nav.home")}</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-gray-900 dark:text-white font-medium">{translate(locale, "profile.title")}</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {accountType === 'business' ? (businessInfo?.businessType || translate(locale, "profile.businessAccount")) : translate(locale, "profile.individualAccount")}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{translate(locale, "profile.manageAccount")}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    try {
                      setFirstName("Guest");
                      setLastName("");
                      logout();
                      toast(translate(locale, "profile.toast.signedOut"), "success");
                    } catch { }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-rose-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  <span>{translate(locale, "profile.signOut")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Deletion Warning Banner */}
          {deletionStatus?.isDeletionRequested && (
            <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <div className="font-semibold text-rose-800 dark:text-rose-200">{translate(locale, "profile.accountDeleted")}</div>
                  {translate(locale, "profile.deletionDate", { date: deletionStatus.gracePeriodEndsAt ? new Date(deletionStatus.gracePeriodEndsAt).toLocaleDateString() : 'unknown date' })}
                </div>
                <button
                  onClick={reactivateAccount}
                  disabled={deletionLoading}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {deletionLoading ? 'Processing...' : 'Reactivate Account'}
                </button>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-gray-50 dark:ring-gray-900 bg-gray-100 dark:bg-gray-700">
                    {avatar ? (
                      <img src={getOptimizedImageUrl(avatar, { width: 200, height: 200, quality: 80 })} alt="avatar" className="h-full w-full object-cover" onError={(e) => {
                        if (avatar && e.currentTarget.src !== avatar) {
                          e.currentTarget.src = avatar;
                        }
                      }} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                        {firstName[0] || "?"}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tier === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                      tier === 'Silver' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}>
                      {translate(locale, "profile.member", { tier })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} />
                      {userEmail}
                    </div>
                    {form.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} />
                        {form.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {addrMeta.defaultLine || translate(locale, "profile.addresses.noAddresses")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-6 md:pt-0 md:pl-8 w-full md:w-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.orders}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{translate(locale, "profile.stats.orders")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wishlist}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{translate(locale, "profile.stats.wishlist")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{translate(locale, "profile.stats.reviews")}</div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {editing && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.displayName")}</label>
                    <input
                      value={form.username}
                      onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.email")}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.phone")}</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{translate(locale, "profile.profilePicture")}</label>
                    <AvatarUpload
                      currentAvatar={form.profileImage}
                      onAvatarChange={(avatarUrl) => setForm((s) => ({ ...s, profileImage: avatarUrl }))}
                      userId={getUserId() || ""}
                      editing={editing}
                      locale={locale}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    {translate(locale, "profile.cancel")}
                  </button>
                  <button
                    onClick={onSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                  >
                    {translate(locale, "profile.saveChanges")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/orders" className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.quickActions.orders")}</span>
            </Link>

            <Link href="/wishlist" className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
              <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-lg group-hover:bg-rose-200 dark:group-hover:bg-rose-800/40 transition-colors">
                <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.quickActions.wishlist")}</span>
            </Link>

            <Link href="/cart" className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors">
                <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.quickActions.cart")}</span>
            </Link>

            <Link href="/profile/vouchers" className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                <TicketPercent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{translate(locale, "profile.quickActions.vouchers")}</span>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <OrdersCard cardClass="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6" />
              <WishlistCard cardClass="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6" />
              <AddressesCard cardClass="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6" />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Admin Store Management - Only for admin users */}
              {isAdmin && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-500/5" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Store className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "profile.admin.title")}</h3>
                      </div>
                      <button
                        onClick={async () => {
                          setSellerStatsLoading(true);
                          try {
                            const dashboardJson = await apiGet<{ data: any }>(`/api/v1/admin/dashboard`);
                            const data = dashboardJson?.data || {};
                            setSellerStats({
                              activeProducts: data.totalProducts || 0,
                              totalRevenue: data.totalRevenue || 0,
                              pendingOrders: data.totalOrders || 0,
                              pendingSales: 0,
                              completedSales: 0,
                              totalOrders: 0,
                              shippedOrders: 0,
                              deliveredOrders: 0,
                              cancelledOrders: 0
                            });
                          } catch (err) {
                            console.error("Failed to fetch seller stats:", err);
                          } finally {
                            setSellerStatsLoading(false);
                          }
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={sellerStatsLoading}
                      >
                        <RefreshCw className={`w-4 h-4 text-gray-500 ${sellerStatsLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    {sellerStatsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                      </div>
                    ) : sellerStats ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{translate(locale, "profile.admin.activeProducts")}</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{sellerStats.activeProducts}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{translate(locale, "profile.admin.pendingOrders")}</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{sellerStats.pendingOrders}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{translate(locale, "profile.admin.totalRevenue")}</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {prefs.currency} {sellerStats.totalRevenue?.toLocaleString()}
                          </div>
                        </div>
                        <Link
                          href="/admin"
                          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm"
                        >
                          <Store className="w-4 h-4" />
                          {translate(locale, "profile.admin.goToDashboard")}
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{translate(locale, "profile.admin.refreshHint")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate(locale, "profile.preferences.title")}</h3>
                </div>
                <div className="space-y-4">
                  <button onClick={() => setPrefLangOpen(true)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{translate(locale, "profile.preferences.language")}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {({
                        en: 'English',
                        fr: 'Français',
                        es: 'Español',
                        zh: '中文',
                        ar: 'العربية',
                        ha: 'Hausa'
                      })[locale] || 'English'}
                    </span>
                  </button>
                  {/* <div className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Sun className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{translate(locale, "profile.preferences.theme")}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['light', 'system', 'dark'].map(v => (
                        <button
                          key={v}
                          onClick={() => savePrefs({ theme: v as any })}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${prefs.theme === v
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                            }`}
                        >
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Business Credit Info - Only for business accounts Coming Soon */}
              {/* {accountType === 'business' && businessInfo && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Credit</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Credit Limit</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {businessInfo.creditLimit?.toLocaleString()} {prefs.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Used</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {businessInfo.currentCreditUsage?.toLocaleString()} {prefs.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Available</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {((businessInfo.creditLimit || 0) - (businessInfo.currentCreditUsage || 0)).toLocaleString()} {prefs.currency}
                        </span>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all"
                          style={{ width: `${Math.min(100, ((businessInfo.currentCreditUsage || 0) / (businessInfo.creditLimit || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30">
                        {businessInfo.paymentTerms ? businessInfo.paymentTerms.toUpperCase() : 'PREPAID'}
                      </span>
                    </div>
                  </div>
                </div>
              )} */}

              <SecurityCard cardClass="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6" />
              <BankAccountCard cardClass="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6" />
              <NotificationsCard cardClass="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6" />

              {/* Danger Zone */}
              <div className="bg-rose-50 dark:bg-rose-900/10 rounded-xl shadow-sm border border-rose-200 dark:border-rose-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">{translate(locale, "profile.dangerZone")}</h3>
                </div>
                <p className="text-sm text-rose-700 dark:text-rose-300 mb-4">
                  {translate(locale, "profile.deleteWarning")}
                </p>
                <button
                  onClick={() => setShowDelete(true)}
                  className="w-full py-2 px-4 bg-white dark:bg-gray-800 border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 font-medium rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-sm"
                >
                  {translate(locale, "profile.deleteAccount")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Track Order modal */}
        <Modal
          open={trackModal.open}
          onClose={() => setTrackModal({ open: false, id: "" })}
          title={<span className="inline-flex items-center gap-2"><PackageSearch size={16} /> {translate(locale, "profile.track.modal.title")}</span>}
          size="sm"
          footer={(
            <>
              <button
                onClick={async () => {
                  const key = trackModal.id.trim();
                  if (!key) { toast(translate(locale, "profile.track.modal.error.empty"), "error"); return; }
                  try {
                    const json = await apiGet<{ data: any }>(`/api/v1/orders/resolve/${encodeURIComponent(key)}`);
                    const fullId = json?.data?.orderId;
                    if (!fullId) throw new Error(translate(locale, "profile.track.modal.error.resolveFailed"));
                    setTrackModal({ open: false, id: "" });
                    router.push(`/orders/${fullId}`);
                  } catch (e: any) {
                    toast(e?.message || translate(locale, "profile.track.modal.error.notFound"), "error");
                  }
                }}
                className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-black"
              >{translate(locale, "common.track")}</button>
              <button onClick={() => setTrackModal({ open: false, id: "" })} className="flex-1 rounded-full border px-4 py-2 text-sm">{translate(locale, "common.cancel")}</button>
            </>
          )}
        >
          <input
            autoFocus
            placeholder={translate(locale, "profile.track.modal.placeholder")}
            value={trackModal.id}
            onChange={(e) => setTrackModal((m) => ({ ...m, id: e.target.value }))}
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </Modal>

        {/* Addresses preview modal */}
        <Modal
          open={showAddrModal}
          onClose={() => setShowAddrModal(false)}
          title={<span className="inline-flex items-center gap-2"><MapPin size={16} /> {translate(locale, "profile.addresses.previewTitle")}</span>}
          size="sm"
          footer={(
            <>
              <button onClick={() => { setShowAddrModal(false); router.push("/profile#addresses"); }} className="flex-1 rounded-full border px-4 py-2 text-sm">{translate(locale, "common.manage")}</button>
              <button onClick={() => setShowAddrModal(false)} className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-black">{translate(locale, "common.close")}</button>
            </>
          )}
        >
          <div className="max-h-72 overflow-y-auto no-scrollbar space-y-2 pr-1">
            {addrList.length === 0 ? (
              <div className="text-sm text-neutral-500">{translate(locale, "profile.addresses.noAddresses")}</div>
            ) : addrList.map((a) => (
              <div key={a.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{a.street}</div>
                  {a.isDefault ? (<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{translate(locale, "profile.addresses.default")}</span>) : null}
                </div>
                <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">{a.city}, {a.state}, {a.country} • {a.phone}</div>
              </div>
            ))}
          </div>
        </Modal>

        {/* Change password modal */}
        <Modal
          open={showPwd}
          onClose={() => setShowPwd(false)}
          title={<span className="text-lg font-semibold">{translate(locale, "profile.security.modal.title")}</span>}
          size="sm"
          footer={(
            <>
              <button onClick={() => setShowPwd(false)} className="flex-1 rounded-full border px-4 py-2 text-sm">{translate(locale, "common.cancel")}</button>
              <button onClick={handleChangePassword} className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-black">{translate(locale, "common.save")}</button>
            </>
          )}
        >
          <div className="space-y-4 py-2">
            {['old', 'next', 'confirm'].map(k => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {translate(locale, `profile.security.modal.${k}`)}
                </label>
                <input
                  type="password"
                  placeholder={translate(locale, `profile.security.modal.${k}`)}
                  value={(pwd as any)[k]}
                  onChange={(e) => setPwd((s: any) => ({ ...s, [k]: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </div>
            ))}
          </div>
        </Modal>

        {/* Delete account modal */}
        <Modal open={showDelete} onClose={() => setShowDelete(false)} title={<span className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-300"><Trash2 size={16} /> {translate(locale, "profile.deleteAccount")}</span>} size="lg" footer={(
          <>
            <button onClick={() => setShowDelete(false)} className="flex-1 rounded-full border px-4 py-2 text-sm">{translate(locale, "profile.cancel")}</button>
            <button
              onClick={async () => {
                if (deleteConfirm !== 'DELETE') {
                  toast(translate(locale, "profile.delete.error.match"), 'error');
                  return;
                }
                try {
                  await requestAccountDeletion(deleteConfirm);
                } catch {
                  toast(translate(locale, "profile.delete.error.failed"), 'error');
                }
              }}
              disabled={deleteConfirm !== 'DELETE' || deletionLoading}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all ${deleteConfirm === 'DELETE' && !deletionLoading
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-neutral-400 cursor-not-allowed'
                }`}
            >
              {deletionLoading ? translate(locale, "profile.reactivateProcessing") : translate(locale, "profile.deleteAccount")}
            </button>
          </>
        )}>
          <div className="space-y-4">
            {/* Deletion Status Display */}
            {deletionStatus && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-600">⚠️</span>
                  <span className="font-semibold text-amber-800 dark:text-amber-200">{translate(locale, "profile.accountDeleted")}</span>
                </div>
                {deletionStatus.isDeletionRequested ? (
                  <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                    <div>{translate(locale, "profile.delete.info.requestedOn", { date: new Date(deletionStatus.deletionRequestedAt!).toLocaleDateString() })}</div>
                    <div>{translate(locale, "profile.delete.info.graceEnds", { date: new Date(deletionStatus.gracePeriodEndsAt!).toLocaleDateString() })}</div>
                    <div className="text-xs">{translate(locale, "profile.delete.info.reactivateHint")}</div>
                    <button
                      onClick={reactivateAccount}
                      disabled={deletionLoading}
                      className="mt-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      {deletionLoading ? translate(locale, "profile.reactivateProcessing") : translate(locale, "profile.reactivate")}
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    {deletionStatus.canDelete ? (
                      <span>{translate(locale, "profile.delete.info.active")}</span>
                    ) : (
                      <div>
                        <span className="font-semibold">{translate(locale, "profile.delete.info.cannotDelete")}</span> {deletionStatus.reason}
                        {deletionStatus.unsettledOrders && (
                          <div className="mt-1 text-xs">{translate(locale, "profile.delete.info.unsettledOrders", { count: deletionStatus.unsettledOrders })}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Deletion Information */}
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              <div className="mb-2">{translate(locale, "profile.delete.irreversible")}</div>
              <ul className="space-y-1 text-xs">
                <li>• {translate(locale, "profile.delete.effect1")}</li>
                <li>• {translate(locale, "profile.delete.effect2")}</li>
                <li>• {translate(locale, "profile.delete.effect3")}</li>
                <li>• {translate(locale, "profile.delete.effect4")}</li>
                <li>• {translate(locale, "profile.delete.effect5")}</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div>
              <div className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {translate(locale, "profile.delete.confirmPrompt")}
              </div>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={translate(locale, "profile.delete.confirmPlaceholder")}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono transition-all ${deleteConfirm === 'DELETE'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : deleteConfirm && deleteConfirm !== 'DELETE'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                    : 'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-950'
                  }`}
              />

              {/* Animated warning message */}
              {deleteConfirm && deleteConfirm !== 'DELETE' && (
                <div className="mt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300">
                    <span className="animate-pulse">⚠️</span>
                    <span>{translate(locale, "profile.delete.error.exactMatch")}</span>
                  </div>
                </div>
              )}

              {/* Success message */}
              {deleteConfirm === 'DELETE' && (
                <div className="mt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                    <span>✅</span>
                    <span>{translate(locale, "profile.delete.success.match")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Unsettled Orders Modal */}
        <Modal
          open={showUnsettledOrdersModal}
          onClose={() => setShowUnsettledOrdersModal(false)}
          title={<span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-300">⚠️ {translate(locale, "profile.unsettled.modal.title")}</span>}
          size="md"
          footer={(
            <button
              onClick={() => setShowUnsettledOrdersModal(false)}
              className="w-full rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              {translate(locale, "common.close")}
            </button>
          )}
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {translate(locale, "profile.unsettled.modal.header")}
              </h3>
            </div>

            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              <p className="mb-3">
                {translate(locale, "profile.unsettled.modal.desc", { count: unsettledOrdersInfo?.unsettledOrders || 0 })}
              </p>

              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <div className="font-medium text-amber-800 dark:text-amber-200 mb-2">{translate(locale, "profile.unsettled.todo.title")}</div>
                <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                  <li>• {translate(locale, "profile.unsettled.todo.item1")}</li>
                  <li>• {translate(locale, "profile.unsettled.todo.item2")}</li>
                  <li>• {translate(locale, "profile.unsettled.todo.item3")}</li>
                  <li>• {translate(locale, "profile.unsettled.todo.item4")}</li>
                </ul>
              </div>

              <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">{translate(locale, "profile.unsettled.why.title")}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  {translate(locale, "profile.unsettled.why.desc")}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
              >
                <span>{translate(locale, "profile.unsettled.viewOrders")}</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </Modal>

        {/* Preferences Modals */}
        <Modal open={prefLangOpen} onClose={() => setPrefLangOpen(false)} title={<span className="inline-flex items-center gap-2"><Globe size={16} /> {translate(locale, "profile.preferences.language")}</span>} size="sm" footer={null}>
          <div className="grid gap-2">
            {([
              { v: 'en', l: 'English' },
              { v: 'fr', l: 'Français' },
              { v: 'es', l: 'Español' },
              { v: 'zh', l: '中文' },
              { v: 'ar', l: 'العربية' },
              { v: 'ha', l: 'Hausa' }
            ]).map((o) => (
              <button key={o.v} onClick={() => { savePrefs({ language: o.v }); setPrefLangOpen(false); }} className={`rounded-xl border px-3 py-2 text-left ${prefs.language === o.v ? 'border-neutral-900 dark:border-neutral-200' : 'border-neutral-200 dark:border-neutral-800'}`}>{o.l}</button>
            ))}
          </div>
        </Modal>

        <Modal open={prefCountryOpen} onClose={() => setPrefCountryOpen(false)} title={<span className="inline-flex items-center gap-2"><MapPin size={16} /> {translate(locale, "profile.addresses.modal.country")}</span>} size="sm" footer={null}>
          <div className="grid gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
            {getCountryNames().map((c) => (
              <button key={c} onClick={() => { savePrefs({ country: c }); setPrefCountryOpen(false); }} className={`rounded-xl border px-3 py-2 text-left ${prefs.country === c ? 'border-neutral-900 dark:border-neutral-200' : 'border-neutral-200 dark:border-neutral-800'}`}>{c}</button>
            ))}
          </div>
        </Modal>
      </div>
    </RequireAuth >
  );
}
