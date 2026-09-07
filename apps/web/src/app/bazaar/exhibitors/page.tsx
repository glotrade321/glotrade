"use client";
import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import BookingModal, { BookingPackage } from "@/components/bazaar/BookingModal";
import { CheckCircle2, Store, Sparkles, Building2 } from "lucide-react";
import { translate } from "@/utils/translate";

export default function ExhibitorsPage() {
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const packages: BookingPackage[] = [
    {
      id: "stall-half",
      name: translate("bazaar.halfSpaceStall") || "Half Space Stall",
      price: 25000,
      type: "exhibitor",
      summary:
        translate("bazaar.halfSpaceStallSummary") ||
        "Shared exhibitor space with dedicated display table, chair and brand listing in event directory.",
    },
    {
      id: "stall-standard",
      name: translate("bazaar.standardStall") || "Standard Stall",
      price: 50000,
      type: "exhibitor",
      summary:
        translate("bazaar.standardStallSummary") ||
        "Full exhibitor space with table, chairs and brand listing in event directory.",
    },
  ];

  const handleOpenModal = (pkg: BookingPackage) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {translate("bazaar.exhibitorHeading") || "Exhibitor & Vendor Spaces"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4">
            {translate("bazaar.exhibitTitle") || "Exhibit at GloTrade Bazaar"}
          </h1>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            {translate("bazaar.exhibitorSubtitle") || "Position your business in front of thousands of active buyers and business owners at Harrow Park, Abuja."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 items-stretch">
          {/* Half Space Stall */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {translate("bazaar.halfSpaceBooth") || "Half Space Booth"}
                </span>
                <span className="text-[11px] font-bold text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Shared Space
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.halfSpaceStall") || "Half Space Stall"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦25,000</span>
                <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.perHalfBooth") || "half space"}</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[0].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featHalfStallTable") || "1x Dedicated display table & 1 chair"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featHalfStaffPass") || "1x Exhibitor staff pass"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featDirectoryListing") || "Directory listing on website"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featShopperAccess") || "Direct access to thousands of shoppers"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[0])}
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 hover:border-amber-500/50 shadow-md transition-all"
            >
              {translate("bazaar.bookHalfStallCta") || "Apply for Half Space Stall"}
            </button>
          </div>

          {/* Standard Full Stall */}
          <div className="bg-slate-900 border-2 border-amber-500/50 hover:border-amber-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl shadow-amber-500/5 transition-all hover:-translate-y-1">
            <div className="absolute -top-3.5 right-6 bg-amber-500 text-slate-950 text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Full Booth
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  {translate("bazaar.standardBooth") || "Standard Booth"}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.standardStall") || "Standard Stall"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦50,000</span>
                <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.perBooth") || "booth"}</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[1].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featStallTableChairs") || "1x Exhibition table & 2 chairs"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featExhibitorPasses") || "2x Exhibitor passes for staff"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featDirectoryListing") || "Directory listing on website"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  Full booth frontage & branding visibility
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[1])}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              {translate("bazaar.bookStallCta") || "Apply for Standard Stall"}
            </button>
          </div>
        </div>
      </main>

      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pkg={selectedPkg}
      />

      <BazaarFooter />
    </div>
  );
}
