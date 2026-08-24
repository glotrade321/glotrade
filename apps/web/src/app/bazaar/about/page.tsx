"use client";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import Link from "next/link";
import { Sparkles, Calendar, MapPin, Target, Users, ShieldCheck, ArrowRight, Award, ShoppingBag } from "lucide-react";
import { translate } from "@/utils/translate";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Presenter Pill & Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Award size={14} className="text-amber-400" /> AL ABAMA GROUP PRESENTS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-2 max-w-4xl mx-auto leading-tight">
            GLOTRADE BAZAAR ABUJA – 2026
          </h1>
          <p className="text-amber-300 font-extrabold text-base sm:text-lg max-w-3xl mx-auto mt-3 uppercase tracking-wide">
            “Empowering Women and Youth Entrepreneurs Through Global Market Inclusion.”
          </p>
        </div>

        {/* About GLOTRADE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-12 space-y-6 shadow-2xl">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              About GLOTRADE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-4 mb-4">
              Bridging Global Market Gap for African MSMEs
            </h2>
            <div className="space-y-4 text-slate-300 text-base leading-relaxed">
              <p>
                <strong className="text-amber-400 font-bold">GLOTRADE Platform Limited</strong> is an African-focused trade and market development platform committed to bridging the gap between African producers, entrepreneurs, MSMEs, suppliers, buyers, and international markets.
              </p>
              <p>
                Under the vision of <span className="text-amber-300 font-semibold">“Bridging Global Market Gap for African MSMEs,”</span> Glotrade provides opportunities for businesses to showcase their products, establish commercial relationships, access new markets, and participate in local and international trade opportunities.
              </p>
              <p>
                <strong className="text-white font-bold">GLOTRADE BAZAAR ABUJA – 2026</strong> is designed as a major platform for promoting entrepreneurship, trade, innovation, investment, and economic inclusion, with particular emphasis on women-owned businesses and young entrepreneurs.
              </p>
            </div>
          </div>
        </div>

        {/* Our Vision & Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          {/* Our Vision */}
          <div className="md:col-span-7 bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/10">
                <Sparkles size={26} />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Our Vision
              </span>
              <h3 className="text-2xl font-black text-white mt-4 mb-4">
                Building an Inclusive African Marketplace
              </h3>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-medium">
                To build an inclusive African marketplace where women, youth, MSMEs, producers, and entrepreneurs can connect with opportunities beyond their immediate markets and participate meaningfully in regional and global trade.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-3">
              <ShieldCheck size={20} className="shrink-0 text-amber-400" />
              <span>GLOTRADE Platform Limited — Empowering African Producers</span>
            </div>
          </div>

          {/* Quick Info Stats */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start gap-4 flex-1">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">3,000+ Attendees</h4>
                <p className="text-xs text-slate-400 mt-1">Connecting MSMEs, investors, vendors, and vibrant guests.</p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start gap-4 flex-1">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                <Calendar size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">12 September 2026</h4>
                <p className="text-xs text-slate-400 mt-1">Starting 9:00 AM - 12:00 AM at Harrow Park, Abuja.</p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start gap-4 flex-1">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Harrow Park, Abuja</h4>
                <p className="text-xs text-slate-400 mt-1">Central Business District, FCT, Nigeria.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Message & 4 Pillars */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-16 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
            Our Message
          </span>
          <h2 className="text-3xl font-black text-white mt-4 mb-8">
            Core Value Pillars
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Empower the Entrepreneur</h3>
              <p className="text-xs text-slate-400">Supporting women-owned & youth-led businesses.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <ShoppingBag size={20} />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Connect the Market</h3>
              <p className="text-xs text-slate-400">Linking local suppliers with regional & global buyers.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Promote African Products</h3>
              <p className="text-xs text-slate-400">Showcasing high-quality African commodities & goods.</p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Create Global Opportunities</h3>
              <p className="text-xs text-slate-400">Enabling cross-border trade & commercial growth.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/bazaar/tickets"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-lg transition-all"
          >
            {translate("bazaar.bookTicketsCta") || "Book Event Tickets"} <ArrowRight size={18} />
          </Link>
        </div>
      </main>

      <BazaarFooter />
    </div>
  );
}
