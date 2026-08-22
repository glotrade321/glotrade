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
      id: "stall-standard",
      name: translate("bazaar.standardStall") || "Standard Stall",
      price: 50000,
      type: "exhibitor",
      summary: translate("bazaar.standardStallSummary") || "Exhibitor space with table, chairs and brand listing in event directory.",
    },
    /*
    {
      id: "stall-premium",
      name: translate("bazaar.premiumStall") || "Premium Stall",
      price: 120000,
      type: "exhibitor",
      summary: translate("bazaar.premiumStallSummary") || "Prime location stall space with extra display room and social promo.",
    },
    */
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

        <div className="max-w-xl mx-auto mb-16">
          {/* Standard Stall */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {translate("bazaar.standardBooth") || "Standard Booth"}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.standardStall") || "Standard Stall"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦50,000</span>
                <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.perBooth") || "booth"}</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[0].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featStallTableChairs") || "1x Exhibition table & 2 chairs"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featExhibitorPasses") || "Exhibitor passes for staff"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featDirectoryListing") || "Directory listing on website"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[0])}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              {translate("bazaar.bookStallCta") || "Apply for Standard Stall"}
            </button>
          </div>

          {/* Premium Stall - Commented out for now
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
              {translate("bazaar.popularChoice") || "Prime Visibility"}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                {translate("bazaar.primeBooth") || "Prime Location Booth"}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.premiumStall") || "Premium Stall"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦120,000</span>
                <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.perPrimeBooth") || "prime booth"}</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[1]?.summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featPrimeFootfall") || "Prime high-footfall exhibition booth"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featExhibitorPasses") || "Exhibitor passes for staff"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featSocialShoutout") || "Dedicated social media shoutout"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featPowerDisplay") || "Power outlet & display space"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[1])}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              {translate("bazaar.bookStallCta") || "Apply for Premium Stall"}
            </button>
          </div>
          */}
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
