"use client";

import Link from "next/link";
import {
  ChevronRight,
  Shield,
  Database,
  Eye,
  Globe,
  Lock,
  UserCheck,
  Cookie,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { translate } from "@/utils/translate";

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  blue:   { bg: "bg-blue-100 dark:bg-blue-900/30",   icon: "text-blue-600 dark:text-blue-400",   badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", icon: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" },
  green:  { bg: "bg-green-100 dark:bg-green-900/30",  icon: "text-green-600 dark:text-green-400",  badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" },
  amber:  { bg: "bg-amber-100 dark:bg-amber-900/30",  icon: "text-amber-600 dark:text-amber-400",  badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "information-we-collect",
      icon: Database,
      color: "blue",
      titleKey: "privacyPolicy.sec1Title",
      items: [
        { subtitleKey: "privacyPolicy.sec1Sub1", textKey: "privacyPolicy.sec1Txt1" },
        { subtitleKey: "privacyPolicy.sec1Sub2", textKey: "privacyPolicy.sec1Txt2" },
        { subtitleKey: "privacyPolicy.sec1Sub3", textKey: "privacyPolicy.sec1Txt3" },
      ],
    },
    {
      id: "how-we-use",
      icon: Eye,
      color: "purple",
      titleKey: "privacyPolicy.sec2Title",
      items: [
        { subtitleKey: "privacyPolicy.sec2Sub1", textKey: "privacyPolicy.sec2Txt1" },
        { subtitleKey: "privacyPolicy.sec2Sub2", textKey: "privacyPolicy.sec2Txt2" },
        { subtitleKey: "privacyPolicy.sec2Sub3", textKey: "privacyPolicy.sec2Txt3" },
        { subtitleKey: "privacyPolicy.sec2Sub4", textKey: "privacyPolicy.sec2Txt4" },
      ],
    },
    {
      id: "data-sharing",
      icon: Globe,
      color: "orange",
      titleKey: "privacyPolicy.sec3Title",
      items: [
        { subtitleKey: "privacyPolicy.sec3Sub1", textKey: "privacyPolicy.sec3Txt1" },
        { subtitleKey: "privacyPolicy.sec3Sub2", textKey: "privacyPolicy.sec3Txt2" },
        { subtitleKey: "privacyPolicy.sec3Sub3", textKey: "privacyPolicy.sec3Txt3" },
        { subtitleKey: "privacyPolicy.sec3Sub4", textKey: "privacyPolicy.sec3Txt4" },
      ],
    },
    {
      id: "data-security",
      icon: Lock,
      color: "green",
      titleKey: "privacyPolicy.sec4Title",
      items: [
        { subtitleKey: "privacyPolicy.sec4Sub1", textKey: "privacyPolicy.sec4Txt1" },
        { subtitleKey: "privacyPolicy.sec4Sub2", textKey: "privacyPolicy.sec4Txt2" },
        { subtitleKey: "privacyPolicy.sec4Sub3", textKey: "privacyPolicy.sec4Txt3" },
      ],
    },
    {
      id: "your-rights",
      icon: UserCheck,
      color: "indigo",
      titleKey: "privacyPolicy.sec5Title",
      items: [
        { subtitleKey: "privacyPolicy.sec5Sub1", textKey: "privacyPolicy.sec5Txt1" },
        { subtitleKey: "privacyPolicy.sec5Sub2", textKey: "privacyPolicy.sec5Txt2" },
        { subtitleKey: "privacyPolicy.sec5Sub3", textKey: "privacyPolicy.sec5Txt3" },
        { subtitleKey: "privacyPolicy.sec5Sub4", textKey: "privacyPolicy.sec5Txt4" },
      ],
    },
    {
      id: "cookies",
      icon: Cookie,
      color: "amber",
      titleKey: "privacyPolicy.sec6Title",
      items: [
        { subtitleKey: "privacyPolicy.sec6Sub1", textKey: "privacyPolicy.sec6Txt1" },
        { subtitleKey: "privacyPolicy.sec6Sub2", textKey: "privacyPolicy.sec6Txt2" },
        { subtitleKey: "privacyPolicy.sec6Sub3", textKey: "privacyPolicy.sec6Txt3" },
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
          <span className="text-gray-900 dark:text-white font-medium">{translate("privacyPolicy.breadcrumb")}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {translate("privacyPolicy.title")}
                </h1>
                <span className="text-xs px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full font-medium">
                  {translate("privacyPolicy.badge")}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {translate("privacyPolicy.lastUpdated")}
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {translate("privacyPolicy.intro")}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {translate("privacyPolicy.jumpTo")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-1.5 text-[#2EA5FF] hover:underline"
              >
                <span className="text-gray-400">{i + 1}.</span> {translate(s.titleKey)}
              </a>
            ))}
            <a href="#changes" className="flex items-center gap-1.5 text-[#2EA5FF] hover:underline">
              <span className="text-gray-400">7.</span> {translate("privacyPolicy.sec7Title")}
            </a>
            <a href="#contact" className="flex items-center gap-1.5 text-[#2EA5FF] hover:underline">
              <span className="text-gray-400">8.</span> {translate("privacyPolicy.sec8Title")}
            </a>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => {
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
                      0{index + 1}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {translate(section.titleKey)}
                    </h2>
                  </div>
                </div>
                <div className="space-y-4 pl-1">
                  {section.items.map((item, i) => (
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

          {/* Policy Changes */}
          <div
            id="changes"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 scroll-mt-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                07
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {translate("privacyPolicy.sec7Title")}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {translate("privacyPolicy.sec7Txt")}
            </p>
          </div>

          {/* Contact */}
          <div
            id="contact"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 scroll-mt-4"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                08
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {translate("privacyPolicy.sec8Title")}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              {translate("privacyPolicy.sec8Txt")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <a href="mailto:support@glotrade.online" className="hover:text-[#2EA5FF] transition-colors break-all">
                  support@glotrade.online
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>(+234) 902-900-4712</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>{translate("privacyPolicy.location")}</span>
              </div>
            </div>
            <div className="pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 text-sm">
              <Link href="/terms-of-service" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("privacyPolicy.termsOfService")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/refund-policy" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("privacyPolicy.refundPolicy")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/shipping-policy" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("privacyPolicy.shippingPolicy")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/support" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("privacyPolicy.helpCenter")} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
