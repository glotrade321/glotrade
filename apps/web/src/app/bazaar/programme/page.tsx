"use client";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import { Clock, Sparkles, Music, Store, Users, Trophy } from "lucide-react";
import { translate } from "@/utils/translate";

export default function ProgrammePage() {
  const schedule = [
    {
      time: "9:00 PM",
      title: translate("bazaar.progItem1Title") || "Red Carpet & Guest Registration",
      desc: translate("bazaar.progItem1Desc") || "Welcome reception, badge tag issuance, and opening red carpet photography at Harrow Park.",
      icon: <Users className="text-amber-400" size={20} />,
    },
    {
      time: "9:30 PM",
      title: translate("bazaar.progItem2Title") || "Opening Ceremony & Marketplace Launch",
      desc: translate("bazaar.progItem2Desc") || "Official opening address by GloTrade Platform executives and commencement of trade exhibition.",
      icon: <Store className="text-amber-400" size={20} />,
    },
    {
      time: "10:30 PM",
      title: translate("bazaar.progItem3Title") || "Sponsor Spotlights & Live Stage Entertainment",
      desc: translate("bazaar.progItem3Desc") || "Live music performance, brand pitch showcases, and interactive audience raffle draw.",
      icon: <Music className="text-amber-400" size={20} />,
    },
    {
      time: "12:00 AM",
      title: translate("bazaar.progItem4Title") || "Late Night Trade & Executive Networking",
      desc: translate("bazaar.progItem4Desc") || "High-value executive lounge sessions, business matchmaking, and product discovery.",
      icon: <Trophy className="text-amber-400" size={20} />,
    },
    {
      time: "2:00 AM",
      title: translate("bazaar.progItem5Title") || "Closing DJ Set & Vote of Thanks",
      desc: translate("bazaar.progItem5Desc") || "Final music set, exhibitor awards recognition, and official wrap-up.",
      icon: <Sparkles className="text-amber-400" size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {translate("bazaar.eventSchedule") || "Event Schedule"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4">
            {translate("bazaar.progTimelineTitle") || "Programme Timeline"}
          </h1>
          <p className="text-slate-400 mt-4 text-base">
            {translate("bazaar.progDateVenueSubtitle") || "Saturday, 12 September 2026 at Harrow Park, Abuja."}
          </p>
        </div>

        <div className="relative border-l-2 border-amber-500/30 pl-6 sm:pl-8 space-y-12 ml-4 sm:ml-8">
          {schedule.map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                {item.icon}
              </div>

              <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-6 transition-all">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-3 border border-amber-500/20">
                  <Clock size={12} /> {item.time}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BazaarFooter />
    </div>
  );
}
