"use client";
import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import BookingModal, { BookingPackage } from "@/components/bazaar/BookingModal";
import { CheckCircle2, Ticket, ShieldCheck, ArrowRight } from "lucide-react";
import { translate } from "@/utils/translate";

export default function TicketsPage() {
  const [selectedPkg, setSelectedPkg] = useState<BookingPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const packages: BookingPackage[] = [
    {
      id: "standard",
      name: translate("bazaar.standardTicket") || "Standard Ticket",
      price: 5000,
      type: "ticket",
      summary: translate("bazaar.standardSummary") || "General entry ticket for 1 guest with access to marketplace & entertainment.",
    },
    {
      id: "vip",
      name: translate("bazaar.vipPass") || "VIP Pass",
      price: 15000,
      type: "ticket",
      summary: translate("bazaar.vipSummary") || "Priority entry, lounge seating access and complimentary welcome drinks.",
    },
    {
      id: "table",
      name: translate("bazaar.tableOf4") || "Table of 4",
      price: 50000,
      type: "ticket",
      summary: translate("bazaar.tableSummary") || "Reserved table for 4 guests with premium seating and refreshments.",
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
            {translate("bazaar.navTickets") || "Tickets & Passes"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4">
            {translate("bazaar.ticketsHeading") || "Book Your Event Pass"}
          </h1>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            {translate("bazaar.ticketsSubtitle") || "Choose your ticket tier. All passes include verified entrance, event access, and Paystack instant payment confirmation."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Standard Ticket */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {translate("bazaar.singleGuest") || "Single Guest"}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.standardTicket") || "Standard Ticket"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦5,000</span>
                <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.perGuest") || "guest"}</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[0].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featGenExhibition") || "General exhibition access"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featStageEntertainment") || "Stage music & entertainment"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featNetworkingLounge") || "Networking lounge access"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[0])}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              {translate("bazaar.bookStandardCta") || "Book Standard Ticket"}
            </button>
          </div>

          {/* VIP Pass */}
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
              {translate("bazaar.popularChoice") || "Popular Choice"}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                {translate("bazaar.vipAccessLabel") || "VIP Access"}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.vipPass") || "VIP Pass"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦15,000</span>
                <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.perGuest") || "guest"}</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[1].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featFastTrack") || "Fast-track entry gate"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featVipLounge") || "VIP Lounge seating area"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featWelcomeDrinks") || "Welcome drinks voucher"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featExecNetworking") || "Executive networking access"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[1])}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              {translate("bazaar.bookVipCta") || "Book VIP Pass"}
            </button>
          </div>

          {/* Reserved Table */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {translate("bazaar.reservedGroup") || "Reserved Group"}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {translate("bazaar.tableOf4") || "Table of 4"}
              </h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-black text-amber-400">₦50,000</span>
                <span className="text-xs text-slate-400 ml-1">/ {translate("bazaar.per4Guests") || "4 guests"}</span>
              </div>
              <p className="text-sm text-slate-300 mb-6">{packages[2].summary}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featReservedTable4") || "Reserved seating table for 4"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featRefreshments") || "Table refreshments package"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  {translate("bazaar.featNetworkingLounge") || "VIP lounge & networking access"}
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenModal(packages[2])}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              {translate("bazaar.bookTableCta") || "Book Reserved Table"}
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
