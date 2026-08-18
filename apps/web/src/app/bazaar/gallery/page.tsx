"use client";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import { Camera, Sparkles, Image as ImageIcon } from "lucide-react";
import { translate } from "@/utils/translate";

export default function GalleryPage() {
  const highlights = [
    {
      title: translate("bazaar.galItem1Title") || "Exhibition Stalls & Displays",
      desc: translate("bazaar.galItem1Desc") || "Premium brand showcases and vendor setups.",
    },
    {
      title: translate("bazaar.galItem2Title") || "Executive Networking Lounge",
      desc: translate("bazaar.galItem2Desc") || "Business leaders and entrepreneurs connecting.",
    },
    {
      title: translate("bazaar.galItem3Title") || "Live Music & Main Stage",
      desc: translate("bazaar.galItem3Desc") || "Stage lights, DJ sets and live artist performances.",
    },
    {
      title: translate("bazaar.galItem4Title") || "VIP Hospitality Zone",
      desc: translate("bazaar.galItem4Desc") || "Exclusive refreshments and reserved guest tables.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {translate("bazaar.galleryBadge") || "Event Gallery Teaser"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4">
            {translate("bazaar.galleryTitle") || "Highlights & Experience"}
          </h1>
          <p className="text-slate-400 mt-4 text-base">
            {translate("bazaar.gallerySubtitle") || "Get a preview of the vibrant atmosphere, trade showcases, and entertainment at GloTrade Bazaar."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center hover:border-amber-500/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Camera size={24} />
              </div>
              <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <BazaarFooter />
    </div>
  );
}
