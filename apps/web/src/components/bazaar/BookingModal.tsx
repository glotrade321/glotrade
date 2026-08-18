"use client";
import { useState } from "react";
import { X, CheckCircle, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

export interface BookingPackage {
  id: string;
  name: string;
  price: number;
  type: "ticket" | "exhibitor" | "sponsorship";
  summary?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: BookingPackage | null;
}

export default function BookingModal({ isOpen, onClose, pkg }: BookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !pkg) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res: any = await apiPost("/api/v1/bazaar/initialize-booking", {
        type: pkg.type,
        packageId: pkg.id,
        packageName: pkg.name,
        amount: pkg.price,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        businessName,
        notes,
        returnUrl: `${window.location.origin}/bazaar/callback`,
      });

      if (res?.data?.authorizationUrl) {
        // Redirect to Paystack Checkout
        window.location.href = res.data.authorizationUrl;
      } else if (res?.data?.free || pkg.price === 0) {
        // Free ticket or inquiry
        window.location.href = `/bazaar/callback?reference=${res.data.reference}`;
      } else {
        setError(res?.message || "Failed to initialize Paystack payment. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err?.message || "Payment initialization failed. Please check network.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              {pkg.type === "ticket"
                ? translate("bazaar.modalTicketCheckout") || "Ticket Checkout"
                : pkg.type === "exhibitor"
                ? translate("bazaar.modalExhibitorApp") || "Exhibitor Stall Application"
                : translate("bazaar.modalSponsorshipReg") || "Sponsorship Registration"}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{pkg.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Package summary card */}
        <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{translate("bazaar.totalPayable") || "Total Payable Amount"}</p>
            <p className="text-2xl font-black text-amber-400">
              ₦{pkg.price.toLocaleString("en-NG")}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck size={13} /> {translate("bazaar.securedPaystack") || "Secured by Paystack"}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {translate("bazaar.yourNameLabel") || "Full Name *"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samuel Okon"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {translate("bazaar.emailAddressLabel") || "Email Address *"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {translate("bazaar.phoneNumberLabel") || "Phone Number *"}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          {(pkg.type === "exhibitor" || pkg.type === "sponsorship") && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {translate("bazaar.companyBusinessName") || "Company / Business Name"}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. AfriCrafts Ltd"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {translate("bazaar.specialRequestsNotes") || "Special Requests / Notes"}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes or requirements..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> {translate("bazaar.connectingPaystack") || "Connecting Paystack..."}
                </>
              ) : (
                <>
                  <CreditCard size={18} /> {translate("bazaar.payViaPaystack", { amount: pkg.price.toLocaleString("en-NG") }) || `Pay ₦${pkg.price.toLocaleString("en-NG")} via Paystack`}
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-4">
          {translate("bazaar.paystackRedirectDisclaimer") || "By clicking pay, you will be securely redirected to Paystack to complete your payment."}
        </p>
      </div>
    </div>
  );
}
