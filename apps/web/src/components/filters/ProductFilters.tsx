"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import DualRangeSlider from "./DualRangeSlider";
import MobileSheet from "@/components/ui/MobileSheet";

import { translate, Locale } from "@/utils/i18n";

type Props = {
  params: Record<string, string>;
  basePath?: string;
  selectedCategory?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sort?: string;
  variant: "desktop" | "mobile";
  locale?: Locale;
};

function withParams(
  basePath: string,
  params: Record<string, string>,
  updates: Record<string, string | number | undefined>
) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  Object.entries(updates).forEach(([k, v]) => {
    if (v === undefined || v === "") sp.delete(k);
    else sp.set(k, String(v));
  });
  const query = sp.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function ProductFilters({
  params,
  basePath = "/marketplace",
  selectedCategory,
  minPrice,
  maxPrice,
  condition,
  sort,
  variant,
  locale = "en"
}: Props) {
  const base = basePath;
  const minDefault = Number(minPrice || 0);
  const maxDefault = Number(maxPrice || 2000);
  const [range, setRange] = useState({ min: minDefault, max: maxDefault });
  const [open, setOpen] = useState<null | "price" | "sort" | "condition">(null);

  // Derived helpers
  const ratingMin = params["ratingMin"];
  const verifiedSeller = params["verifiedSeller"] === "true";
  const freeShipping = params["freeShippingsss"] === "true";
  const etaMaxDays = params["etaMaxDays"];
  const discountMin = params["discountMin"];
  const attrKeys = Object.keys(params).filter((k) => k.startsWith("attr_"));

  const activeCount = useMemo(() => {
    let n = 0;
    if (Number(minPrice || 0) !== 0) n++;
    if (Number(maxPrice || 0) !== 0) n++;
    if (condition) n++;
    if (sort) n++;
    if (ratingMin) n++;
    if (verifiedSeller) n++;
    if (freeShipping) n++;
    if (etaMaxDays) n++;
    if (discountMin) n++;
    n += attrKeys.length;
    return n;
  }, [minPrice, maxPrice, condition, sort, ratingMin, verifiedSeller, freeShipping, etaMaxDays, discountMin, attrKeys.length]);

  const clearAllHref = useMemo(() => {
    const preserved: Record<string, string> = {};
    if (params.q) preserved.q = params.q;
    return withParams(base, preserved, {});
  }, [params, base]);

  const priceForm = (
    <form action={base} className="flex items-center gap-2">
      <input
        type="number"
        name="minPrice"
        value={range.min}
        onChange={(e) => setRange({ ...range, min: Number(e.target.value) })}
        placeholder={translate(locale, "filters.min")}
        className="w-24 rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm"
      />
      <span className="text-neutral-400">-</span>
      <input
        type="number"
        name="maxPrice"
        value={range.max}
        onChange={(e) => setRange({ ...range, max: Number(e.target.value) })}
        placeholder={translate(locale, "filters.max")}
        className="w-24 rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm"
      />
      {selectedCategory ? (
        <input type="hidden" name="category" value={selectedCategory} />
      ) : null}
      {condition ? <input type="hidden" name="condition" value={condition} /> : null}
      {sort ? <input type="hidden" name="sort" value={sort} /> : null}
      <button
        type="submit"
        className="rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black text-sm px-3 py-1"
      >
        {translate(locale, "filters.apply")}
      </button>
    </form>
  );

  const slider = (
    <DualRangeSlider
      min={0}
      max={5000}
      step={10}
      valueMin={range.min}
      valueMax={range.max}
      onChange={setRange}
    />
  );

  const conditionChips = (
    <div className="flex flex-wrap gap-2">
      {[
        { label: translate(locale, "condition.new"), value: "new" },
        { label: translate(locale, "condition.used"), value: "used" },
        { label: translate(locale, "condition.refurbished"), value: "refurbished" },
      ].map((c) => (
        <Link
          key={c.value}
          href={withParams(base, params, { condition: c.value })}
          className={`px-3 py-1 rounded-full border text-sm ${condition === c.value
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
            : "border-neutral-300 dark:border-neutral-700"
            }`}
        >
          {c.label}
        </Link>
      ))}
      {condition ? (
        <Link
          href={withParams(base, params, { condition: undefined })}
          className="text-sm text-neutral-500 hover:underline"
        >
          {translate(locale, "filters.clear")}
        </Link>
      ) : null}
    </div>
  );

  const sortChips = (
    <div className="flex flex-wrap gap-2">
      {[
        { label: translate(locale, "market.sortPopular"), value: "-views" },
        { label: translate(locale, "market.sortPriceLowHigh"), value: "price" },
        { label: translate(locale, "market.sortPriceHighLow"), value: "-price" },
        { label: translate(locale, "market.sortNewest"), value: "-createdAt" },
      ].map((s) => (
        <Link
          key={s.value}
          href={withParams(base, params, { sort: s.value })}
          className={`px-3 py-1 rounded-full border text-sm ${sort === s.value
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
            : "border-neutral-300 dark:border-neutral-700"
            }`}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );

  // Price quick presets
  const presets = [
    { label: "< 20", min: 0, max: 20 },
    { label: "20–50", min: 20, max: 50 },
    { label: "50–100", min: 50, max: 100 },
    { label: "100–250", min: 100, max: 250 },
    { label: "> 250", min: 250, max: 5000 },
  ];

  const presetChips = (
    <div className="flex flex-wrap gap-2">
      {presets.map((p) => (
        <Link
          key={p.label}
          href={withParams(base, params, { minPrice: p.min, maxPrice: p.max })}
          className="px-3 py-1 rounded-full border text-sm border-neutral-300 dark:border-neutral-700"
          onClick={() => setRange({ min: p.min, max: p.max })}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );

  // Rating chips
  const ratingChips = (
    <div className="flex flex-wrap gap-2">
      {["3", "4", "4.5", "5"].map((r) => (
        <Link
          key={r}
          href={withParams(base, params, { ratingMin: r })}
          className={`px-3 py-1 rounded-full border text-sm ${ratingMin === r ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "border-neutral-300 dark:border-neutral-700"}`}
        >
          {r}+ ★
        </Link>
      ))}
      {ratingMin ? (
        <Link href={withParams(base, params, { ratingMin: undefined })} className="text-sm text-neutral-500 hover:underline">{translate(locale, "filters.clear")}</Link>
      ) : null}
    </div>
  );

  // Seller / Shipping / Deals
  const sellerChips = (
    <div className="flex flex-wrap gap-2">
      <Link href={withParams(base, params, { verifiedSeller: (!verifiedSeller).toString() })} className={`px-3 py-1 rounded-full border text-sm ${verifiedSeller ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "border-neutral-300 dark:border-neutral-700"}`}>{translate(locale, "filters.verifiedSeller")}</Link>
    </div>
  );

  const shippingChips = (
    <div className="flex flex-wrap gap-2">
      <Link href={withParams(base, params, { freeShipping: (!freeShipping).toString() })} className={`px-3 py-1 rounded-full border text-sm ${freeShipping ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "border-neutral-300 dark:border-neutral-700"}`}>{translate(locale, "market.filterFreeShipping")}</Link>
      {["2", "3", "7"].map((d) => (
        <Link key={d} href={withParams(base, params, { etaMaxDays: d })} className={`px-3 py-1 rounded-full border text-sm ${etaMaxDays === d ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "border-neutral-300 dark:border-neutral-700"}`}>≤ {d} {translate(locale, "filters.days")}</Link>
      ))}
      {etaMaxDays ? (
        <Link href={withParams(base, params, { etaMaxDays: undefined })} className="text-sm text-neutral-500 hover:underline">{translate(locale, "filters.clearETA")}</Link>
      ) : null}
    </div>
  );

  const dealsChips = (
    <div className="flex flex-wrap gap-2">
      {["10", "20", "30", "50"].map((d) => (
        <Link key={d} href={withParams(base, params, { discountMin: d })} className={`px-3 py-1 rounded-full border text-sm ${discountMin === d ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "border-neutral-300 dark:border-neutral-700"}`}>-{d}% {translate(locale, "filters.percentOff")}</Link>
      ))}
      {discountMin ? (
        <Link href={withParams(base, params, { discountMin: undefined })} className="text-sm text-neutral-500 hover:underline">{translate(locale, "filters.clear")}</Link>
      ) : null}
    </div>
  );

  // Category-specific attribute facets (simple mapping)
  const facetMap: Record<string, Record<string, string[]>> = {
    Smartphones: { Brand: ["Nova", "Aurora"], Storage: ["64GB", "128GB", "256GB"], RAM: ["4GB", "6GB", "8GB"] },
    Headphones: { Type: ["Over-ear", "In-ear"], ANC: ["ANC", "Passive"], Brand: ["Aero", "Sonic"] },
    Laptops: { RAM: ["8GB", "16GB"], Storage: ["256GB", "512GB"], Size: ["13\"", "14\"", "15\""] },
    "T-Shirts": { Size: ["S", "M", "L", "XL"], Color: ["Black", "White", "Blue"] },
  };
  const facets = selectedCategory ? facetMap[selectedCategory] : undefined;
  const attributesUI = facets ? (
    <div className="space-y-3">
      {Object.entries(facets).map(([facet, options]) => (
        <div key={facet}>
          <div className="text-sm font-semibold mb-2">{facet}</div>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <Link key={opt} href={withParams(base, params, { ["attr_" + facet.toLowerCase()]: opt })} className="px-3 py-1 rounded-full border text-sm border-neutral-300 dark:border-neutral-700">
                {opt}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : null;

  if (variant === "desktop") {
    return (
      <>
        <div>
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.price")}</div>
          {slider}
          <div className="mt-2">{priceForm}</div>
          <div className="mt-2">{presetChips}</div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.condition")}</div>
          {conditionChips}
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.rating")}</div>
          {ratingChips}
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.sort")}</div>
          {sortChips}
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.shipping")}</div>
          {shippingChips}
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.deals")}</div>
          {dealsChips}
        </div>
        {attributesUI}
        <div className="pt-2">
          <Link href={clearAllHref} className="text-sm text-neutral-500 hover:underline">{translate(locale, "filters.clearAll")}{activeCount ? ` (${activeCount})` : ""}</Link>
        </div>
      </>
    );
  }

  // mobile
  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button onClick={() => setOpen("price")} className="bg-neutral-100 dark:bg-neutral-900 rounded-full px-3 py-1.5 text-sm font-medium">{translate(locale, "filters.price")}</button>
        <button onClick={() => setOpen("sort")} className="bg-neutral-100 dark:bg-neutral-900 rounded-full px-3 py-1.5 text-sm font-medium">{translate(locale, "filters.sort")}</button>
        <button onClick={() => setOpen("condition")} className="bg-neutral-100 dark:bg-neutral-900 rounded-full px-3 py-1.5 text-sm font-medium">{translate(locale, "filters.condition")}</button>
        <Link href={clearAllHref} className="text-sm text-neutral-500 hover:underline ml-auto">{translate(locale, "filters.clearAll")}{activeCount ? ` (${activeCount})` : ""}</Link>
      </div>

      <MobileSheet open={open === "price"} onClose={() => setOpen(null)} title={translate(locale, "filters.price")}>
        {slider}
        <div className="mt-3">{priceForm}</div>
        <div className="mt-3">{presetChips}</div>
      </MobileSheet>
      <MobileSheet open={open === "sort"} onClose={() => setOpen(null)} title={translate(locale, "filters.sort")}>
        {sortChips}
      </MobileSheet>
      <MobileSheet open={open === "condition"} onClose={() => setOpen(null)} title={translate(locale, "filters.condition")}>
        {conditionChips}
        <div className="mt-4">
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.rating")}</div>
          {ratingChips}
        </div>
        <div className="mt-4">
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.shipping")}</div>
          {shippingChips}
        </div>
        <div className="mt-4">
          <div className="text-sm font-semibold mb-3">{translate(locale, "filters.deals")}</div>
          {dealsChips}
        </div>
      </MobileSheet>
    </>
  );
}

