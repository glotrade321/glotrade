"use client";
import Link from "next/link";
import { Ticket, MapPin, Calendar, Mail, Phone, ExternalLink } from "lucide-react";
import { translate } from "@/utils/translate";

export default function BazaarFooter() {
  return (
    <footer className="bg-slate-950 border-t border-amber-500/20 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/bazaar" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center shadow-md overflow-hidden">
                {/* <Ticket size={22} /> */}
                <img src="/bazaar_logo.jpg" alt="GloTrade Bazaar Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                GLOTRADE BAZAAR
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {translate("bazaar.footerDesc") || "The premier annual trade, networking, and cultural celebration in Abuja. Connecting innovative businesses, vendors, and vibrant attendees."}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold pt-2">
              <span>{translate("bazaar.presentedBy") || "Presented by"}</span>
              <a
                href="https://glotrade.online"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white flex items-center gap-1"
              >
                {translate("bazaar.mainPlatformLink") || "GloTrade Platform"} <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">
              {translate("bazaar.eventNav") || "Event Navigation"}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/bazaar/about" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navAbout") || "About the Event"}
                </Link>
              </li>
              <li>
                <Link href="/bazaar/tickets" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navTickets") || "Ticket Packages & Passes"}
                </Link>
              </li>
              <li>
                <Link href="/bazaar/exhibitors" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navExhibitors") || "Exhibitor Stall Booking"}
                </Link>
              </li>
              <li>
                <Link href="/bazaar/sponsorship" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navSponsorship") || "Sponsorship Packages"}
                </Link>
              </li>
              <li>
                <Link href="/bazaar/programme" className="hover:text-amber-400 transition-colors">
                  {translate("bazaar.navProgramme") || "Programme Timeline"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">
              {translate("bazaar.eventInfo") || "Event Information"}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Calendar size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{translate("bazaar.eventDate") || "12 September 2026"}</p>
                  <p className="text-xs text-slate-500">Starts 9:00 PM till late</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{translate("bazaar.eventVenue") || "Harrow Park, Abuja"}</p>
                  <p className="text-xs text-slate-500">Central Business District, FCT</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact & Enquiries */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-l-2 border-amber-500 pl-3">
              {translate("bazaar.enquiriesSupport") || "Enquiries & Support"}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-amber-400 shrink-0" />
                <a href="mailto:glotradebazaar@glotrade.online" className="hover:text-amber-400">
                  glotradebazaar@glotrade.online
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-amber-400 shrink-0" />
                <a href="https://wa.me/2347044600924" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                  +234 704 460 0924 (WhatsApp)
                </a>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                href="/bazaar/contact"
                className="inline-block text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-lg transition-colors"
              >
                {translate("bazaar.sendMessageCta") || "Send Us a Message"}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} GloTrade Platform. All rights reserved.</p>
          <p className="text-slate-400">
            Powered by <span className="text-amber-400 font-semibold">Paystack Gateway</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
