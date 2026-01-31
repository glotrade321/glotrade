"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  LogOut,
  Settings,
  ShoppingBag,
  Heart,
  TicketPercent,
  Globe,
  Sun,
  MapPin,
  Wallet,
  PackageSearch,
  Store,
  UserPlus,
  CheckCircle,
  Shield,
  Users,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import { logout } from "@/utils/auth";
import { toast } from "@/components/common/Toast";
import { getCountryNames } from "@/utils/countryData";
import { API_BASE_URL, getUserStorage, saveUserStorage, apiGet, apiPut } from "@/utils/api";
import Modal from "@/components/common/Modal";

import { getStoredLocale, setStoredLocale, Locale, languageNames, locales, translate } from "@/utils/i18n";

type Role = "guest" | "customer" | "vendor" | "admin" | "superAdmin";

// Lightweight, dependency-free user menu
export default function UserMenu({ role = "guest" as Role }: { role?: Role }) {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(false);
  // kept for future inline display; we still listen to keep badge accurate when used elsewhere
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishCount, setWishCount] = useState<number>(0);
  const [language, setLanguage] = useState<Locale>("en");
  const [currency, setCurrency] = useState<string>("NGN");
  const [country, setCountry] = useState<string>("Nigeria");
  const [firstName, setFirstName] = useState<string>("Guest");
  const [lastName, setLastName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isSeller, setIsSeller] = useState<boolean>(false);
  const [hasWallet, setHasWallet] = useState<boolean>(true);
  const [showTrack, setShowTrack] = useState(false);
  const [trackId, setTrackId] = useState("");
  const [openLang, setOpenLang] = useState(false);
  const [openCurr, setOpenCurr] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        // Try to read a user profile
        const tryKeys = [
          "glotrade:user",
          "user",
          "profile",
          "account",
          "authUser",
        ] as const;
        let found = false;
        for (const k of tryKeys) {
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          try {
            const obj = JSON.parse(raw);
            const f =
              obj?.username ||
              obj?.firstName ||
              obj?.given_name ||
              (obj?.name ? String(obj.name).split(" ")[0] : "");
            const l =
              obj?.lastName ||
              obj?.family_name ||
              (obj?.name ? String(obj.name).split(" ").slice(1).join(" ") : "");
            if (f) {
              setFirstName(String(f));
              setLastName(String(l || ""));
              found = true;
            }
            setIsSeller(
              String(obj?.role || "").toLowerCase() === "seller" ||
              Boolean(obj?.store)
            );

            // Check for wallet access
            // If user has walletId, they have a wallet.
            // If they are a Wholesaler (and no walletId yet), they don't.
            if (obj?.businessInfo?.businessType === 'Wholesaler' && !obj?.walletId) {
              setHasWallet(false);
            } else {
              // Default to true for backward compatibility or other roles
              setHasWallet(true);
            }

            break;
          } catch { }
        }
        if (!found) {
          setFirstName("Guest");
          setLastName("");
        }
      } catch { }
    };

    try {
      const cartRaw = localStorage.getItem("cart");
      if (cartRaw) setCartCount(JSON.parse(cartRaw).length);
      const wishRaw = localStorage.getItem("wishlist");
      if (wishRaw) setWishCount(JSON.parse(wishRaw).length);
      const storedCurr = localStorage.getItem("currency");
      const storedCountry = localStorage.getItem("country");
      setLanguage(getStoredLocale());
      if (storedCurr) setCurrency(storedCurr);
      if (storedCountry) setCountry(storedCountry);

      // const storedTheme = localStorage.getItem("theme");
      // const prefersDark =
      //   window.matchMedia &&
      //   window.matchMedia("(prefers-color-scheme: dark)").matches;
      // const dark = storedTheme ? storedTheme === "dark" : prefersDark;
      // document.documentElement.classList.toggle("dark", dark);
      // setIsDark(dark);

      // Force light mode
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      setIsDark(false);
      loadUser();
    } catch { }
    let syncTimer: any = null;
    const syncLocalToServer = async () => {
      try {
        const rawUser =
          localStorage.getItem("glotrade:user") ||
          localStorage.getItem("user");
        if (!rawUser) return; // only sync when logged in
        const obj = JSON.parse(rawUser);
        const uid =
          obj?.id ||
          obj?._id ||
          obj?.userId ||
          obj?.user?.id ||
          obj?.user?._id ||
          obj?.address;
        if (!uid) return;
        const cart: string[] = JSON.parse(localStorage.getItem("cart") || "[]");
        const wishlist: string[] = JSON.parse(
          localStorage.getItem("wishlist") || "[]"
        );
        const compactCart = cart.reduce<{ productId: string; qty: number }[]>(
          (acc, pid) => {
            const found = acc.find((x) => x.productId === pid);
            if (found) found.qty += 1;
            else acc.push({ productId: pid, qty: 1 });
            return acc;
          },
          []
        );
        await saveUserStorage({ wishlist, cart: compactCart });
      } catch { }
    };
    const scheduleSync = () => {
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(syncLocalToServer, 500);
    };
    const onCart = (e: Event) => {
      setCartCount((e as CustomEvent).detail.count);
      scheduleSync();
    };
    const onWish = (e: Event) => {
      setWishCount((e as CustomEvent).detail.count);
      scheduleSync();
    };
    const onAuth = async (e: Event) => {
      const user = (e as CustomEvent).detail?.user;
      if (user) {
        try {
          // Update header name immediately
          const f =
            user?.username ||
            user?.firstName ||
            (user?.name ? String(user.name).split(" ")[0] : "");
          const l =
            user?.lastName ||
            (user?.name ? String(user.name).split(" ").slice(1).join(" ") : "");
          if (f) {
            setFirstName(String(f));
            setLastName(String(l || ""));
          }
          setIsSeller(
            String(user?.role || "").toLowerCase() === "seller" ||
            Boolean(user?.store)
          );

          // Check for wallet access
          if (user?.businessInfo?.businessType === 'Wholesaler' && !user?.walletId) {
            setHasWallet(false);
          } else {
            setHasWallet(true);
          }

          // Only sync cart/wishlist on actual auth changes (login/logout), not profile updates
          // Check if this is a significant auth change by comparing with previous user data
          const prevUser = localStorage.getItem("glotrade:user");
          if (prevUser) {
            try {
              const prev = JSON.parse(prevUser);
              // Only sync if user ID changed (login/logout) or if this is the first time we're seeing this user
              const prevId = prev?.id || prev?._id || prev?.userId;
              const currentId = user?.id || user?._id || user?.userId;
              if (prevId === currentId) {
                // This is just a profile update, not an auth change - skip sync
                return;
              }
            } catch { }
          }

          // Fetch server storage first
          const server = await getUserStorage();
          const localCart: string[] = JSON.parse(
            localStorage.getItem("cart") || "[]"
          );
          const localWishlist: string[] = JSON.parse(
            localStorage.getItem("wishlist") || "[]"
          );

          // Merge wishlist (union)
          const mergedWishlist = Array.from(
            new Set([...(server.wishlist || []), ...localWishlist])
          );

          // Merge cart (sum quantities by productId)
          const serverCart = server.cart || [];
          const localCompact = localCart.reduce<Record<string, number>>(
            (acc, pid) => {
              acc[pid] = (acc[pid] || 0) + 1;
              return acc;
            },
            {}
          );
          const mergedMap: Record<string, number> = {
            ...serverCart.reduce<Record<string, number>>((acc, it) => {
              acc[it.productId] =
                (acc[it.productId] || 0) + Math.max(1, it.qty || 0);
              return acc;
            }, {}),
            ...localCompact,
          };
          const mergedCart = Object.entries(mergedMap).map(
            ([productId, qty]) => ({ productId, qty })
          );

          // Save merged to server
          await saveUserStorage({ wishlist: mergedWishlist, cart: mergedCart });

          // Hydrate local from merged
          try {
            localStorage.setItem("wishlist", JSON.stringify(mergedWishlist));
          } catch { }
          try {
            const expanded = mergedCart.flatMap((it) =>
              Array.from({ length: Math.max(1, it.qty) }, () => it.productId)
            );
            localStorage.setItem("cart", JSON.stringify(expanded));
          } catch { }

          window.dispatchEvent(
            new CustomEvent("wishlist:update", {
              detail: { count: mergedWishlist.length },
            })
          );
          window.dispatchEvent(
            new CustomEvent("cart:update", {
              detail: {
                count: mergedCart.reduce((s, x) => s + (x.qty || 0), 0),
              },
            })
          );
          toast("Synced your cart & wishlist", "success");
        } catch { }
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (
        e.key &&
        ["afritrade:user", "user", "profile", "account", "authUser"].includes(
          e.key
        )
      ) {
        /* noop */
      }
    };
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLanguage(detail.locale);
    };

    window.addEventListener("cart:update", onCart as EventListener);
    window.addEventListener("wishlist:update", onWish as EventListener);
    window.addEventListener("auth:update", onAuth as EventListener);
    window.addEventListener("storage", onStorage as EventListener);
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () => {
      if (syncTimer) clearTimeout(syncTimer);
      window.removeEventListener("i18n:locale", onLocale as EventListener);
      window.removeEventListener("cart:update", onCart as EventListener);
      window.removeEventListener("wishlist:update", onWish as EventListener);
      window.removeEventListener("auth:update", onAuth as EventListener);
      window.removeEventListener("storage", onStorage as EventListener);
    };
  }, []);

  const tier = useMemo(() => {
    if (role === "vendor")
      return { label: "Vendor", variant: "success" as const };
    return { label: "Bronze", variant: "default" as const };
  }, [role]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    try {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", theme);
    } catch { }
    // persist preference to server
    persistPreferences({ theme });
  };

  // authHeader removed as it is handled by apiPut/apiGet

  const persistPreferences = async (patch: Record<string, any>) => {
    try {
      const raw = localStorage.getItem("glotrade:prefs");
      const current = raw ? JSON.parse(raw) : {};
      const merged = { ...current, ...patch };
      localStorage.setItem("glotrade:prefs", JSON.stringify(merged));
      await apiPut(`/api/v1/users/me`, { preferences: merged });
    } catch { }
  };

  const setPref = (k: string, v: any) => {
    try {
      localStorage.setItem(k, String(v));
      window.dispatchEvent(
        new CustomEvent("prefs:update", { detail: { [k]: v } })
      );
    } catch { }
    // Map local keys to preference keys
    const map: Record<string, string> = {
      lang: "language",
      currency: "currency",
      country: "country",
      theme: "theme",
    };
    const prefKey = map[k] || k;
    const value = v;
    persistPreferences({ [prefKey]: value });
    if (k === "lang") {
      setStoredLocale(v as Locale);
    }
  };

  // close on outside click / escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t))
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Avatar = () => {
    const initials = (firstName?.[0] || "?") + (lastName?.[0] || "");
    return (
      <div className="hidden sm:inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-700 text-white">
        <span className="text-xs font-semibold">{initials}</span>
      </div>
    );
  };

  const guest = firstName === "Guest";

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
      {children}
    </span>
  );

  const Switch = ({
    checked,
    onChange,
  }: {
    checked?: boolean;
    onChange?: (v: boolean) => void;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked
        ? "bg-neutral-900 dark:bg-neutral-200"
        : "bg-neutral-300 dark:bg-neutral-700"
        }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0"
          }`}
      />
    </button>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 border border-white/20 hover:border-white/40 hover:bg-white/10 focus:outline-none transition-colors"
      >
        <Avatar />
        <div className="text-left">
          {/* Hide top line for admins, show for regular users */}
          {!(role === "admin" || role === "superAdmin") && (
            <div className="hidden sm:block text-[10px] sm:text-xs font-semibold opacity-80 leading-tight">
              {guest
                ? translate(language, "usermenu.helloGuest")
                : `${translate(language, "usermenu.hello")} ${firstName}${lastName ? ` ${lastName}` : ""}`}
            </div>
          )}
          <div className="text-[14px] sm:text-[15px] font-bold leading-tight">
            {role === "admin" || role === "superAdmin"
              ? translate(language, "usermenu.admin")
              : translate(language, "usermenu.account")}
          </div>
        </div>
      </button>
      {open ? (
        <>
          {/* overlay for mobile to prevent off-canvas interactions */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            ref={menuRef}
            className={`fixed md:absolute left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 ${guest ? "top-1/2 -translate-y-1/2" : "top-[68px]"
              } md:top-full md:translate-y-0 md:mt-2 z-50 w-[95vw] md:w-[92vw] max-w-[360px] overflow-hidden rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100`}
          >
            {guest ? (
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="text-base sm:text-lg font-semibold">
                  {translate(language, "usermenu.welcome")}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                  {translate(language, "usermenu.signInDesc")}
                </div>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex items-center justify-center rounded-full bg-neutral-900 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white dark:bg-neutral-100 dark:text-black"
                >
                  {translate(language, "usermenu.login")}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex items-center justify-center rounded-full border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold"
                >
                  {translate(language, "usermenu.createAccount")}
                </Link>
              </div>
            ) : (
              <>
                <div className="px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 sm:gap-3 rounded-lg px-1 py-1.5 transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <Avatar />
                      <div className="text-xs sm:text-sm">
                        <div className="font-bold text-sm sm:text-lg">
                          {firstName}
                          {lastName ? ` ${lastName}` : ""}
                        </div>
                        {(role === "admin" || role === "superAdmin") && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-semibold">
                            {role === "superAdmin" ? "Super Admin" : "Admin"}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-col gap-1">
                      <Badge>{tier.label}</Badge>
                      {(role === "admin" || role === "superAdmin") && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                          {role === "superAdmin" ? "SUPER" : "ADMIN"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Admin Section - Moved to top for easier access */}
                {(role === "admin" || role === "superAdmin") && (
                  <>
                    <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {translate(language, "usermenu.administration")}
                    </div>
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Shield size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.adminDashboard")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                    <Link
                      href="/admin/users"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Users size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.userManagement")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                    <Link

                      href="/admin/store"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Store size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.storeSettings")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                  </>
                )}

                {/* Regular user sections - hidden for admin users to reduce clutter */}
                {!(role === "admin" || role === "superAdmin") && (
                  <>
                    <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />

                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {translate(language, "usermenu.dashboardTitle")}
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LayoutDashboard size={14} className="sm:w-4 sm:h-4" />{" "}
                        {translate(language, "usermenu.myDashboard")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>

                    <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {translate(language, "usermenu.orderTitle")}
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ShoppingBag size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.myOrders")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setShowTrack(true);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <PackageSearch size={14} className="sm:w-4 sm:h-4" />{" "}
                        {translate(language, "usermenu.trackOrder")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </button>

                    <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {translate(language, "usermenu.shoppingTitle")}
                    </div>
                    <Link
                      href="/wishlist"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Heart size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.wishlist")}
                      </span>
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {wishCount}
                      </span>
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ShoppingBag size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.cart")}
                      </span>
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {cartCount}
                      </span>
                    </Link>
                    <Link
                      href="/profile/vouchers"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <TicketPercent size={14} className="sm:w-4 sm:h-4" />{" "}
                        {translate(language, "usermenu.vouchers")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>

                    <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {translate(language, "usermenu.paymentsAddress")}
                    </div>
                    {/* coming soon */}
                    {hasWallet && (
                      <Link href="/profile/wallet" onClick={() => setOpen(false)} className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"><span className="inline-flex items-center gap-2"><Wallet size={14} className="sm:w-4 sm:h-4" /> {translate(language, "header.wallet")}</span><ChevronRight size={14} className="sm:w-4 sm:h-4" /></Link>
                    )}
                    <Link
                      href="/profile#addresses"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.addresses")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                  </>
                )}

                <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {translate(language, "usermenu.preferences")}
                </div>
                {/* Language */}
                <div className="px-3 sm:px-4 py-1.5 sm:py-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenLang((v) => !v);
                      setOpenCurr(false);
                      setOpenCountry(false);
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 sm:py-2 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Globe size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.language")}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {languageNames[language]}
                    </span>
                  </button>
                  {openLang ? (
                    <div className="mt-1.5 sm:mt-2 grid grid-cols-1 gap-1 px-2">
                      {locales.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setLanguage(loc);
                            setPref("lang", loc);
                            setOpen(false);
                          }}
                          className={`rounded px-2 py-1 text-left text-xs sm:text-sm transition-colors ${language === loc
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                            }`}
                        >
                          {languageNames[loc]}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {/* Currency - hidden for admin users */}
                {!(role === "admin" || role === "superAdmin") && (
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCurr((v) => !v);
                        setOpenLang(false);
                        setOpenCountry(false);
                      }}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 sm:py-2 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span>{translate(language, "usermenu.currency")}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {currency}
                      </span>
                    </button>
                    {openCurr ? (
                      <div className="mt-1.5 sm:mt-2 grid grid-cols-1 gap-1 px-2">
                        <button
                          onClick={() => {
                            setCurrency("NGN");
                            setPref("currency", "NGN");
                            setOpen(false);
                          }}
                          className="rounded px-2 py-1 text-left text-xs sm:text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          NGN
                        </button>
                        <button
                          onClick={() => {
                            setCurrency("XOF");
                            setPref("currency", "XOF");
                            setOpen(false);
                          }}
                          className="rounded px-2 py-1 text-left text-xs sm:text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          XOF
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
                {/* Country - hidden for admin users */}
                {!(role === "admin" || role === "superAdmin") && (
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCountry((v) => !v);
                        setOpenLang(false);
                        setOpenCurr(false);
                      }}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 sm:py-2 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span>{translate(language, "usermenu.countryRegion")}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {country}
                      </span>
                    </button>
                    {openCountry ? (
                      <div className="mt-1.5 sm:mt-2 grid grid-cols-1 gap-1 px-2 max-h-60 overflow-y-auto no-scrollbar border-t border-neutral-100 dark:border-neutral-800 pt-2">
                        {getCountryNames().map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              setCountry(c);
                              setPref("country", c);
                              setOpen(false);
                            }}
                            className={`rounded px-2 py-1.5 text-left text-xs sm:text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${country === c ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium" : ""}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
                {/* <div className="flex items-center justify-between px-3 sm:px-4 py-2 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <span className="inline-flex items-center gap-2">
                    <Sun size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.darkMode")}
                  </span>
                  <Switch checked={isDark} onChange={toggleTheme} />
                </div> */}

                {/* Become a Seller and Manage Account - hidden for admin users */}
                {!(role === "admin" || role === "superAdmin") && (
                  <>
                    <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />



                    <div className="my-1 h-px w-full bg-neutral-200 dark:bg-neutral-800" />
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[0.95rem] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Settings size={14} className="sm:w-4 sm:h-4" /> {translate(language, "usermenu.manageAccount")}
                      </span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setFirstName("Guest");
                    setLastName("");
                    setOpen(false);
                    logout();
                    toast(translate(language, "usermenu.signedOut"), "success");
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm text-rose-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <LogOut size={14} className="inline mr-2 sm:w-4 sm:h-4" />{" "}
                  {translate(language, "usermenu.signOut")}
                </button>
              </>
            )}
          </div>
        </>
      ) : null}

      {/* Track Order Modal (consistent styling) */}
      <Modal
        open={showTrack}
        onClose={() => {
          setShowTrack(false);
          setTrackId("");
        }}
        title={translate(language, "usermenu.trackOrderModalTitle")}
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setShowTrack(false);
                setTrackId("");
              }}
              className="flex-1 rounded-full border px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100"
            >
              {translate(language, "common.cancel")}
            </button>
            <button
              onClick={async () => {
                const key = trackId.trim();
                if (!key) {
                  toast(translate(language, "usermenu.enterOrderIdError"), "error");
                  return;
                }
                try {
                  const json = await apiGet<any>(`/api/v1/orders/resolve/${encodeURIComponent(key)}`);
                  const fullId = json?.data?.orderId;
                  if (!fullId) throw new Error(translate(language, "usermenu.orderNotFound"));
                  setShowTrack(false);
                  setOpen(false);
                  setTrackId("");
                  router.push(`/orders/${fullId}`);
                } catch (e: any) {
                  toast(e?.message || translate(language, "usermenu.orderNotFound"), "error");
                }
              }}
              className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-black"
            >
              {translate(language, "common.track")}
            </button>
          </>
        }
      >
        <input
          autoFocus
          placeholder={translate(language, "usermenu.enterOrderId")}
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </Modal>
    </div>
  );
}
