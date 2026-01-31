"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { HelpCircle, Mail, MessageSquare, Phone, Search, Send, Clock, ShieldCheck, Truck, RotateCcw, CreditCard, User, ChevronRight } from "lucide-react";
import { translate } from "@/utils/translate";
import { apiPost } from "@/utils/api";

type Faq = { q: string; a: string; icon?: React.ReactNode; categoryKey: string };

const FAQS: Faq[] = [
  { q: "support.faqs.q1", a: "support.faqs.a1", icon: <Truck size={16} />, categoryKey: "orders" },
  { q: "support.faqs.q2", a: "support.faqs.a2", icon: <RotateCcw size={16} />, categoryKey: "returns" },
  { q: "support.faqs.q3", a: "support.faqs.a3", icon: <CreditCard size={16} />, categoryKey: "payments" },
  { q: "support.faqs.q4", a: "support.faqs.a4", icon: <ShieldCheck size={16} />, categoryKey: "account" },
];

const QUICK_LINKS = [
  { label: "support.categories.orders", icon: <Truck size={24} />, href: "/support#orders", color: "blue", key: "orders" },
  { label: "support.categories.returns", icon: <RotateCcw size={24} />, href: "/support#returns", color: "rose", key: "returns" },
  { label: "support.categories.payments", icon: <CreditCard size={24} />, href: "/support#payments", color: "emerald", key: "payments" },
  { label: "support.categories.account", icon: <User size={24} />, href: "/support#account", color: "purple", key: "account" },
];

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name: "", email: "", topic: "orders", message: "" });
  const [sent, setSent] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) =>
      translate(f.q).toLowerCase().includes(q) ||
      translate(f.a).toLowerCase().includes(q) ||
      translate(`support.categories.${f.categoryKey}`).toLowerCase().includes(q)
    );
  }, [query]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setSent(translate("support.contact.error"));
      setTimeout(() => setSent(null), 2200);
      return;
    }

    try {
      const data = await apiPost<any>(`/api/v1/support/inquiry`, form);

      if (data.status === 'success') {
        setSent(translate("support.contact.success"));
        setForm({ name: "", email: "", topic: form.topic, message: "" });
      } else {
        setSent(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Support form submission error:", error);
      setSent("An unexpected error occurred. Please try again.");
    } finally {
      setTimeout(() => setSent(null), 3200);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">{translate("support.breadcrumbHome")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-white font-medium">{translate("support.breadcrumbSupport")}</span>
        </nav>

        {/* Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                <HelpCircle size={18} />
                <span className="text-sm font-medium">{translate("support.heroLabel")}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{translate("support.title")}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{translate("support.subtitle")}</p>
            </div>
            <div className="w-full md:w-[420px]">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={translate("support.searchPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_LINKS.map((l) => (
              <Link key={l.key} href={l.href} className="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-500 transition-all group">
                <div className={`p-4 rounded-lg transition-colors ${l.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40' :
                  l.color === 'rose' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 group-hover:bg-rose-200 dark:group-hover:bg-rose-800/40' :
                    l.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40'
                  }`}>
                  {l.icon}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{translate(l.label)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: FAQs */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{translate("support.topQuestions")}</h2>
                </div>
                <div className="text-xs text-gray-500 inline-flex items-center gap-1">
                  <Clock size={14} /> {translate("support.updatedDaily")}
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map((f, idx) => {
                  const key = `t-${idx}`;
                  return (
                    <div key={`${f.q}-${idx}`} className="py-4 first:pt-0 last:pb-0">
                      <button
                        className="flex w-full items-start justify-between gap-4 text-left group"
                        onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                        aria-expanded={!!open[key]}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            {f.icon ?? <HelpCircle size={18} />}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{translate(f.q)}</span>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${open[key] ? 'rotate-90' : ''}`} />
                      </button>
                      {open[key] && (
                        <div className="mt-3 pl-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-in slide-in-from-top-2">
                          {translate(f.a)}
                        </div>
                      )}
                    </div>
                  );
                })}
                {results.length === 0 && (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {translate("support.noResults")}
                  </div>
                )}
              </div>
            </section>

            {/* Anchored categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: "orders", title: "support.categories.orders", icon: <Truck size={20} />, items: FAQS.filter(f => f.categoryKey === "orders"), color: "blue" },
                { id: "returns", title: "support.categories.returns", icon: <RotateCcw size={20} />, items: FAQS.filter(f => f.categoryKey === "returns"), color: "rose" },
                { id: "payments", title: "support.categories.payments", icon: <CreditCard size={20} />, items: FAQS.filter(f => f.categoryKey === "payments"), color: "emerald" },
                { id: "account", title: "support.categories.account", icon: <User size={20} />, items: FAQS.filter(f => f.categoryKey === "account"), color: "purple" },
              ].map((sec) => (
                <section key={sec.id} id={sec.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${sec.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      sec.color === 'rose' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                        sec.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      }`}>
                      {sec.icon}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{translate(sec.title)}</h3>
                  </div>
                  <div className="space-y-3">
                    {sec.items.map((f, i) => {
                      const key = `${sec.id}-${i}`;
                      return (
                        <div key={key} className="rounded-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                          <button
                            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                            onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                          >
                            {translate(f.q)}
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open[key] ? 'rotate-90' : ''}`} />
                          </button>
                          {open[key] && (
                            <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                              {translate(f.a)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {sec.items.length === 0 && (
                      <div className="text-sm text-gray-500 italic">{translate("support.noArticles")}</div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* Right: Contact */}
          <aside id="contact" className="h-max bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate("support.contact.title")}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{translate("support.contact.subtitle")}</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{translate("support.contact.labels.name")}</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder={translate("support.contact.placeholders.name")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{translate("support.contact.labels.email")}</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    placeholder={translate("support.contact.placeholders.email")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{translate("support.contact.labels.topic")}</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm((s) => ({ ...s, topic: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                >
                  {QUICK_LINKS.map((q) => (<option key={q.key} value={q.key}>{translate(q.label)}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{translate("support.contact.labels.message")}</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                  placeholder={translate("support.contact.placeholders.message")}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                />
              </div>

              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
                <Send size={16} /> {translate("support.contact.sendButton")}
              </button>

              {sent && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs text-center font-medium animate-in fade-in">
                  {sent}
                </div>
              )}
            </form>

            {/* Alt contact */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <Link href="mailto:support@glotrade.online" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 p-3 hover:bg-gray-50 hover:border-gray-300 transition-all dark:border-gray-700 dark:hover:bg-gray-800">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <Mail size={16} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{translate("support.contact.emailButton")}</span>
                </Link>
                <Link href="https://wa.me/2349029004712" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 p-3 hover:bg-gray-50 hover:border-gray-300 transition-all dark:border-gray-700 dark:hover:bg-gray-800">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                    <MessageSquare size={16} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{translate("support.contact.chatButton")}</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
