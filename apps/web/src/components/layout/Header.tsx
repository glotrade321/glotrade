"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  ChevronDown,
  ThumbsUp,
  Star,
  Flame,
  Globe,
  Heart as HeartIcon,
  Sun,
  Moon,
  LayoutDashboard,
  ChevronRight,
  Wallet,
  Check,
} from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import NotificationBell from "./NotificationBell";

import { useEffect, useMemo, useRef, useState } from "react";
import { getStoredLocale, setStoredLocale, Locale, languageNames, locales, translate } from "@/utils/i18n";
import { fetchCategories, ICategory } from "@/utils/categoryApi";

function HeaderLanguageSelector({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languageFlags: Record<Locale, string> = {
    en: "🇬🇧",
    fr: "🇫🇷",
    es: "🇪🇸",
    zh: "🇨🇳",
    ar: "🇸🇦",
    ha: "🇳🇬",
  };

  const handleLangChange = (newLocale: Locale) => {
    setStoredLocale(newLocale);
    setOpen(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
        aria-label="Select Language"
      >
        <Globe size={14} />
        <span>{languageFlags[locale]} {languageNames[locale]}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 py-1 z-50 text-slate-900 dark:text-white animate-in fade-in zoom-in duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
            Select Language / Langue
          </div>
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleLangChange(loc)}
              className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                locale === loc
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{languageFlags[loc]}</span>
                <span>{languageNames[loc]}</span>
              </span>
              {locale === loc && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishCount, setWishCount] = useState<number>(0);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [userRole, setUserRole] = useState<string>("guest");
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(true);

  useEffect(() => {
    // Initialize counts on client only to avoid hydration mismatch
    try {
      const cartRaw = localStorage.getItem("cart");
      if (cartRaw) setCartCount(JSON.parse(cartRaw).length);
      const wishRaw = localStorage.getItem("wishlist");
      if (wishRaw) setWishCount(JSON.parse(wishRaw).length);

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
      setLocale(getStoredLocale());

      // Detect user role from localStorage
      const userData =
        localStorage.getItem("afritrade:user") || localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserRole(user.role || "customer");
        } catch {
          setUserRole("customer");
        }
      } else {
        setUserRole("guest");
      }
    } catch { }
    const onCart = (e: Event) => {
      const detail = (e as CustomEvent).detail as { count: number };
      setCartCount(detail.count);
    };
    const onWish = (e: Event) => {
      const detail = (e as CustomEvent).detail as { count: number };
      setWishCount(detail.count);
    };

    const onAuth = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user?: any };
      if (detail?.user) {
        setUserRole(detail.user.role || "customer");
      } else {
        setUserRole("guest");
      }
    };

    window.addEventListener("cart:update", onCart as EventListener);
    window.addEventListener("wishlist:update", onWish as EventListener);
    window.addEventListener("auth:update", onAuth as EventListener);
    window.addEventListener("auth:logout", () => setUserRole("guest"));

    return () => {
      window.removeEventListener("cart:update", onCart as EventListener);
      window.removeEventListener("wishlist:update", onWish as EventListener);
      window.removeEventListener("auth:update", onAuth as EventListener);
      window.removeEventListener("auth:logout", () => setUserRole("guest"));
    };
  }, []);

  useEffect(() => {
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () =>
      window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  // Scroll detection for mobile search visibility
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Only apply on mobile (lg breakpoint and below)
          if (window.innerWidth >= 1024) return;

          const scrollY = window.scrollY;
          const threshold = 100; // Hide search after scrolling down 100px

          // Hide search when user scrolls down, show when at top
          setShowMobileSearch(scrollY < threshold);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch { }
  };

  return (
    <header className={`sticky top-[34px] z-50 w-full bg-[#2EA5FF] shadow-sm`}>
      <div className="mx-auto w-[95%] px-3 md:px-4">
        <div className="flex items-center gap-3 md:gap-5 py-1">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center shrink-0">
              {/* Logo */}
              <div className="relative h-14 w-14 md:h-16 md:w-16 shrink-0">
                <Image
                  src="/glotrade_logo.png"
                  alt="logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 56px, 64px"
                />
              </div>
            </Link>

            {/* Logo Text / Admin Badge Unit */}
            {(userRole === "admin" || userRole === "superAdmin") ? (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-1 bg-red-500 hover:bg-[#F9A407] text-white rounded-full transition-colors group"
                title={translate(locale, "header.adminPanel")}
              >
                <span className="text-[1.05rem] md:text-[1.5rem] font-bold tracking-wide">
                  Glotrade
                </span>
                <span className="text-xs font-bold uppercase tracking-tighter border-l border-white/30 pl-1">
                  {/* {userRole === "superAdmin" ? "⚡ SUPER ADMIN" : "⚡ ADMIN"} */}
                  {userRole === "superAdmin" ? "⚡" : "⚡"}
                </span>
              </Link>
            ) : (
              <Link href="/">
                <span className="text-[1.05rem] md:text-[1.5rem] font-bold tracking-wide text-white">
                  Glotrade
                </span>
              </Link>
            )}
          </div>


          {/* Nav quick links */}
          <nav className="hidden lg:flex items-center gap-5 text-white text-sm font-semibold">
            {!(userRole === "admin" || userRole === "superAdmin") && (
              <Link
                href="/dashboard"
                className="hover:underline inline-flex items-center gap-1.5"
              >
                <LayoutDashboard size={16} /> {translate(locale, "header.dashboard")}
              </Link>
            )}
            {/* Coming soon */}
            {userRole !== "guest" && (
              <Link
                href="/profile/wallet"
                className="hover:underline inline-flex items-center gap-1.5"
              >
                <Wallet size={16} /> {translate(locale, "header.wallet")}
              </Link>
            )}
            <Link
              href="/best-selling"
              className="hover:underline inline-flex items-center gap-1.5"
            >
              <ThumbsUp size={16} /> {translate(locale, "navBestSelling")}
            </Link>
            {/* Smart Categories dropdown (3-level with hover) */}
            <HeaderSmartCategories locale={locale} />
          </nav>

          {/* Mobile actions: simplified layout */}
          <div className="ml-auto flex items-center gap-2 text-white lg:hidden">
            <UserMenu role={userRole as any} />
            <Link
              aria-label="Wishlist"
              href="/wishlist"
              className="relative p-2 rounded-md hover:bg-white/10"
            >
              <HeartIcon />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              aria-label={translate(locale, "navCart")}
              href="/cart"
              className="relative p-2 rounded-md hover:bg-white/10"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <NotificationBell className="text-white hover:text-white/80" />
          </div>

          {/* Search (desktop) */}
          <form
            action="/marketplace"
            className="hidden lg:block ml-auto flex-1 max-w-2xl"
          >
            <div className="relative">
              <input
                type="search"
                name="q"
                placeholder={translate(locale, "searchPlaceholder")}
                className="w-full rounded-full bg-white pl-5 pr-12 py-2.5 md:py-3 text-[0.95rem] text-neutral-900 placeholder:text-neutral-500 shadow-sm focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 md:right-1.5 md:top-1.5 h-8 w-8 md:h-9 md:w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center"
                aria-label="Search"
              >
                <Search size={19} />
              </button>
            </div>
          </form>

          {/* Nav quick links */}
          <nav className="hidden lg:flex items-center gap-5 text-white text-sm font-semibold">
            <Link
              href="/marketplace?ratingMin=5&sort=-rating"
              className="hover:underline inline-flex items-center gap-1.5"
              aria-label="5-Star Rated"
            >
              <Star size={16} /> {translate(locale, "navFiveStar")}
            </Link>
            <Link
              href="/marketplace?sort=-createdAt"
              className="hover:underline inline-flex items-center gap-1.5"
            >
              <Flame size={16} /> {translate(locale, "navNewIn")}
            </Link>
          </nav>

          {/* Actions (desktop only to keep mobile clean) */}
          <div className="hidden lg:flex items-center gap-3 text-white text-sm font-semibold">
            <UserMenu role={userRole as any} />

            {/* <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button> */}
            {/* Notification Bell */}
            <NotificationBell className="text-white hover:text-white/80" />
            {/* Single wishlist icon link (no duplicate text link) */}
            <Link
              href="/wishlist"
              className="relative inline-flex items-center justify-center p-2 text-white hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={translate(locale, "navWishlist")}
            >
              <HeartIcon />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center p-2 text-white hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={translate(locale, "navCart")}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search under header */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${showMobileSearch
            ? "max-h-20 opacity-100 pb-3 px-1"
            : "max-h-0 opacity-0 pb-0 px-1"
            }`}
        >
          <form
            action="/marketplace"
            className={`transition-transform duration-500 ease-in-out ${showMobileSearch ? "translate-y-0" : "-translate-y-2"
              }`}
          >
            <div className="relative">
              <input
                type="search"
                name="q"
                placeholder={translate(locale, "searchPlaceholder")}
                className="w-full rounded-full bg-white pl-5 pr-12 py-2.5 text-[0.95rem] text-neutral-900 placeholder:text-neutral-500 shadow-sm focus:outline-none transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}

function HeaderSmartCategories({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [hoveredL1, setHoveredL1] = useState<string | undefined>();
  const [hoveredL2, setHoveredL2] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch categories using the centralized API utility
  useEffect(() => {
    let aborted = false;

    async function loadCategories() {
      setIsLoading(true);
      try {
        const data = await fetchCategories();
        if (!aborted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        if (!aborted) {
          setCategories([]);
        }
      } finally {
        if (!aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      aborted = true;
    };
  }, []);

  // Organize categories by level using slug-based lookup
  const level1 = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const childrenMap = useMemo(() => {
    const map: Record<string, ICategory[]> = {};
    categories.forEach((c) => {
      if (!c.parentId) return;
      map[c.parentId] = map[c.parentId] || [];
      map[c.parentId].push(c);
    });
    return map;
  }, [categories]);

  // Get level 2 categories (children of hovered L1)
  const level2 = useMemo(() => {
    if (!hoveredL1) return [];
    return childrenMap[hoveredL1] || [];
  }, [hoveredL1, childrenMap]);

  // Get level 3 categories (children of hovered L2)
  const level3 = useMemo(() => {
    if (!hoveredL2) return [];
    return childrenMap[hoveredL2] || [];
  }, [hoveredL2, childrenMap]);

  // Close on click outside and on Escape
  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Reset hover states when dropdown closes
  useEffect(() => {
    if (!open) {
      setHoveredL1(undefined);
      setHoveredL2(undefined);
    }
  }, [open]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleL1Hover = (slug: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredL1(slug);
    setHoveredL2(undefined);
  };

  const handleL2Hover = (slug: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredL2(slug);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:underline font-semibold hover:bg-white/10 focus:outline-none px-2 py-1 rounded"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{translate(locale, "header.categories")}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-[850px] max-w-[90vw] max-h-[calc(100vh-100px)] flex flex-col rounded-lg border border-neutral-200 bg-white text-neutral-900 shadow-2xl overflow-hidden dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          role="menu"
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => setOpen(false), 300);
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-neutral-500">
                {translate(locale, "header.loadingCategories")}
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-neutral-500">
                {translate(locale, "header.noCategories")}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[280px,1fr] min-h-[400px] h-full">
              {/* Level 1: Departments - Left sidebar */}
              <div className="bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto h-full">
                <div className="p-4 pb-20">
                  <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                    {translate(locale, "header.allDepartments")}
                  </h3>
                  <div className="space-y-1">
                    {level1.map((category) => {
                      const hasChildren =
                        (childrenMap[category.slug] || []).length > 0;
                      return (
                        <div
                          key={category._id}
                          onMouseEnter={() => handleL1Hover(category.slug)}
                          className={`relative group`}
                        >
                          <Link
                            href={`/marketplace?category=${encodeURIComponent(
                              category.name
                            )}`}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${hoveredL1 === category.slug
                              ? "bg-blue-500 text-white shadow-md"
                              : "hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                              }`}
                            onClick={() => setOpen(false)}
                          >
                            <span className="flex-1">{category.name}</span>
                            {hasChildren && (
                              <ChevronRight
                                size={16}
                                className={`transition-transform ${hoveredL1 === category.slug
                                  ? "translate-x-1"
                                  : ""
                                  }`}
                              />
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Level 2 & 3: Categories and Subcategories - Right panel */}
              <div className="p-5 pb-20 overflow-y-auto bg-white dark:bg-neutral-800 h-full">
                {!hoveredL1 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏪</div>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        {translate(locale, "header.hoverForCategories")}
                      </p>
                    </div>
                  </div>
                ) : level2.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        {translate(locale, "header.noCategoriesInDepartment")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    {level2.map((l2Category) => {
                      const l2Children = childrenMap[l2Category.slug] || [];
                      return (
                        <div
                          key={l2Category._id}
                          onMouseEnter={() => handleL2Hover(l2Category.slug)}
                          className="space-y-2"
                        >
                          <Link
                            href={`/marketplace?category=${encodeURIComponent(
                              l2Category.name
                            )}`}
                            className={`block font-semibold text-sm transition-colors ${hoveredL2 === l2Category.slug
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-neutral-800 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400"
                              }`}
                            onClick={() => setOpen(false)}
                          >
                            {l2Category.name}
                            {l2Category.productCount > 0 && (
                              <span className="ml-2 text-xs text-neutral-400">
                                ({l2Category.productCount})
                              </span>
                            )}
                          </Link>

                          {l2Children.length > 0 && (
                            <ul className="space-y-1.5 pl-3 border-l-2 border-neutral-200 dark:border-neutral-700">
                              {l2Children.map((l3Category) => (
                                <li key={l3Category._id}>
                                  <Link
                                    href={`/marketplace?category=${encodeURIComponent(
                                      l3Category.name
                                    )}`}
                                    className="block text-sm text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => setOpen(false)}
                                  >
                                    {l3Category.name}
                                    {l3Category.productCount > 0 && (
                                      <span className="ml-1.5 text-xs text-neutral-400">
                                        ({l3Category.productCount})
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}
