"use client";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import { Sparkles, Calendar, MapPin, Target, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { translate } from "@/utils/translate";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {translate("bazaar.navAbout") || "About GloTrade Bazaar"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4">
            {translate("bazaar.aboutHeading") || "About GloTrade Bazaar Abuja 2026"}
          </h1>
          <p className="text-slate-400 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
            {translate("bazaar.aboutSubtitle") || "Where commerce meets entertainment, networking, and cultural innovation in the heart of Nigeria's capital."}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-12 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Target size={22} /> {translate("bazaar.missionVision") || "Event Mission & Vision"}
            </h2>
            <p className="text-slate-300 leading-relaxed">
              {translate("bazaar.footerDesc") || "GloTrade Bazaar Abuja 2026 is designed to bridge the gap between digital trade and physical commerce. Organised by the GloTrade Platform, the event brings together manufacturers, retailers, logistics providers, and consumer brands under one vibrant roof at Harrow Park, Abuja."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <Users className="text-amber-400 mb-2" size={24} />
              <h3 className="font-bold text-white text-base">{translate("bazaar.expectedGuests") || "3,000+ Guests"}</h3>
              <p className="text-xs text-slate-400 mt-1">{translate("bazaar.expectedGuestsDesc") || "Expected business leaders, shoppers, and attendees."}</p>
            </div>
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <Calendar className="text-amber-400 mb-2" size={24} />
              <h3 className="font-bold text-white text-base">{translate("bazaar.eventDate") || "12 Sept 2026"}</h3>
              <p className="text-xs text-slate-400 mt-1">{translate("bazaar.festivalHoursDesc") || "Night festival starting 9:00 PM till late."}</p>
            </div>
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <MapPin className="text-amber-400 mb-2" size={24} />
              <h3 className="font-bold text-white text-base">{translate("bazaar.eventVenue") || "Harrow Park, Abuja"}</h3>
              <p className="text-xs text-slate-400 mt-1">{translate("bazaar.venueAddressDesc") || "Central Business District, Abuja, FCT."}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/bazaar/tickets"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-lg transition-all"
          >
            {translate("bazaar.bookTicketsCta") || "Book Tickets"} <ArrowRight size={18} />
          </Link>
        </div>
      </main>

      <BazaarFooter />
    </div>
  );
}
