"use client";
import { useState } from "react";
import BazaarNav from "@/components/bazaar/BazaarNav";
import BazaarFooter from "@/components/bazaar/BazaarFooter";
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";
import { apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Please provide your name, email, and message.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiPost("/api/v1/bazaar/contact", {
        name,
        email,
        phone,
        subject,
        message,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit enquiry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BazaarNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {translate("bazaar.navContact") || "Contact & Support"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4">
            {translate("bazaar.contactHeading") || "Get in Touch with Event Team"}
          </h1>
          <p className="text-slate-400 mt-4 text-base">
            {translate("bazaar.contactSubtitle") || "Have questions about tickets, stall allocations, or custom sponsorship packages? Send us a message."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
              <Mail className="text-amber-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white text-sm">{translate("bazaar.enquiriesSupport") || "Email Enquiries"}</h3>
                <a href="mailto:enquiries@glotrade.online" className="text-xs text-slate-400 hover:text-amber-400">
                  enquiries@glotrade.online
                </a>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
              <Phone className="text-amber-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white text-sm">WhatsApp Line</h3>
                <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-amber-400">
                  +234 800 000 0000
                </a>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
              <MapPin className="text-amber-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-white text-sm">{translate("bazaar.eventInfo") || "Event Venue"}</h3>
                <p className="text-xs text-slate-400">{translate("bazaar.eventVenue") || "Harrow Park, Central Business District, Abuja"}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{translate("bazaar.sendMessageCta") || "Send Us a Message"}</h2>

            {success ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-center">
                <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-400" />
                <h3 className="text-lg font-bold text-white mb-1">{translate("bazaar.messageSentTitle") || "Message Sent!"}</h3>
                <p className="text-sm">{translate("bazaar.messageSentSuccess") || "Thank you! Your enquiry has been sent successfully."}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{translate("bazaar.yourNameLabel") || "Your Name *"}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Samuel Okon"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{translate("bazaar.emailAddressLabel") || "Email Address *"}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="samuel@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{translate("bazaar.phoneNumberLabel") || "Phone Number"}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{translate("bazaar.subjectLabel") || "Subject"}</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Stall Availability"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{translate("bazaar.messageLabel") || "Message *"}</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your inquiry here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} {translate("bazaar.submitMessage") || "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <BazaarFooter />
    </div>
  );
}
