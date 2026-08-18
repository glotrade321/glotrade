"use client";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import { MapPin, Navigation, Car, Shield, Info, ExternalLink } from "lucide-react";
import { translate } from "@/utils/translate";

export default function VenuePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {translate("bazaar.eventLocation") || "Event Location"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4">
            {translate("bazaar.eventVenue") || "Harrow Park, Abuja"}
          </h1>
          <p className="text-slate-400 mt-4 text-base max-w-2xl mx-auto">
            {translate("bazaar.venueAddressFull") || "Off Ahmadu Bello Way, Central Business District, Abuja, FCT, Nigeria."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
              <Navigation size={22} /> {translate("bazaar.venueDetailsDirections") || "Venue Details & Directions"}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {translate("bazaar.venueDescription") || "Harrow Park is one of Abuja's most iconic and accessible outdoor event spaces, offering expansive lawns, ample secure parking, and premium hospitality infrastructure."}
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <Car className="text-amber-400 shrink-0 mt-1" size={18} />
                <div>
                  <h3 className="font-bold text-white text-sm">{translate("bazaar.parkingDropoff") || "Parking & Drop-off"}</h3>
                  <p className="text-xs text-slate-400">{translate("bazaar.parkingDesc") || "Designated secure parking lot with traffic wardens on duty."}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="text-amber-400 shrink-0 mt-1" size={18} />
                <div>
                  <h3 className="font-bold text-white text-sm">{translate("bazaar.securityAccess") || "Security & Access"}</h3>
                  <p className="text-xs text-slate-400">{translate("bazaar.securityDesc") || "24/7 uniformed security officers and ticket barcode scanners at gates."}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="https://maps.google.com/?q=Harrow+Park+Abuja"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
              >
                {translate("bazaar.openGoogleMaps") || "Open Google Maps"} <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden min-h-[350px] relative flex flex-col items-center justify-center p-8 text-center">
            <MapPin size={48} className="text-amber-400 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">{translate("bazaar.eventVenue") || "Harrow Park Abuja"}</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              {translate("bazaar.venueStreet") || "Plot 2062 Ahmadu Bello Way, Central Business District, Abuja"}
            </p>
            <span className="text-xs text-amber-400 font-semibold px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
              {translate("bazaar.eventDate") || "12 September 2026"} • 9:00 PM
            </span>
          </div>
        </div>
      </main>

      <BazaarFooter />
    </div>
  );
}
