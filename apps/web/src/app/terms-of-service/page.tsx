"use client";

import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Building2,
  Users,
  ShoppingBag,
  Package,
  CreditCard,
  AlertTriangle,
  Copyright,
  Scale,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
} from "lucide-react";
import { translate } from "@/utils/translate";

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", icon: "text-blue-600 dark:text-blue-400", badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  green: { bg: "bg-green-100 dark:bg-green-900/30", icon: "text-green-600 dark:text-green-400", badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", icon: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" },
  teal: { bg: "bg-teal-100 dark:bg-teal-900/30", icon: "text-teal-600 dark:text-teal-400", badge: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", icon: "text-red-600 dark:text-red-400", badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
  gray: { bg: "bg-gray-100 dark:bg-gray-700", icon: "text-gray-600 dark:text-gray-400", badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" },
  rose: { bg: "bg-rose-100 dark:bg-rose-900/30", icon: "text-rose-600 dark:text-rose-400", badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300" },
  slate: { bg: "bg-slate-100 dark:bg-slate-700", icon: "text-slate-600 dark:text-slate-400", badge: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300" },
};

export default function TermsOfServicePage() {
  const sections = [
    {
      id: "about",
      icon: Building2,
      color: "blue",
      num: "01",
      titleKey: "termsOfService.sec1Title",
      content: [
        { subtitleKey: "termsOfService.sec1Sub1", textKey: "termsOfService.sec1Txt1" },
        { subtitleKey: "termsOfService.sec1Sub2", textKey: "termsOfService.sec1Txt2" },
      ],
    },
    {
      id: "eligibility",
      icon: Users,
      color: "green",
      num: "02",
      titleKey: "termsOfService.sec2Title",
      content: [
        { subtitleKey: "termsOfService.sec2Sub1", textKey: "termsOfService.sec2Txt1" },
        { subtitleKey: "termsOfService.sec2Sub2", textKey: "termsOfService.sec2Txt2" },
        { subtitleKey: "termsOfService.sec2Sub3", textKey: "termsOfService.sec2Txt3" },
      ],
    },
    {
      id: "buying",
      icon: ShoppingBag,
      color: "purple",
      num: "03",
      titleKey: "termsOfService.sec3Title",
      content: [
        { subtitleKey: "termsOfService.sec3Sub1", textKey: "termsOfService.sec3Txt1" },
        { subtitleKey: "termsOfService.sec3Sub2", textKey: "termsOfService.sec3Txt2" },
        { subtitleKey: "termsOfService.sec3Sub3", textKey: "termsOfService.sec3Txt3" },
      ],
    },
    {
      id: "products",
      icon: Package,
      color: "orange",
      num: "04",
      titleKey: "termsOfService.sec4Title",
      content: [
        { subtitleKey: "termsOfService.sec4Sub1", textKey: "termsOfService.sec4Txt1" },
        { subtitleKey: "termsOfService.sec4Sub2", textKey: "termsOfService.sec4Txt2" },
        { subtitleKey: "termsOfService.sec4Sub3", textKey: "termsOfService.sec4Txt3" },
        { subtitleKey: "termsOfService.sec4Sub4", textKey: "termsOfService.sec4Txt4" },
      ],
    },
    {
      id: "payments",
      icon: CreditCard,
      color: "teal",
      num: "05",
      titleKey: "termsOfService.sec5Title",
      content: [
        { subtitleKey: "termsOfService.sec5Sub1", textKey: "termsOfService.sec5Txt1" },
        { subtitleKey: "termsOfService.sec5Sub2", textKey: "termsOfService.sec5Txt2" },
        { subtitleKey: "termsOfService.sec5Sub3", textKey: "termsOfService.sec5Txt3" },
      ],
    },
    {
      id: "prohibited",
      icon: AlertTriangle,
      color: "red",
      num: "06",
      titleKey: "termsOfService.sec6Title",
      isList: true,
      listKeyPrefixes: [
        "termsOfService.prohibited1",
        "termsOfService.prohibited2",
        "termsOfService.prohibited3",
        "termsOfService.prohibited4",
        "termsOfService.prohibited5",
        "termsOfService.prohibited6",
        "termsOfService.prohibited7",
        "termsOfService.prohibited8",
      ],
      content: [
        { subtitleKey: "termsOfService.sec6Sub1", textKey: "termsOfService.sec6Txt1" },
      ],
    },
    {
      id: "ip",
      icon: Copyright,
      color: "gray",
      num: "07",
      titleKey: "termsOfService.sec7Title",
      content: [
        { subtitleKey: "termsOfService.sec7Sub1", textKey: "termsOfService.sec7Txt1" },
        { subtitleKey: "termsOfService.sec7Sub2", textKey: "termsOfService.sec7Txt2" },
      ],
    },
    {
      id: "liability",
      icon: Scale,
      color: "indigo",
      num: "08",
      titleKey: "termsOfService.sec8Title",
      content: [
        { subtitleKey: "termsOfService.sec8Sub1", textKey: "termsOfService.sec8Txt1" },
        { subtitleKey: "termsOfService.sec8Sub2", textKey: "termsOfService.sec8Txt2" },
        { subtitleKey: "termsOfService.sec8Sub3", textKey: "termsOfService.sec8Txt3" },
      ],
    },
    {
      id: "disputes",
      icon: XCircle,
      color: "rose",
      num: "09",
      titleKey: "termsOfService.sec9Title",
      content: [
        { subtitleKey: "termsOfService.sec9Sub1", textKey: "termsOfService.sec9Txt1" },
        { subtitleKey: "termsOfService.sec9Sub2", textKey: "termsOfService.sec9Txt2" },
      ],
    },
    {
      id: "termination",
      icon: RefreshCw,
      color: "slate",
      num: "10",
      titleKey: "termsOfService.sec10Title",
      content: [
        { subtitleKey: "termsOfService.sec10Sub1", textKey: "termsOfService.sec10Txt1" },
        { subtitleKey: "termsOfService.sec10Sub2", textKey: "termsOfService.sec10Txt2" },
        { subtitleKey: "termsOfService.sec10Sub3", textKey: "termsOfService.sec10Txt3" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            {translate("support.breadcrumbHome")}
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-white font-medium">{translate("termsOfService.breadcrumb")}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
              <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {translate("termsOfService.title")}
                </h1>
                <span className="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                  {translate("termsOfService.badge")}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {translate("termsOfService.lastUpdated")}
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {translate("termsOfService.intro")}
              </p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="mt-5 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>{translate("termsOfService.warningTitle")}</strong> {translate("termsOfService.warningText")}
            </p>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {translate("termsOfService.jumpTo")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-1.5 text-[#2EA5FF] hover:underline"
              >
                <span className="text-gray-400">{s.num}.</span> {translate(s.titleKey)}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const c = colorMap[section.color];
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 scroll-mt-4"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 ${c.bg} rounded-lg shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                      {section.num}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {translate(section.titleKey)}
                    </h2>
                  </div>
                </div>

                {"isList" in section && section.isList && "listKeyPrefixes" in section && (
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                    {(section.listKeyPrefixes as string[]).map((keyPrefix, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <span>{translate(keyPrefix)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pl-1">
                  {section.content.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                          {translate(item.subtitleKey)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {translate(item.textKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {translate("termsOfService.contactTitle")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              {translate("termsOfService.contactTxt")}
            </p>
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <a href="mailto:support@glotrade.online" className="hover:text-[#2EA5FF] transition-colors">
                  support@glotrade.online
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>(+234) 902-900-4712</span>
              </div>
            </div>
            <div className="pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 text-sm">
              <Link href="/privacy-policy" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("termsOfService.privacyPolicy")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/refund-policy" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("termsOfService.refundPolicy")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/shipping-policy" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("termsOfService.shippingPolicy")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/support" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("termsOfService.helpCenter")} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
