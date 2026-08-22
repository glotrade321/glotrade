"use client";
import { useState } from "react";
import { X, CheckCircle2, CreditCard, ShieldCheck, Loader2, Building2, MessageSquare, Copy, Check } from "lucide-react";
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
  config?: any;
}

export default function BookingModal({ isOpen, onClose, pkg, config }: BookingModalProps) {
  const [paymentMode, setPaymentMode] = useState<"paystack" | "bank_transfer">("paystack");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [transferSubmitted, setTransferSubmitted] = useState<any>(null);

  if (!isOpen || !pkg) return null;

  const bankName = config?.bankName || "Moniepoint MFB";
  const bankAccountName = config?.bankAccountName || "GloTrade Ltd - Bazaar Account";
  const bankAccountNumber = config?.bankAccountNumber || "8012345678";
  const whatsappNumber = config?.whatsappNumber || "2347044600924";

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (paymentMode === "paystack") {
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
          window.location.href = res.data.authorizationUrl;
        } else if (res?.data?.free || pkg.price === 0) {
          window.location.href = `/bazaar/callback?reference=${res.data.reference}`;
        } else {
          setError(res?.message || "Failed to initialize Paystack payment. Please try again.");
          setLoading(false);
        }
      } else {
        // Manual Bank Transfer / WhatsApp
        const transferNotes = `[Manual Bank Transfer Enquiry] ${notes}`.trim();
        const res: any = await apiPost("/api/v1/bazaar/initialize-booking", {
          type: pkg.type,
          packageId: pkg.id,
          packageName: pkg.name,
          amount: pkg.price,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          businessName,
          notes: transferNotes,
          paymentMethod: "bank_transfer",
          isManualBankTransfer: true,
        });

        const bookingRef = res?.data?.booking?.reference || res?.data?.reference || "GTB-REF";
        const ticketCode = res?.data?.booking?.ticketCode || res?.data?.ticketCode || "";

        // Build WhatsApp pre-filled text
        const waMsg = `Hi GloTrade Bazaar Team, I have made a bank transfer of NGN ${pkg.price.toLocaleString("en-NG")} for my booking:
- Package: ${pkg.name}
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
${businessName ? `- Business: ${businessName}\n` : ""}- Ref: ${bookingRef}${ticketCode ? `\n- Ticket Code: ${ticketCode}` : ""}

Please verify my payment and send my ticket confirmation email.`;

        const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMsg)}`;

        setTransferSubmitted({
          bookingRef,
          ticketCode,
          waUrl,
        });
        setLoading(false);

        // Open WhatsApp in new tab
        window.open(waUrl, "_blank");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err?.message || "Booking submission failed. Please check network.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
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
            onClick={() => {
              setTransferSubmitted(null);
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {transferSubmitted ? (
          /* Success Screen for Manual Bank Transfer */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-bold text-white">Transfer Details Registered!</h3>

            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              We have logged your booking under reference <span className="text-amber-400 font-mono font-bold">{transferSubmitted.bookingRef}</span>.
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="font-bold text-white">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Payable:</span>
                <span className="font-bold text-amber-400">₦{pkg.price.toLocaleString("en-NG")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-amber-400 uppercase">Pending Bank Verification</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Once our team confirms your bank transfer on WhatsApp, your official ticket code and ticket pass will be emailed to <strong className="text-slate-200">{email}</strong>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={transferSubmitted.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageSquare size={16} /> Open WhatsApp Chat
              </a>
              <button
                onClick={() => {
                  setTransferSubmitted(null);
                  onClose();
                }}
                className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentMode("paystack")}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMode === "paystack"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <CreditCard size={15} /> Instant Card / Paystack
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("bank_transfer")}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMode === "bank_transfer"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Building2 size={15} /> Bank Transfer / WhatsApp
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
                  {paymentMode === "paystack" ? (
                    <>
                      <ShieldCheck size={13} /> {translate("bazaar.securedPaystack") || "Secured by Paystack"}
                    </>
                  ) : (
                    <>
                      <Building2 size={13} /> Direct Bank Transfer
                    </>
                  )}
                </span>
              </div>
            </div>

            {paymentMode === "bank_transfer" && (
              /* Bank Transfer Details Box */
              <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 mb-5 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Building2 size={14} /> Official GloTrade Bank Account
                  </span>
                  <span className="text-[10px] text-slate-400">Nigeria</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-bold text-white">{bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="font-bold text-white">{bankAccountName}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Account Number:</span>
                    <span className="font-mono text-base font-black text-amber-400">{bankAccountNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-[11px] flex items-center gap-1"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 italic pt-1">
                  Make your transfer for ₦{pkg.price.toLocaleString("en-NG")}, fill in your info below and submit to notify our admin team via WhatsApp for instant ticket issuance.
                </p>
              </div>
            )}

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
                      <Loader2 className="animate-spin" size={18} /> Processing...
                    </>
                  ) : paymentMode === "paystack" ? (
                    <>
                      <CreditCard size={18} /> {translate("bazaar.payViaPaystack", { amount: pkg.price.toLocaleString("en-NG") }) || `Pay ₦${pkg.price.toLocaleString("en-NG")} via Paystack`}
                    </>
                  ) : (
                    <>
                      <MessageSquare size={18} /> Submit & Verify Payment on WhatsApp
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="text-[11px] text-slate-500 text-center mt-4">
              {paymentMode === "paystack"
                ? translate("bazaar.paystackRedirectDisclaimer") || "By clicking pay, you will be securely redirected to Paystack to complete your payment."
                : "Your registration will be submitted to the admin team and verified via WhatsApp for email ticket issuance."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
