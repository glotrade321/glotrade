"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Globe,
  Target,
  Heart,
  ShieldCheck,
  TrendingUp,
  Zap,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Package,
  RotateCcw,
  Clock,
} from "lucide-react";
import { translate } from "@/utils/translate";

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", icon: "text-blue-600 dark:text-blue-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", icon: "text-orange-600 dark:text-orange-400" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/30", icon: "text-amber-600 dark:text-amber-400" },
  green: { bg: "bg-green-100 dark:bg-green-900/30", icon: "text-green-600 dark:text-green-400" },
  rose: { bg: "bg-rose-100 dark:bg-rose-900/30", icon: "text-rose-600 dark:text-rose-400" },
  teal: { bg: "bg-teal-100 dark:bg-teal-900/30", icon: "text-teal-600 dark:text-teal-400" },
};

export default function AboutPage() {
  const stats = [
    { value: "36 States", labelKey: "about.stats.coverage",  icon: MapPin,      color: "blue" },
    { value: "100%",      labelKey: "about.stats.authentic", icon: ShieldCheck, color: "green" },
    { value: "7 Days",    labelKey: "about.stats.returns",   icon: RotateCcw,   color: "orange" },
    { value: "24/7",      labelKey: "about.stats.support",   icon: Clock,       color: "purple" },
  ];

  const values = [
    { icon: ShieldCheck, color: "green", titleKey: "about.value1Title", descKey: "about.value1Desc" },
    { icon: Globe, color: "blue", titleKey: "about.value2Title", descKey: "about.value2Desc" },
    { icon: Heart, color: "rose", titleKey: "about.value3Title", descKey: "about.value3Desc" },
    { icon: Zap, color: "amber", titleKey: "about.value4Title", descKey: "about.value4Desc" },
    { icon: Target, color: "purple", titleKey: "about.value5Title", descKey: "about.value5Desc" },
    { icon: TrendingUp, color: "teal", titleKey: "about.value6Title", descKey: "about.value6Desc" },
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
          <span className="text-gray-900 dark:text-white font-medium">{translate("about.breadcrumb")}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src="/glotrade_logo.png"
                alt="GloTrade Logo"
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {translate("about.title")}
                </h1>
                <span className="text-xs px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                  {translate("about.est")}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {translate("about.tagline")}
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {translate("about.intro")}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const c = colorMap[stat.color];
              const Icon = stat.icon;
              return (
                <div key={stat.labelKey} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{translate(stat.labelKey)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">

          {/* Our Story */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  {translate("about.storyBadge")}
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {translate("about.storyTitle")}
                </h2>
              </div>
            </div>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>{translate("about.story1")}</p>
              <p>{translate("about.story2")}</p>
              <p>{translate("about.story3")}</p>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-[#2EA5FF]/10 rounded-lg">
                  <Target className="w-5 h-5 text-[#2EA5FF]" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {translate("about.missionTitle")}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {translate("about.missionText")}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-[#F9A407]/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#F9A407]" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {translate("about.visionTitle")}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {translate("about.visionText")}
              </p>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                  {translate("about.valuesBadge")}
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {translate("about.valuesTitle")}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {values.map((val) => {
                const c = colorMap[val.color];
                const Icon = val.icon;
                return (
                  <div key={val.titleKey} className="flex gap-4">
                    <div className={`p-2.5 ${c.bg} rounded-lg h-fit shrink-0`}>
                      <Icon className={`w-4 h-4 ${c.icon}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {translate(val.titleKey)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {translate(val.descKey)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GDIP Highlight */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-[#F9A407]" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {translate("about.gdipBadge")}
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {translate("about.gdipTitle")}
                </h2>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              {translate("about.gdipDesc")}
            </p>
            <Link
              href="/gdip"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#2EA5FF] hover:underline"
            >
              {translate("about.gdipLink")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Company Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
              {translate("about.companyTitle")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {translate("about.companyLegalLabel")}
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{translate("about.companyLegalValue") || "GloTrade (glotrade.online)"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {translate("about.companyTechLabel")}
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{translate("about.companyTechValue") || "NEXGEN TECH INNOVATIONS LIMITED"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {translate("about.companyCountryLabel")}
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{translate("about.companyCountry")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {translate("about.companyIndustryLabel")}
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{translate("about.companyIndustry")}</p>
              </div>
            </div>

            <div className="pt-5 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                {translate("about.contactLabel")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <div>
                    <p>(+234) 902-900-4712</p>
                    <p>(+234) 704-460-0924</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  <p>Lagos &amp; Abuja, Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/marketplace"
              className="flex items-center justify-between p-5 bg-[#2EA5FF] hover:bg-[#2191e0] text-white rounded-xl transition-colors group"
            >
              <div>
                <p className="font-semibold">{translate("about.ctaShopTitle")}</p>
                <p className="text-sm text-blue-100">{translate("about.ctaShopDesc")}</p>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/support"
              className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl transition-colors group"
            >
              <div>
                <p className="font-semibold">{translate("about.ctaSupportTitle")}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{translate("about.ctaSupportDesc")}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
