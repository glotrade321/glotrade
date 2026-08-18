"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import BookingModal, { BookingPackage } from "@/components/bazaar/BookingModal";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  Award,
  Users,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Send,
  Loader2,
} from "lucide-react";
import { apiGet, apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

export default function BazaarHome() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Inactive portal waitlist form states
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistMsg, setWaitlistMsg] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res: any = await apiGet("/api/v1/bazaar/config");
        if (res?.data) {
          setConfig(res.data);
        }
      } catch (err) {
        console.error("Error loading bazaar config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleOpenBooking = (pkg: BookingPackage) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistLoading(true);
    try {
      await apiPost("/api/v1/bazaar/contact", {
        name: waitlistName,
        email: waitlistEmail,
        subject: "Off-Season Waitlist Enquiry",
        message: waitlistMsg || "Enquiring about next GloTrade Bazaar season.",
      });
      setWaitlistSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setWaitlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-500 mx-auto mb-3" size={32} />
          <p className="text-sm text-slate-400">Loading GloTrade Bazaar Portal...</p>
        </div>
      </div>
    );
  }

  const isPortalActive = config?.isPortalActive ?? true;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <BazaarNav
        eventTitle={config?.eventTitle}
        eventDateLabel={config?.eventDateLabel}
        isPortalActive={isPortalActive}
      />

      {/* Check Seasonal Portal Status */}
      {!isPortalActive ? (
        /* INACTIVE / SEASONAL OFF-SEASON PAGE */
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
              {translate("bazaar.portalOffline") || "Season Status: Off-Season"}
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              {config?.eventTitle || translate("bazaar.title") || "GloTrade Bazaar"}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              {config?.inactiveMessage ||
                translate("bazaar.portalOfflineDesc") || "The GloTrade Bazaar event portal is currently offline between seasonal event editions. Stay tuned for our upcoming announcements!"}
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 max-w-lg mx-auto mb-8 text-left">
              <h3 className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                <Mail size={16} /> {translate("bazaar.getNotified") || "Get Notified for the Next Edition"}
              </h3>

              {waitlistSuccess ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm text-center">
                  <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-400" />
                  {translate("bazaar.messageSentSuccess") || "Thank you! We have logged your enquiry. We will reach out when the next season opens."}
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder={translate("auth.fullName") || "Your Full Name"}
                    value={waitlistName}
                    onChange={(e) => setWaitlistName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder={translate("auth.email") || "Your Email Address"}
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Optional message / enquiry..."
                    value={waitlistMsg}
                    onChange={(e) => setWaitlistMsg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    {waitlistLoading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <Send size={16} /> {translate("bazaar.submitEnquiry") || "Submit Enquiry / Join Notification List"}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              >
                {translate("bazaar.returnToMarketplace") || "Return to GloTrade E-Commerce Marketplace"} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </main>
      ) : (
        /* ACTIVE PORTAL CONTENT */
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg shadow-amber-500/5">
                <Sparkles size={14} /> {translate("bazaar.annualFestival") || "Annual Trade & Cultural Festival"}
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
                {translate("bazaar.heroTitle") || "Connect. Trade. Discover. Celebrate."}
              </h1>

              <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                {translate("bazaar.heroDesc") || "Join thousands of business leaders, exhibitors, and guests at Harrow Park, Abuja for the biggest commerce event of the year."}
              </p>

              {/* Event Badge Pill */}
              <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:px-8 mb-10 shadow-2xl">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <Calendar className="text-amber-400" size={18} />
                  <span>{config?.eventDateLabel || translate("bazaar.eventDate") || "12 September 2026"}</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-slate-800" />
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <Clock className="text-amber-400" size={18} />
                  <span>9:00 PM Gate Open</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-slate-800" />
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <MapPin className="text-amber-400" size={18} />
                  <span>{config?.eventVenue || translate("bazaar.eventVenue") || "Harrow Park, Abuja"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/bazaar/tickets"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
                >
                  {translate("bazaar.buyTickets") || "Book Event Tickets"}
                </Link>
                <Link
                  href="/bazaar/exhibitors"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-amber-500/40 hover:bg-slate-800 text-white font-bold text-base transition-all hover:scale-105"
                >
                  {translate("bazaar.bookStall") || "Apply for Exhibition Stall"}
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Package Highlights */}
          <section className="py-20 bg-slate-900/60 border-y border-amber-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {translate("bazaar.navTickets") || "Event Tickets & Passes"}
                </h2>
                <p className="text-slate-400 mt-2">
                  {translate("bazaar.ticketsSubtitle") || "Select your preferred entry tier and pay securely via Paystack."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Standard Ticket */}
                <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {translate("bazaar.singleGuest") || "General Entry"}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{translate("bazaar.standardTicket") || "Standard Ticket"}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-black text-amber-400">₦5,000</span>
                      <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.perGuest") || "guest"}</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Access to main exhibition area
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Live music & stage entertainment
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Network with business attendees
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenBooking({
                        id: "standard",
                        name: translate("bazaar.standardTicket") || "Standard Ticket",
                        price: 5000,
                        type: "ticket",
                      })
                    }
                    className="w-full py-3 rounded-xl bg-slate-900 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-sm transition-all"
                  >
                    {translate("bazaar.bookStandardCta") || "Buy Standard Pass"}
                  </button>
                </div>

                {/* VIP Pass */}
                <div className="bg-slate-950 border-2 border-amber-500 rounded-2xl p-8 flex flex-col justify-between relative shadow-xl shadow-amber-500/10 transform md:-translate-y-2">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                    {translate("bazaar.popularChoice") || "Most Popular"}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      VIP Access
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{translate("bazaar.vipPass") || "VIP Pass"}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-black text-amber-400">₦15,000</span>
                      <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.perGuest") || "guest"}</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Fast-track express entry
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        VIP lounge seating area
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Welcome drinks voucher
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Exclusive executive networking zone
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenBooking({
                        id: "vip",
                        name: translate("bazaar.vipPass") || "VIP Pass",
                        price: 15000,
                        type: "ticket",
                      })
                    }
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
                  >
                    {translate("bazaar.bookVipCta") || "Buy VIP Pass"}
                  </button>
                </div>

                {/* Reserved Table of 4 */}
                <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {translate("bazaar.reservedGroup") || "Group / Table Booking"}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{translate("bazaar.tableOf4") || "Table of 4"}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-black text-amber-400">₦50,000</span>
                      <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.per4Guests") || "4 guests"}</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-300 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Reserved table for 4 guests
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        Table refreshments package
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                        VIP lounge & networking access
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenBooking({
                        id: "table",
                        name: translate("bazaar.tableOf4") || "Table of 4",
                        price: 50000,
                        type: "ticket",
                      })
                    }
                    className="w-full py-3 rounded-xl bg-slate-900 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-sm transition-all"
                  >
                    {translate("bazaar.bookTableCta") || "Book Reserved Table"}
                  </button>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/bazaar/tickets"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm underline"
                >
                  View All Ticket & Exhibition Options <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Exhibitor Banner */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="space-y-4 max-w-2xl text-center lg:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {translate("bazaar.navExhibitors") || "Exhibitors & Vendors"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {translate("bazaar.exhibitorHeading") || "Showcase Your Brand at GloTrade Bazaar"}
                </h2>
                <p className="text-slate-300 text-base leading-relaxed">
                  {translate("bazaar.exhibitorSubtitle") || "Book a stall to exhibit your products and services directly to thousands of high-intent attendees and business buyers."}
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Link
                  href="/bazaar/exhibitors"
                  className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base text-center shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  {translate("bazaar.bookStallCta") || "View Stall Packages"}
                </Link>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Booking Checkout Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pkg={selectedPkg}
      />

      <BazaarFooter />
    </div>
  );
}
