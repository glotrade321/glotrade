"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ShieldCheck,
  Truck,
  Gift,
  Edit3,
  Leaf,
  Ticket,
  ChevronRight,
  CreditCard,
  Apple,
  Building2,
  X,
  Tag,
} from "lucide-react";
import { apiGet, apiDelete, apiPost } from "@/utils/api";
import { getStoredLocale, translate, Locale } from "@/utils/i18n";
import { initiatePayment, createOrder } from "./initiate";
import { formatCurrency } from "@/utils/format";

import AddressModal from "@/components/cart/AddressModal";
import VoucherInput from "@/components/checkout/VoucherInput";
import InsufficientBalanceModal from "@/components/wallet/InsufficientBalanceModal";
import { AppliedVoucher } from "@/utils/voucherApi";
import { getUserId } from "@/utils/auth";

type ApiProduct = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  images?: string[];
  discount?: number;
  category?: string;
  condition?: string;
  rating?: number;
  brand?: string;
  featured?: boolean;
  minOrderQuantity?: number;
  shippingOptions?: { method: string; cost: number; estimatedDays: number }[];
  seller?: { username?: string; reputation?: number; isVerified?: boolean };
};
type ProductResponse = { status: string; data: ApiProduct };

function readCart(): Record<string, number> {
  try {
    const arr: string[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const map: Record<string, number> = {};
    arr.forEach((id) => (map[id] = (map[id] || 0) + 1));
    return map;
  } catch {
    return {};
  }
}

// Custom Address Card Component
function AddressCard({
  address,
  onEdit,
}: {
  address: any;
  onEdit: () => void;
}) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getStoredLocale());
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent).detail as { locale: Locale };
      setLocale(detail.locale);
    };
    window.addEventListener("i18n:locale", onLocale as EventListener);
    return () => window.removeEventListener("i18n:locale", onLocale as EventListener);
  }, []);

  if (!address) {
    return <div className="text-sm text-neutral-500">{translate(locale, "checkout.noAddress")}</div>;
  }

  return (
    <div className="relative rounded-r">
      {/* Custom left border with red and blue dashed lines */}
      <div className="absolute left-0 top-0 bottom-0 w-1">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500 border-l border-dashed border-orange-500"></div>
      </div>

      {/* Main content with 2px borders on top, right, and bottom */}
      <div className="pl-5 py-4 pr-4 border-2 border-neutral-200 dark:border-neutral-800 border-l-0 rounded-r">
        <div className="bg-red flex items-center text-base font-semibold text-neutral-800 dark:text-neutral-100">
          <div className="flex items-center">
            <span className="mr-2">{address.displayName || "User"}</span>
            <span className="text-neutral-500 dark:text-neutral-400 ml-3 font-normal mr-2">
              +{address.phone}
            </span>
          </div>
          <div className="w-full flex items-center justify-end">
            <button
              onClick={onEdit}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Edit address"
            >
              <Edit3
                size={18}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              />
            </button>
          </div>
        </div>
        <div className="text-base text-orange-500 font-semibold mt-2">
          {address.address}
        </div>
        <div className="text-base text-grey-700 dark:text-neutral-300 font-semibold mt-1">
          {address.city}, {address.state}, {address.country}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [idToQty, setIdToQty] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [address, setAddress] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "pickup">(
    "standard"
  );
  const [paymentMethod, setPaymentMethod] = useState("paystack"); // default to paystack (safe for guests)
  const [donateTree, setDonateTree] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] =
    useState(false);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState<{
    requiredAmount: number;
    availableAmount: number;
    currency: string;
  } | null>(null);
  const [addressUpdateTrigger, setAddressUpdateTrigger] = useState(0); // Force re-render after address updates
  const [poNumber, setPoNumber] = useState("");
  const [walletBalance, setWalletBalance] = useState<{ available: number, creditLimit: number, creditUsed: number } | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    setIsLoggedIn(!!localStorage.getItem("afritrade:auth"));
  }, []);


  // Function to update localStorage user data when address is updated
  const updateLocalUserData = (updatedUserData: any) => {
    console.log("Checkout: updateLocalUserData called with:", updatedUserData);
    try {
      const raw = localStorage.getItem("afritrade:user");
      console.log("Checkout: Current localStorage user data:", raw);
      if (raw) {
        const currentUser = JSON.parse(raw);
        console.log("Checkout: Parsed current user:", currentUser);
        const updatedUser = {
          ...currentUser,
          firstName: updatedUserData.firstName,
          lastName: updatedUserData.lastName,
        };
        console.log("Checkout: New updated user object:", updatedUser);
        localStorage.setItem("afritrade:user", JSON.stringify(updatedUser));
        console.log("Checkout: Successfully updated localStorage user data");

        // Force re-render by updating the address state
        if (address) {
          const updatedAddress = {
            ...address,
            displayName: `${updatedUser.firstName || updatedUser.username || "User"
              } ${updatedUser.lastName || ""}`.trim(),
          };
          setAddress(updatedAddress);
          console.log(
            "Checkout: Updated address state with new displayName:",
            updatedAddress.displayName
          );

          // Also update localStorage shippingAddress to keep it in sync
          try {
            const currentShippingAddress =
              localStorage.getItem("shippingAddress");
            if (currentShippingAddress) {
              const parsed = JSON.parse(currentShippingAddress);
              const updatedShippingAddress = {
                ...parsed,
                displayName: updatedAddress.displayName,
              };
              localStorage.setItem(
                "shippingAddress",
                JSON.stringify(updatedShippingAddress)
              );
              console.log(
                "Checkout: Updated localStorage shippingAddress with new displayName"
              );
            }
          } catch (error) {
            console.error(
              "Failed to update localStorage shippingAddress:",
              error
            );
          }
        }

        // Force re-render to trigger validation logic update
        setAddressUpdateTrigger((prev) => prev + 1);
        console.log("Checkout: Triggered address validation re-render");
      }
    } catch (error) {
      console.error("Failed to update localStorage user data:", error);
    }
  };

  // Configuration object for dynamic values
  const config = {
    coupon: {
      discount: 25, // Can be fetched from API or made configurable
      minDiscountThreshold: 20, // Minimum discount % to show badge
    },
    shipping: {
      standard: {
        deliveryRange: "Aug 23-Sep 5",
        creditAmount: 1600,
        couriers: ["Speedaf", "Sharp Courier", "etc."],
      },
      pickup: {
        available: true,
      },
    },
    donation: {
      treeAmount: 542,
      minRating: 4.5,
    },
    layout: {
      gridCols: { mobile: 1, tablet: 2, desktop: 2 },
      imageDimensions: { width: 200, height: 200 },
    },
  };

  // Real voucher system
  const [appliedVouchers, setAppliedVouchers] = useState<AppliedVoucher[]>([]);

  const totalVoucherDiscount = appliedVouchers.reduce(
    (sum, voucher) => sum + voucher.discountAmount,
    0
  );

  // Voucher management functions
  const handleVoucherApplied = (voucher: AppliedVoucher) => {
    setAppliedVouchers((prev) => [...prev, voucher]);
  };

  const handleVoucherRemoved = (voucherId: string) => {
    setAppliedVouchers((prev) => prev.filter((v) => v.id !== voucherId));
  };

  useEffect(() => {
    let aborted = false;
    async function run() {
      // Configuration is already set with default values
      const map = readCart();
      const ids = Object.keys(map);
      console.log("Cart data:", { map, ids, count: ids.length });

      const loadProducts = async () => {
        try {
          const results = await Promise.all(
            ids.map(async (id) => {
              console.log("Fetching product:", id);
              const json: ProductResponse = await apiGet(`/api/v1/market/products/${id}`);
              console.log("Product response:", json);
              return json.data;
            })
          );
          if (!aborted) {
            console.log("Setting products:", results);
            setIdToQty(map);
            setProducts(results);
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };

      const loadAddress = async () => {
        // First try to get address from user's database if logged in
        let userAddress = null;
        try {
          const cachedAddress = localStorage.getItem("shippingAddress");
          if (cachedAddress && !aborted) {
            try {
              const parsedCachedAddress = JSON.parse(cachedAddress);
              setAddress(parsedCachedAddress);
            } catch {
              localStorage.removeItem("shippingAddress");
            }
          }

          const raw = localStorage.getItem("afritrade:user");
          if (raw) {
            const user = JSON.parse(raw);
            setUserData(user);
            if (user?.id || user?._id) {
              const authToken = localStorage.getItem("afritrade:auth");
              let freshUser = user;

              if (authToken) {
                try {
                  const userData = await apiGet<{ data: any }>(`/api/v1/users/me`);
                  freshUser = userData.data;
                  setUserData(freshUser);
                } catch (userError) {
                  console.log("Error fetching fresh user data:", userError);
                }
              }

              try {
                const addressData = await apiGet<{ data: any[] }>(`/api/v1/users/me/addresses`);
                if (addressData.data && addressData.data.length > 0) {
                  const defaultAddr = addressData.data.find((a: any) => a.isDefault) || addressData.data[0];
                  userAddress = {
                    ...defaultAddr,
                    address: defaultAddr.street,
                    displayName: `${freshUser?.firstName || freshUser?.username || "User"} ${freshUser?.lastName || ""}`.trim(),
                  };
                }
              } catch (addrError: any) {
                console.log("Error fetching addresses:", addrError);
                if (addrError.status === 401) {
                  console.log("Authentication failed, clearing user data");
                  localStorage.removeItem("afritrade:user");
                  localStorage.removeItem("shippingAddress");
                  window.dispatchEvent(new CustomEvent("auth:logout"));
                }
              }
            }
          }
        } catch (error) {
          console.log("Could not resolve user address from database:", error);
        }

        if (!userAddress) {
          const raw = localStorage.getItem("shippingAddress");
          if (raw) {
            userAddress = JSON.parse(raw);
          }
        }

        if (!aborted) {
          if (userAddress) {
            setAddress(userAddress);
            localStorage.setItem("shippingAddress", JSON.stringify(userAddress));
          } else {
            setAddress(null);
            localStorage.removeItem("shippingAddress");
          }
        }
      };

      await Promise.all([loadProducts(), loadAddress()]);
    }
    run();
    return () => {
      aborted = true;
    };
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const userId = getUserId();
        if (userId) {
          const res = await apiGet(`/api/v1/wallets/summary?userId=${userId}`) as any;
          if (res.data?.ngnWallet) {
            setWalletBalance({
              available: res.data.ngnWallet.available,
              creditLimit: res.data.ngnWallet.creditLimit || 0,
              creditUsed: res.data.ngnWallet.creditUsed || 0
            });
          }
        }
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }
    };
    fetchWallet();
  }, []);

  // Helpers for modal close with ESC
  useEffect(() => {
    if (!showItemsModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowItemsModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showItemsModal]);



  const MAX_QTY = 5;
  function setQty(productId: string, qty: number, minQty: number = 1) {
    setIdToQty((prev) => ({
      ...prev,
      [productId]: Math.max(minQty, Math.min(MAX_QTY, qty)),
    }));
  }

  const summary = useMemo(() => {
    let subtotal = 0,
      discount = 0,
      items = 0;
    products.forEach((p) => {
      const q = idToQty[p._id] || 0;
      items += q;
      // Use the exact same logic as ProductCard
      const originalPrice = p.price;
      const discounted =
        typeof p.discount === "number" && p.discount > 0
          ? Math.max(0, Math.round((originalPrice * (100 - p.discount)) / 100))
          : undefined;

      // Calculate totals using real prices
      subtotal += originalPrice * q; // Original price × quantity
      if (discounted !== undefined) {
        discount += (originalPrice - discounted) * q; // Actual amount saved
      }
    });
    const voucherDiscount = totalVoucherDiscount; // Requested voucher amount
    const finalSubtotal = Math.max(0, subtotal - discount);
    const voucherApplied = Math.min(voucherDiscount, finalSubtotal);
    const finalAfterVouchers = finalSubtotal - voucherApplied;
    const finalTotal = Math.max(0, finalAfterVouchers);
    return {
      items,
      subtotal,
      discount,
      voucherDiscount,
      voucherApplied,
      finalSubtotal,
      finalAfterVouchers,
      finalTotal,
    };
  }, [products, idToQty, totalVoucherDiscount]);

  // Show loading state while products are being fetched
  if (products.length === 0 && Object.keys(idToQty).length > 0) {
    return (
      <main className="mx-auto md:w-[95%] w-full px-2 md:px-6 py-5">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {translate(locale, "checkout.loading")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto md:w-[95%] w-full px-2 md:px-6 py-5">
      {/* Breadcrumb */}
      <nav className="mb-3 text-sm text-neutral-500">
        <Link href="/" className="text-neutral-500 dark:text-neutral-400">
          {translate(locale, "home.title")}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-500 dark:text-neutral-400">
          {translate(locale, "checkout.title")}
        </span>
      </nav>

      {/* Free Shipping Banner */}
      <div className="rounded border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 p-3 text-sm flex items-center justify-between mb-4 max-w-full lg:max-w-[calc(100%-400px-1.5rem)]">
        <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-200 text-[10px] sm:text-sm">
          <Check size={16} className="text-emerald-600" />
          {translate(locale, "cart.freeShippingBanner")}
        </div>
        <div className="text-neutral-500">{translate(locale, "cart.limitedTimeOffer")}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 lg:gap-0">
        {/* Left Column */}
        <section className="space-y-4 lg:space-y-0">
          {/* Shipping Address & Methods Combined */}
          <div className="w-full flex flex-col lg:flex-row justify-between gap-4 rounded-xs border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900">
            {/* Guest Email Input */}
            {!isLoggedIn && (
              <div className="w-full mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                  {translate(locale, "checkout.contactInfo")}
                </h3>
                <div className="space-y-2">
                  <label className="text-sm text-neutral-600 dark:text-neutral-400">
                    {translate(locale, "checkout.email")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder={translate(locale, "checkout.emailPlaceholder")}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                  />
                  <p className="text-xs text-neutral-500">
                    {translate(locale, "checkout.emailDesc")}
                  </p>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="mb-6 lg:mb-0 w-full lg:w-[40%] ">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                  {translate(locale, "checkout.shippingAddress")}
                </h3>
                <Link
                  href="/cart"
                  className="text-grey-600 dark:text-neutral-400 hover:underline text-sm"
                >
                  {translate(locale, "checkout.changeAddress")} ›
                </Link>
              </div>
              <AddressCard
                address={address}
                onEdit={() => setShowAddressModal(true)}
              />

              {(!address ||
                !address.address ||
                !address.city ||
                !address.country) && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                      ⚠️ {translate(locale, "checkout.addressRequired")}
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                      {translate(locale, "checkout.addressRequiredDesc")}
                    </div>
                    <Link
                      href="/cart"
                      className="inline-flex items-center gap-2 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-full hover:bg-amber-700 transition-colors"
                    >
                      {translate(locale, "checkout.addAddress")}
                    </Link>
                  </div>
                )}

              {/* Debug info for address validation */}
              {/* {process.env.NODE_ENV === 'development' && (
                                <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    Debug: address={!!address}, address.address={!!address?.address}, city={!!address?.city}, country={!!address?.country}, trigger={addressUpdateTrigger}
                                </div>
                            )} */}
            </div>

            {/* Shipping Methods */}
            {/* Shipping Methods - Hide for guests */}
            {isLoggedIn && (
              <div className="w-full lg:w-[40%]">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                  {translate(locale, "checkout.shippingMethods")}
                </h3>
                <div className="space-y-0">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      name="shipping"
                      type="radio"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="w-5 h-5 text-orange-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-base font-semibold text-emerald-700">
                        {translate(locale, "checkout.standardFree")}
                      </div>
                      <div className="text-sm font-semibold text-grey-500 dark:text-neutral-400 mt-1">
                        {translate(locale, "checkout.delivery")}: {config.shipping.standard.deliveryRange} ›
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Get a{" "}
                        {formatCurrency(config.shipping.standard.creditAmount)}{" "}
                        {products[0]?.currency || "NGN"} Credit for late
                        delivery?
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {translate(locale, "checkout.courierCompany")}:{" "}
                        {config.shipping.standard.couriers.join(", ")} ›
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      name="shipping"
                      type="radio"
                      checked={shippingMethod === "pickup"}
                      onChange={() => setShippingMethod("pickup")}
                      className="w-5 h-5 text-orange-500 mt-0.5"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-emerald-700">
                        {translate(locale, "checkout.pickupFree")}
                      </span>
                      <Truck size={16} className="text-green-600" />
                    </div>
                  </label>
                </div>
                {totalVoucherDiscount > 0 && (
                  <div className="flex items-center justify-end mt-4 font-semibold text-sm text-green-600">
                    {formatCurrency(totalVoucherDiscount)}{" "}
                    {products[0]?.currency || "NGN"} {translate(locale, "voucher.off")} applied
                    <ChevronRight size={14} className="text-neutral-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vouchers */}
          <div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-6 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-300 text-sm font-bold">
                  {products[0]?.currency || "NGN"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                {translate(locale, "checkout.vouchers")}
              </h3>
            </div>

            <VoucherInput
              onVoucherApplied={handleVoucherApplied}
              onVoucherRemoved={handleVoucherRemoved}
              appliedVouchers={appliedVouchers}
              orderAmount={summary?.subtotal || 0}
              productIds={products.map((p) => p._id)}
            />
          </div>

          {/* PO Number Input */}
          <div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 text-sm font-bold">#</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                {translate(locale, "checkout.purchaseOrder")}
              </h3>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-600 dark:text-neutral-400">
                {translate(locale, "checkout.enterPoNumber")}
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder={translate(locale, "checkout.poPlaceholder")}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Item Details */}
          <div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-grey-800">
                {translate(locale, "checkout.itemDetails")} (
                <span className="text-orange-500">{summary?.items || 0}</span>
                )
              </h3>
              <button
                onClick={() => setShowItemsModal(true)}
                className="hidden sm:flex items-center gap-1 text-grey-600 hover:underline text-sm font-semibold"
              >
                <span>{translate(locale, "checkout.viewAll")}</span>
                <ChevronRight size={14} className="text-neutral-500" />
              </button>
            </div>
            <button
              onClick={() => setShowItemsModal(true)}
              className="sm:hidden w-full text-left text-blue-600 underline text-sm font-medium mb-2"
            >
              {translate(locale, "checkout.viewAll")}
            </button>

            {/* Debug Info */}
            {products.length === 0 && (
              <div className="text-sm text-neutral-500 mb-4">
                No products found. Cart items: {Object.keys(idToQty).length}
              </div>
            )}

            {/* products cart list */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
              {products.map((p, index) => {
                const q = idToQty[p._id] || 0;
                // Use the exact same logic as ProductCard
                const discounted =
                  typeof p.discount === "number" && p.discount > 0
                    ? Math.max(
                      0,
                      Math.round((p.price * (100 - p.discount)) / 100)
                    )
                    : undefined;

                return (
                  <div
                    key={p._id}
                    onClick={() => setShowItemsModal(true)}
                    className="group rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 sm:p-3 hover:shadow-sm transition-shadow h-full flex flex-col cursor-pointer"
                  >
                    <div className="aspect-square rounded-md bg-neutral-100 dark:bg-neutral-900 mb-2 sm:mb-3 overflow-hidden relative">
                      {p.featured ? (
                        <span className="absolute left-1 sm:left-2 top-1 sm:top-2 z-10 rounded bg-amber-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 flex items-center gap-0.5 sm:gap-1 shadow-sm">
                          <span className="hidden sm:inline">{translate(locale, "product.featured")}</span>
                          <span className="sm:hidden">★</span>
                        </span>
                      ) : null}
                      {typeof p.discount === "number" && p.discount > 0 ? (
                        <span className="absolute right-1 sm:right-2 top-1 sm:top-2 z-10 rounded bg-rose-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 shadow-sm">
                          -{p.discount}%
                        </span>
                      ) : null}
                      <img
                        src={
                          p.images?.[0] ||
                          `https://placehold.co/160x160?text=${encodeURIComponent(
                            p.title
                          )}`
                        }
                        alt={p.title}
                        className="relative z-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    </div>
                    {p.brand && (
                      <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-neutral-500 mb-0.5 sm:mb-1">
                        {p.brand}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight">
                      {p.title}
                    </div>

                    {/* Price Section - Current and Original price on same level */}
                    <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <div className="inline-flex items-baseline bg-orange-500 text-white rounded px-1.5 sm:px-2 py-0.5">
                          <span className="text-base sm:text-lg font-extrabold leading-none">
                            {formatCurrency(discounted ?? p.price)}
                          </span>
                          <span className="text-[8px] sm:text-[10px] font-semibold ml-0.5 sm:ml-1 leading-none">
                            {p.currency}
                          </span>
                          {q > 1 && (
                            <span className="text-[8px] sm:text-[10px] ml-1">
                              x{q}
                            </span>
                          )}
                        </div>
                        {discounted !== undefined && (
                          <div className="text-xs sm:text-sm text-neutral-500">
                            <span className="line-through hidden sm:inline">
                              {formatCurrency(p.price)}{" "}
                              <span className="text-[8px] sm:text-[10px]">
                                {p.currency}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {products.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-base text-grey-700">
                <Gift size={16} />
                Add a free gift message card ›
              </div>
            )}
          </div>

          {/* Payment Methods */}
          {/* <div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900">
              <h3 className="text-lg font-semibold text-neutral-500 dark:text-neutral-300 mb-4">
                Payment methods
              </h3>
              <div className="space-y-4">
                {[
                  { id: "wallet", name: walletBalance ? `Wallet (Avail: ₦${((walletBalance.available + (walletBalance.creditLimit || 0) - (walletBalance.creditUsed || 0))).toLocaleString()})` : "Wallet", logo: "💰" },
                  // { id: "apple", name: "Apple Pay", logo: "🍎" },
                  // { id: "card", name: "Card", logo: "💳" },
                  // { id: "google", name: "Google Pay", logo: "G" },
                  // { id: "bank", name: "Bank transfer", logo: "🏦" },
                  // { id: "flutterwave", name: "Flutterwave", logo: "F" },
                  // { id: "paystack", name: "Paystack", logo: "P" },
                  // { id: "orange_money", name: "Orange Money", logo: "🍊" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      name="payment"
                      type="radio"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-orange-500"
                    />
                    <div className="flex-1">
                      <span className="text-base text-neutral-800 dark:text-neutral-400">
                        {method.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div> */}
        </section >

        {/* Right Column */}
        < aside className="mt-4 lg:mt-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto no-scrollbar h-max space-y-4 lg:space-y-0 pr-0 lg:pr-2" >
          {/* Order Summary */}
          < div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900" >
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
              {translate(locale, "checkout.orderSummary")}
            </h3>

            {/* Product Breakdown */}
            <div className="mb-4 space-y-2">
              {products.map((p) => {
                const q = idToQty[p._id] || 0;
                // Use the exact same logic as ProductCard
                const discounted =
                  typeof p.discount === "number" && p.discount > 0
                    ? Math.max(
                      0,
                      Math.round((p.price * (100 - p.discount)) / 100)
                    )
                    : undefined;
                const itemTotal = (discounted ?? p.price) * q;
                const originalItemTotal = p.price * q;
                const itemDiscount =
                  discounted !== undefined ? (p.price - discounted) * q : 0;

                return (
                  <div
                    key={p._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-800 dark:text-neutral-100 truncate">
                        {p.title}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Qty: {q} × {formatCurrency(discounted ?? p.price)}{" "}
                        {p.currency}
                        {discounted !== undefined && (
                          <span className="ml-2 text-rose-600">
                            (was {formatCurrency(p.price)} {p.currency})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-medium text-neutral-800 dark:text-neutral-100">
                        {formatCurrency(itemTotal)} {p.currency}
                      </div>
                      {itemDiscount > 0 && (
                        <div className="text-xs text-rose-600">
                          Saved: {formatCurrency(itemDiscount)} {p.currency}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 my-3 pt-2">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {translate(locale, "checkout.itemTotal")}:
                  </span>
                  <span className="line-through text-neutral-500 dark:text-neutral-400">
                    {formatCurrency(summary.subtotal)}{" "}
                    {products[0]?.currency || "NGN"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {translate(locale, "checkout.itemDiscount")}:
                  </span>
                  <span className="text-rose-600">
                    -{formatCurrency(summary.discount)}{" "}
                    {products[0]?.currency || "NGN"}
                  </span>
                </div>
                <div className="flex items-center justify-between font-medium text-neutral-800 dark:text-neutral-100">
                  <span>{translate(locale, "checkout.subtotal")}:</span>
                  <span>
                    {formatCurrency(summary?.finalSubtotal || 0)}{" "}
                    {products[0]?.currency || "NGN"}
                  </span>
                </div>
                {totalVoucherDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {translate(locale, "checkout.voucherDiscount")}:
                    </span>
                    <span className="text-rose-600">
                      -{formatCurrency(summary?.voucherApplied || 0)}{" "}
                      {products[0]?.currency || "NGN"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between font-medium text-neutral-800 dark:text-neutral-100">
                  <span>{translate(locale, "checkout.subtotalAfterVouchers")}:</span>
                  <span>
                    {formatCurrency(summary?.finalAfterVouchers || 0)}{" "}
                    {products[0]?.currency || "NGN"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {translate(locale, "checkout.shipping")}:
                  </span>
                  <span className="text-emerald-600 font-medium">{translate(locale, "checkout.free")}</span>
                </div>
              </div>
            </div>
            {/* Payment Methods */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 my-3 pt-2">
              <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
                {translate(locale, "checkout.paymentMethods")}
              </h3>
              <div className="space-y-3 mb-4">
                {[
                  { id: "wallet", name: walletBalance ? translate(locale, "checkout.walletAvailable", { amount: formatCurrency((walletBalance.available + (walletBalance.creditLimit || 0) - (walletBalance.creditUsed || 0))) }) : translate(locale, "checkout.wallet"), logo: "💰" },
                  // { id: "apple", name: "Apple Pay", logo: "🍎" },
                  // { id: "card", name: "Card", logo: "💳" },
                  // { id: "google", name: "Google Pay", logo: "G" },
                  // { id: "bank", name: "Bank transfer", logo: "🏦" },
                  // { id: "flutterwave", name: "Flutterwave", logo: "F" },
                  { id: "paystack", name: translate(locale, "checkout.payWithBank"), logo: "P" },
                  // { id: "orange_money", name: "Orange Money", logo: "🍊" },
                ].filter(method => {
                  // Hide wallet for guest users
                  if (method.id === 'wallet') {
                    if (!isLoggedIn) return false;

                    // Also hide for Wholesalers who don't have a walletId
                    try {
                      if (userData?.businessInfo?.businessType === 'Wholesaler' && !userData?.walletId) {
                        return false;
                      }
                    } catch (e) { }
                  }
                  return true;
                }).map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      name="payment"
                      type="radio"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-neutral-800 dark:text-neutral-400">
                        {method.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 my-3 pt-2">
              <div className="flex items-center justify-between text-base font-semibold text-neutral-800 dark:text-neutral-100">
                <span>{translate(locale, "checkout.orderTotal")}:</span>
                <span>
                  {formatCurrency(summary?.finalTotal || 0)}{" "}
                  {products[0]?.currency || "NGN"}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                let orderId: string | undefined;
                try {
                  setIsProcessing(true);
                  if (summary?.finalTotal <= 0) {
                    console.warn(
                      "Order total must be greater than 0 to proceed to payment."
                    );
                    return;
                  }

                  // Validate shipping address exists
                  if (
                    !address ||
                    !address.address ||
                    !address.city ||
                    !address.country
                  ) {
                    alert(
                      "Please add a complete shipping address before proceeding with checkout."
                    );
                    return;
                  }

                  // Validate guest email if not logged in
                  let buyerId: string | undefined = undefined;
                  if (userData) {
                    buyerId = userData.id || userData._id;
                  }

                  if (!buyerId && !guestEmail) {
                    alert("Please enter your email address to proceed.");
                    return;
                  }

                  // Build minimal order snapshot for metadata
                  const items = products.map((p) => {
                    // Calculate discounted price (same logic as summary)
                    const discountedPrice = typeof p.discount === "number" && p.discount > 0
                      ? Math.max(0, Math.round((p.price * (100 - p.discount)) / 100))
                      : p.price;

                    return {
                      productId: p._id,
                      vendorId: p.seller as any,
                      qty: idToQty[p._id] || 1,
                      unitPrice: discountedPrice,
                      currency: p.currency,
                    };
                  });
                  console.log("Order items being sent:", items);

                  // WALLET PAYMENT: Process payment FIRST, then create order
                  if (paymentMethod === "wallet" && isLoggedIn) {
                    const availableFunds = (walletBalance?.available || 0) + (walletBalance?.creditLimit || 0) - (walletBalance?.creditUsed || 0);
                    const orderAmount = Math.round((summary?.finalTotal || 0)); // Wallet balance is already in Naira, not kobo

                    if (availableFunds < orderAmount) {
                      setInsufficientBalanceData({
                        requiredAmount: orderAmount,
                        availableAmount: availableFunds,
                        currency: "NGN"
                      });
                      setShowInsufficientBalanceModal(true);
                      return;
                    }

                    // 1. Process payment FIRST
                    const paymentResult = await apiPost("/api/v1/wallets/checkout", {
                      amount: orderAmount,
                      currency: "NGN",
                      lineItems: items
                    }) as any;

                    // 2. Create order ONLY after successful payment
                    const orderRes = await createOrder({
                      buyerId,
                      lineItems: items,
                      currency: "NGN",
                      shippingDetails: address || {},
                      paymentStatus: "completed", // Already paid!
                      paymentMethod: "wallet",
                      paymentReference: paymentResult.data.transactionId
                    });
                    orderId = orderRes?.data?.orderId;

                    // 3. Redirect to success
                    router.push(`/checkout/success?orderId=${orderId}`);
                    return;
                  }

                  // BANK PAYMENT: Create order first, then redirect to gateway
                  const provider =
                    paymentMethod === "flutterwave"
                      ? "flutterwave"
                      : "paystack";

                  const orderRes = await createOrder({
                    buyerId,
                    email: buyerId ? undefined : guestEmail,
                    lineItems: items,
                    currency: "NGN",
                    shippingDetails: address || {},
                  });
                  orderId = orderRes?.data?.orderId;

                  const payload = {
                    orderId,
                    provider,
                    amount: Math.max(
                      0,
                      Math.round((summary?.finalTotal || 0) * 100)
                    ),
                    currency: "NGN",
                    customer: { email: buyerId ? "user@example.com" : guestEmail }, // Use guest ema
                    returnUrl: `${window.location.origin}/checkout/callback?provider=${provider}&orderId=${orderId}`,
                    metadata: { items },
                  };
                  const res = await initiatePayment(payload);
                  const url = res?.data?.url;
                  if (url) window.location.href = url;
                } catch (e: any) {
                  console.error("init payment error", e);
                  // Cleanup the pending order if payment initialization fails
                  if (orderId) {
                    try {
                      await apiDelete(`/api/v1/orders/${orderId}`);
                      console.log("Cleaned up pending order after payment failure:", orderId);
                    } catch (cleanupError) {
                      console.error("Failed to cleanup order:", cleanupError);
                    }
                  }
                  alert("Payment failed. Please try again. Error: " + (e as Error).message);
                } finally {
                  setIsProcessing(false);
                }
              }}
              disabled={
                isProcessing ||
                (summary?.finalTotal || 0) <= 0 ||
                !address ||
                !address.address ||
                !address.city ||
                !address.country
              }
              aria-disabled={
                isProcessing ||
                (summary?.finalTotal || 0) <= 0 ||
                !address ||
                !address.address ||
                !address.city ||
                !address.country
              }
              className={`w-full font-semibold py-3 px-4 rounded-full transition-colors ${isProcessing ||
                (summary?.finalTotal || 0) <= 0 ||
                !address ||
                !address.address ||
                !address.city ||
                !address.country
                ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
            >
              {isProcessing ? translate(locale, "checkout.processing") : `${translate(locale, "checkout.submitOrder")} (${summary?.items || 0})`}
            </button>
            {
              (summary?.finalTotal || 0) <= 0 && (
                <div className="mt-2 text-xs text-rose-600 text-center">
                  Order total must be greater than 0 after discounts and
                  vouchers.
                </div>
              )
            }

            {
              (!address ||
                !address.address ||
                !address.city ||
                !address.country) && (
                <div className="mt-2 text-xs text-rose-600 text-center">
                  Please add a complete shipping address to proceed with
                  checkout.
                </div>
              )
            }

            <div className="mt-4 text-xs text-neutral-500 text-center">
              {translate(locale, "checkout.terms.agree")}{" "}
              <Link href="#" className="text-blue-600 underline">
                {translate(locale, "checkout.terms.termsOfUse")}
              </Link>{" "}
              {translate(locale, "checkout.terms.acknowledge")}{" "}
              <Link href="#" className="text-blue-600 underline">
                {translate(locale, "checkout.terms.privacyPolicy")}
              </Link>
              .
            </div>
          </div >

          {/* Donate with Marketplace */}
          < div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900" >
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
              {translate(locale, "checkout.trust.donate")}
            </h3>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={donateTree}
                onChange={(e) => setDonateTree(e.target.checked)}
                className="w-4 h-4 text-orange-500 mt-0.5"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {translate(locale, "checkout.trust.donateTree", { amount: formatCurrency(config.donation.treeAmount), currency: products[0]?.currency || "NGN" })}
              </span>
            </label>
          </div >

          {/* Tree Planting Program */}
          < div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900" >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                Plant
              </span>
              <Leaf size={16} className="text-green-600" />
              <h3 className="text-base font-semibold text-green-700">
                {translate(locale, "checkout.trust.plantTree")}
              </h3>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
              {translate(locale, "checkout.trust.plantTreeDesc")}
            </p>
            <div className="w-20 h-12 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded flex items-center justify-center mx-auto">
              <span
                className="text-green-700 text-[11px] font-semibold text-center leading-tight"
                dangerouslySetInnerHTML={{ __html: translate(locale, "checkout.trust.treesForFuture") }}
              />
            </div>
          </div >

          {/* Delivery Guarantee */}
          < div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900" >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-green-600" />
              <h3 className="text-base font-semibold text-green-700">
                {translate(locale, "checkout.trust.deliveryGuarantee")}
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                {translate(locale, "checkout.trust.delayCredit", { amount: formatCurrency(config.shipping.standard.creditAmount), currency: products[0]?.currency || "NGN" })}
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                {translate(locale, "checkout.trust.damageReturn")}
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                {translate(locale, "checkout.trust.noUpdateRefund")}
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                {translate(locale, "checkout.trust.noDeliveryRefund")}
              </li>
            </ul>
            <Link
              href="#"
              className="text-green-700 text-sm hover:underline mt-2 inline-block"
            >
              {translate(locale, "checkout.trust.learnMore")} ›
            </Link>
          </div >

          {/* Card Protection */}
          < div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900" >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-green-600" />
              <h3 className="text-base font-semibold text-green-700">
                {translate(locale, "checkout.trust.secureCard")}
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                {translate(locale, "checkout.trust.pciDss")}
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                {translate(locale, "checkout.trust.cardSecure")}
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                {translate(locale, "checkout.trust.dataSafeguarded")}
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                {translate(locale, "checkout.trust.noSell")}
              </li>
            </ul>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                "PCI DSS",
                "VISA",
                "ID Check",
                "SafeKey",
                "ProtectBuy",
                "JCB",
                "J/Secure",
                "APWG",
              ].map((logo) => (
                <div
                  key={logo}
                  className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div >

          {/* Secure privacy */}
          < div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900" >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-green-600" />
              <h3 className="text-base font-semibold text-green-700">
                {translate(locale, "checkout.trust.securePrivacy")}
              </h3>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {translate(locale, "checkout.trust.securePrivacyDesc")}
            </p>
            <Link
              href="#"
              className="text-green-700 text-sm hover:underline mt-2 inline-block"
            >
              {translate(locale, "checkout.trust.learnMore")} ›
            </Link>
          </div >

          {/* Marketplace purchase protection */}
          < div className="rounded-xs border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900" >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-green-600" />
              <h3 className="text-base font-semibold text-green-700">
                {translate(locale, "checkout.trust.purchaseProtection")}
              </h3>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {translate(locale, "checkout.trust.purchaseProtectionDesc")}
            </p>
            <Link
              href="#"
              className="text-green-700 text-sm hover:underline mt-2 inline-block"
            >
              {translate(locale, "checkout.trust.learnMore")} ›
            </Link>
          </div >
        </aside >
      </div >

      {showItemsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowItemsModal(false)}
          />
          <div className="relative w-full sm:w-[min(720px,95vw)] max-h-[80vh] sm:max-h-[70vh] overflow-y-auto no-scrollbar rounded-t-xl sm:rounded-xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <button
              aria-label="Close"
              onClick={() => setShowItemsModal(false)}
              className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <X size={22} />
            </button>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-[22px] leading-7 font-semibold text-center text-neutral-800 dark:text-neutral-100">
                {translate(locale, "checkout.itemDetails")}
              </h2>
            </div>
            <div className="px-4 sm:px-6 py-2 divide-y divide-neutral-200 dark:divide-neutral-800">
              {products.map((p) => {
                const q = idToQty[p._id] || 1;
                const discounted =
                  typeof p.discount === "number" && p.discount > 0
                    ? Math.max(
                      0,
                      Math.round((p.price * (100 - p.discount)) / 100)
                    )
                    : undefined;
                return (
                  <div
                    key={p._id}
                    className="py-4 grid grid-cols-[96px_1fr_auto] sm:grid-cols-[160px_1fr_auto] gap-4 items-start"
                  >
                    <img
                      src={
                        p.images?.[0] ||
                        `https://placehold.co/160x160?text=${encodeURIComponent(
                          p.title
                        )}`
                      }
                      alt={p.title}
                      className="w-24 h-24 sm:w-40 sm:h-40 object-cover rounded-md"
                    />
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                        {p.title}
                      </div>
                      {typeof p.discount === "number" && p.discount > 0 && (
                        <div className="text-orange-500 font-semibold mt-2">
                          Big sale | Limited time
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-baseline bg-orange-500 text-white rounded px-2 py-0.5">
                          <span className="text-xl font-bold leading-none">
                            {formatCurrency(discounted ?? p.price)}
                          </span>
                          <span className="text-[10px] font-semibold ml-1 leading-none">
                            {p.currency}
                          </span>
                        </div>
                        {discounted !== undefined && (
                          <div className="text-neutral-500 dark:text-neutral-400">
                            <span className="line-through mr-2">
                              {formatCurrency(p.price)} {p.currency}
                            </span>
                            <span className="inline-block bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold px-2 py-0.5 rounded">
                              -{p.discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <label className="text-sm text-neutral-600 dark:text-neutral-400 mr-2 hidden sm:inline">
                        Qty:
                      </label>
                      <select
                        value={q}
                        onChange={(e) =>
                          setQty(p._id, Number(e.target.value), p.minOrderQuantity || 1)
                        }
                        className="appearance-none bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1 pr-7 text-sm text-neutral-800 dark:text-neutral-100 w-[88px]"
                      >
                        {Array.from({ length: MAX_QTY - (p.minOrderQuantity || 1) + 1 }, (_, i) => i + (p.minOrderQuantity || 1)).map(
                          (n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )
      }

      {/* Address Modal */}
      {
        showAddressModal && (
          <AddressModal
            open={showAddressModal}
            onClose={() => setShowAddressModal(false)}
            onSaved={(updatedAddress: any) => {
              // Get the latest user data to construct the displayName
              const userData = localStorage.getItem("afritrade:user");
              if (userData) {
                const user = JSON.parse(userData);
                const updatedAddressWithName = {
                  ...updatedAddress,
                  displayName: `${user.firstName || user.username || "User"} ${user.lastName || ""
                    }`.trim(),
                };
                setAddress(updatedAddressWithName);
                console.log(
                  "Checkout: Address updated with new displayName:",
                  updatedAddressWithName.displayName
                );
              } else {
                setAddress(updatedAddress);
              }

              // Force re-render to trigger validation logic update
              setAddressUpdateTrigger((prev) => prev + 1);
              console.log(
                "Checkout: Triggered address validation re-render from onSaved"
              );

              setShowAddressModal(false);
            }}
            initialData={address}
            onAddressUpdate={updateLocalUserData}
          />
        )
      }

      {/* Insufficient Balance Modal */}
      {
        showInsufficientBalanceModal && insufficientBalanceData && (
          <InsufficientBalanceModal
            isOpen={showInsufficientBalanceModal}
            onClose={() => {
              setShowInsufficientBalanceModal(false);
              setInsufficientBalanceData(null);
            }}
            requiredAmount={insufficientBalanceData?.requiredAmount || 0}
            availableAmount={insufficientBalanceData?.availableAmount || 0}
            currency={insufficientBalanceData?.currency || "NGN"}
            onAddFunds={() => {
              setShowInsufficientBalanceModal(false);
              setInsufficientBalanceData(null);
              // Navigate to wallet page or add funds modal
              window.location.href = "/profile/wallet";
            }}
            onUseOtherPayment={() => {
              setShowInsufficientBalanceModal(false);
              setInsufficientBalanceData(null);
              setPaymentMethod("card"); // Switch to card payment
            }}
          />
        )
      }
    </main >
  );
}
