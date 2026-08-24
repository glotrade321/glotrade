"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowLeft, Ticket, Calendar } from "lucide-react";
import { translate } from "@/utils/translate";
import { apiGet } from "@/utils/api";

interface BazaarNavProps {
  eventTitle?: string;
  eventDateLabel?: string;
  isPortalActive?: boolean;
}

export default function BazaarNav({
  eventTitle = "GloTrade Bazaar Abuja 2026",
  eventDateLabel = "12 Sept 2026",
  isPortalActive: propIsPortalActive,
}: BazaarNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<boolean | null>(
    propIsPortalActive !== undefined ? propIsPortalActive : null
  );
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (propIsPortalActive !== undefined) {
      setActiveStatus(propIsPortalActive);
      return;
    }

    apiGet("/api/v1/bazaar/config")
      .then((res: any) => {
        const isActive = res?.data?.isPortalActive ?? res?.data?.data?.isPortalActive ?? true;
        setActiveStatus(isActive);
      })
      .catch(() => setActiveStatus(true));
  }, [propIsPortalActive]);

  // If portal is inactive and visitor is on a sub-page, redirect to main bazaar off-season waitlist page
  useEffect(() => {
    if (activeStatus === false && pathname && pathname !== "/bazaar") {
      router.replace("/bazaar");
    }
  }, [activeStatus, pathname, router]);

  const isPortalActive = activeStatus ?? true;

  const navLinks = [
    { href: "/bazaar", label: translate("bazaar.navHome") || "Home" },
    { href: "/bazaar/about", label: translate("bazaar.navAbout") || "About" },
    { href: "/bazaar/tickets", label: translate("bazaar.navTickets") || "Tickets" },
    { href: "/bazaar/exhibitors", label: translate("bazaar.navExhibitors") || "Exhibitors" },
    { href: "/bazaar/sponsorship", label: translate("bazaar.navSponsorship") || "Sponsorship" },
    { href: "/bazaar/programme", label: translate("bazaar.navProgramme") || "Programme" },
    { href: "/bazaar/venue", label: translate("bazaar.navVenue") || "Venue" },
    { href: "/bazaar/gallery", label: translate("bazaar.navGallery") || "Gallery" },
    { href: "/bazaar/contact", label: translate("bazaar.navContact") || "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 text-white">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-semibold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <Calendar size={13} /> {eventDateLabel} • Harrow Park, Abuja
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">{translate("bazaar.annualFestival") || "Annual Trade & Entertainment Festival"}</span>
        <Link
          href="/"
          className="ml-auto underline flex items-center gap-1 font-bold text-slate-900 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} /> {translate("bazaar.mainPlatformLink") || "Main GloTrade Platform"}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/bazaar" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              {/* <Ticket className="text-slate-950 font-bold" size={24} /> */}
              <img src="/bazaar_logo.jpg" alt="GloTrade Bazaar Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                GLOTRADE BAZAAR
              </span>
              <p className="text-[10px] uppercase tracking-widest text-amber-400/80 font-medium">
                Abuja 2026 Edition
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/bazaar"
                  ? pathname === "/bazaar"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Ticket CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            {isPortalActive ? (
              <Link
                href="/bazaar/tickets"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                {translate("bazaar.bookTicketsCta") || "Book Tickets"}
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-full bg-slate-800 text-amber-400/80 text-xs font-semibold border border-amber-500/20">
                {translate("bazaar.portalOffline") || "Off-Season"}
              </span>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-amber-500/20 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/bazaar"
                ? pathname === "/bazaar"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {isPortalActive && (
            <div className="pt-2">
              <Link
                href="/bazaar/tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20"
              >
                Book Tickets
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
