"use client";

import Link from "next/link";
import {
  ChevronRight,
  Truck,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Globe,
} from "lucide-react";
import { translate } from "@/utils/translate";

export default function ShippingPolicyPage() {
  const domesticZones = [
    { zoneKey: "shippingPolicy.dom1Zone", timeKey: "shippingPolicy.dom1Time", costKey: "shippingPolicy.dom1Cost" },
    { zoneKey: "shippingPolicy.dom2Zone", timeKey: "shippingPolicy.dom2Time", costKey: "shippingPolicy.dom2Cost" },
    { zoneKey: "shippingPolicy.dom3Zone", timeKey: "shippingPolicy.dom3Time", costKey: "shippingPolicy.dom3Cost" },
    { zoneKey: "shippingPolicy.dom4Zone", timeKey: "shippingPolicy.dom4Time", costKey: "shippingPolicy.dom4Cost" },
    { zoneKey: "shippingPolicy.dom5Zone", timeKey: "shippingPolicy.dom5Time", costKey: "shippingPolicy.dom5Cost" },
    { zoneKey: "shippingPolicy.dom6Zone", timeKey: "shippingPolicy.dom6Time", costKey: "shippingPolicy.dom6Cost" },
    { zoneKey: "shippingPolicy.dom7Zone", timeKey: "shippingPolicy.dom7Time", costKey: "shippingPolicy.dom7Cost" },
  ];

  const internationalZones = [
    { zoneKey: "shippingPolicy.int1Zone", timeKey: "shippingPolicy.int1Time", costKey: "shippingPolicy.int1Cost" },
    { zoneKey: "shippingPolicy.int2Zone", timeKey: "shippingPolicy.int2Time", costKey: "shippingPolicy.int2Cost" },
    { zoneKey: "shippingPolicy.int3Zone", timeKey: "shippingPolicy.int3Time", costKey: "shippingPolicy.int3Cost" },
    { zoneKey: "shippingPolicy.int4Zone", timeKey: "shippingPolicy.int4Time", costKey: "shippingPolicy.int4Cost" },
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
          <span className="text-gray-900 dark:text-white font-medium">{translate("shippingPolicy.breadcrumb")}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg shrink-0">
              <Truck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {translate("shippingPolicy.title")}
                </h1>
                <span className="text-xs px-2.5 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full font-medium">
                  {translate("shippingPolicy.badge")}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {translate("shippingPolicy.lastUpdated")}
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {translate("shippingPolicy.intro")}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
              <div className="flex justify-center mb-2">
                <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-xl font-bold text-teal-700 dark:text-teal-300">{translate("shippingPolicy.stat1Value")}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">{translate("shippingPolicy.stat1Label")}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex justify-center mb-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{translate("shippingPolicy.stat2Value")}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{translate("shippingPolicy.stat2Label")}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
              <div className="flex justify-center mb-2">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{translate("shippingPolicy.stat3Value")}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">{translate("shippingPolicy.stat3Label")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">

          {/* Order Processing */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">01</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("shippingPolicy.sec1Title")}</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p>{translate("shippingPolicy.sec1Txt1")}</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p>{translate("shippingPolicy.sec1Txt2")}</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p>{translate("shippingPolicy.sec1Txt3")}</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p>{translate("shippingPolicy.sec1Txt4")}</p>
              </div>
            </div>
          </div>

          {/* Domestic Shipping */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">02</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("shippingPolicy.sec2Title")}</h2>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("shippingPolicy.thZone")}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("shippingPolicy.thTime")}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("shippingPolicy.thFee")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {domesticZones.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{translate(row.zoneKey)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{translate(row.timeKey)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{translate(row.costKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              {translate("shippingPolicy.domNote")}
            </p>
          </div>

          {/* International Shipping */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">03</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("shippingPolicy.sec3Title")}</h2>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {translate("shippingPolicy.sec3Intro")}
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("shippingPolicy.thRegion")}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("shippingPolicy.thTime")}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("shippingPolicy.thFee")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {internationalZones.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{translate(row.zoneKey)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{translate(row.timeKey)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{translate(row.costKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {translate("shippingPolicy.customsWarning")}
              </p>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">04</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("shippingPolicy.sec4Title")}</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p>{translate("shippingPolicy.track1")}</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p>{translate("shippingPolicy.track2")}</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p>{translate("shippingPolicy.track3")}</p>
              </div>
            </div>
          </div>

          {/* Failed & Lost Deliveries */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">05</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("shippingPolicy.sec5Title")}</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p><strong className="text-gray-800 dark:text-gray-200">{translate("shippingPolicy.sec5Txt1Label")}</strong> {translate("shippingPolicy.sec5Txt1")}</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p><strong className="text-gray-800 dark:text-gray-200">{translate("shippingPolicy.sec5Txt2Label")}</strong> {translate("shippingPolicy.sec5Txt2")}</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p><strong className="text-gray-800 dark:text-gray-200">{translate("shippingPolicy.sec5Txt3Label")}</strong> {translate("shippingPolicy.sec5Txt3")}</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{translate("shippingPolicy.helpTitle")}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              {translate("shippingPolicy.helpSubtitle")}
            </p>
            <div className="flex flex-wrap gap-6 mb-6">
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
            </div>
            <div className="pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 text-sm">
              <Link href="/refund-policy" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("shippingPolicy.refundPolicy")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/support" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("shippingPolicy.helpCenter")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/orders" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("shippingPolicy.trackMyOrder")} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
