"use client";
import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import BookingModal, { BookingPackage } from "@/components/bazaar/BookingModal";
import { CheckCircle2, Award, Crown, Sparkles } from "lucide-react";
import { translate } from "@/utils/translate";

export default function SponsorshipPage() {
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const packages: BookingPackage[] = [
    {
      id: "brand",
      name: translate("bazaar.brandPromotion") || "Brand Promotion",
      price: 150000,
      type: "sponsorship",
      summary: translate("bazaar.brandPromotionSummary") || "Logo placement on promotional materials, screen displays and website.",
    },
    {
      id: "gold",
      name: translate("bazaar.goldSponsorship") || "Gold Sponsorship",
      price: 300000,
      type: "sponsorship",
      summary: translate("bazaar.goldSponsorshipSummary") || "Exhibition stall, stage recognition and prominent branding.",
    },
    {
      id: "headline",
      name: translate("bazaar.headlineSponsorship") || "Headline Sponsorship",
      price: 500000,
      type: "sponsorship",
      summary: translate("bazaar.headlineSponsorshipSummary") || "Exclusive presenting sponsor naming rights and maximum brand exposure.",
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
            {translate("bazaar.sponsorshipHeading") || "Sponsorship Packages"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4">
            {translate("bazaar.partnerTitle") || "Partner with GloTrade Bazaar"}
          </h1>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            {translate("bazaar.sponsorshipSubtitle") || "Elevate your brand presence. Partner with GloTrade Bazaar for maximum visibility, media coverage, and VIP networking."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Brand Sponsor */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Tier 1
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.brandPromotion") || "Brand Promotion"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦150,000</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[0].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featLogoBackdrop") || "Logo on event backdrop & website"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featSocialMention") || "Social media official mention"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.feat2VipPasses") || "2 VIP passes included"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[0])}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              {translate("bazaar.applySponsorshipCta") || "Apply for Sponsorship"}
            </button>
          </div>

          {/* Gold Sponsor */}
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
              {translate("bazaar.popularChoice") || "Recommended"}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Tier 2
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.goldSponsorship") || "Gold Sponsorship"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦300,000</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[1].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featPremStallSpace") || "Premium exhibition stall space"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featStageShoutouts") || "Stage & MC shoutouts during event"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featLogoDigitalAds") || "Logo on all digital & print ads"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.feat4VipPasses") || "4 VIP passes included"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[1])}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              {translate("bazaar.applySponsorshipCta") || "Apply for Sponsorship"}
            </button>
          </div>

          {/* Headline Sponsor */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {translate("bazaar.tier3Presenting") || "Tier 3 - Presenting Partner"}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.headlineSponsorship") || "Headline Sponsorship"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦500,000</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[2].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featCoBranding") || "Co-branding as presenting partner"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featStageProminence") || "Main stage backdrop prominence"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featKeynoteSpeaking") || "Keynote speaking opportunity"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featTablePlusVipPasses") || "Reserved Table of 4 + 6 VIP passes"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[2])}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              {translate("bazaar.applySponsorshipCta") || "Apply for Sponsorship"}
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
