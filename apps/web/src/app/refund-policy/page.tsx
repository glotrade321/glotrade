"use client";

import Link from "next/link";
import {
  ChevronRight,
  RotateCcw,
  Clock,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ListOrdered,
  ArrowLeftRight,
  Mail,
  Phone,
} from "lucide-react";
import { translate } from "@/utils/translate";

const stepColors: Record<string, string> = {
  blue:   "bg-blue-600",
  purple: "bg-purple-600",
  orange: "bg-orange-500",
  teal:   "bg-teal-600",
  green:  "bg-green-600",
};

export default function RefundPolicyPage() {
  const eligibleKeys = [
    "refundPolicy.eligible1",
    "refundPolicy.eligible2",
    "refundPolicy.eligible3",
    "refundPolicy.eligible4",
    "refundPolicy.eligible5",
    "refundPolicy.eligible6",
  ];

  const notEligibleKeys = [
    "refundPolicy.notEligible1",
    "refundPolicy.notEligible2",
    "refundPolicy.notEligible3",
    "refundPolicy.notEligible4",
    "refundPolicy.notEligible5",
    "refundPolicy.notEligible6",
    "refundPolicy.notEligible7",
    "refundPolicy.notEligible8",
  ];

  const steps = [
    {
      num: "01",
      color: "blue",
      titleKey: "refundPolicy.step1Title",
      descKey: "refundPolicy.step1Desc",
    },
    {
      num: "02",
      color: "purple",
      titleKey: "refundPolicy.step2Title",
      descKey: "refundPolicy.step2Desc",
    },
    {
      num: "03",
      color: "orange",
      titleKey: "refundPolicy.step3Title",
      descKey: "refundPolicy.step3Desc",
    },
    {
      num: "04",
      color: "teal",
      titleKey: "refundPolicy.step4Title",
      descKey: "refundPolicy.step4Desc",
    },
    {
      num: "05",
      color: "green",
      titleKey: "refundPolicy.step5Title",
      descKey: "refundPolicy.step5Desc",
    },
  ];

  const tableRows = [
    { methodKey: "refundPolicy.method1", refundToKey: "refundPolicy.refundTo1", timelineKey: "refundPolicy.timeline1" },
    { methodKey: "refundPolicy.method2", refundToKey: "refundPolicy.refundTo2", timelineKey: "refundPolicy.timeline2" },
    { methodKey: "refundPolicy.method3", refundToKey: "refundPolicy.refundTo3", timelineKey: "refundPolicy.timeline3" },
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
          <span className="text-gray-900 dark:text-white font-medium">{translate("refundPolicy.breadcrumb")}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
              <RotateCcw className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {translate("refundPolicy.title")}
                </h1>
                <span className="text-xs px-2.5 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full font-medium">
                  {translate("refundPolicy.badge")}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {translate("refundPolicy.lastUpdated")}
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {translate("refundPolicy.intro")}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex justify-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{translate("refundPolicy.stat1Value")}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{translate("refundPolicy.stat1Label")}</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex justify-center mb-2">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{translate("refundPolicy.stat2Value")}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{translate("refundPolicy.stat2Label")}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
              <div className="flex justify-center mb-2">
                <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{translate("refundPolicy.stat3Value")}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">{translate("refundPolicy.stat3Label")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Eligible Reasons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">01</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("refundPolicy.sec1Title")}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eligibleKeys.map((itemKey, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{translate(itemKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Not Eligible */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">02</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("refundPolicy.sec2Title")}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notEligibleKeys.map((itemKey, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{translate(itemKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How to Request */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ListOrdered className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">03</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("refundPolicy.sec3Title")}</h2>
              </div>
            </div>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`${stepColors[step.color]} text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0`}>
                    {step.num}
                  </div>
                  <div className="flex-1 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5">{translate(step.titleKey)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{translate(step.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refund Methods Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">04</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("refundPolicy.sec4Title")}</h2>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("refundPolicy.thMethod")}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("refundPolicy.thRefundTo")}</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{translate("refundPolicy.thTimeline")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {tableRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{translate(row.methodKey)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{translate(row.refundToKey)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{translate(row.timelineKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              {translate("refundPolicy.tableNote")}
            </p>
          </div>

          {/* Return Shipping */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Truck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">05</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("refundPolicy.sec5Title")}</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p><strong className="text-gray-800 dark:text-gray-200">{translate("refundPolicy.sec5Txt1Label")}</strong> {translate("refundPolicy.sec5Txt1")}</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p><strong className="text-gray-800 dark:text-gray-200">{translate("refundPolicy.sec5Txt2Label")}</strong> {translate("refundPolicy.sec5Txt2")}</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p><strong className="text-gray-800 dark:text-gray-200">{translate("refundPolicy.sec5Txt3Label")}</strong> {translate("refundPolicy.sec5Txt3")}</p>
              </div>
            </div>
          </div>

          {/* Exchanges & Cancellations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <ArrowLeftRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">06</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{translate("refundPolicy.sec6Title")}</h2>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p className="text-gray-600 dark:text-gray-400"><strong className="text-gray-800 dark:text-gray-200">{translate("refundPolicy.sec6Txt1Label")}</strong> {translate("refundPolicy.sec6Txt1")}</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 shrink-0" />
                <p className="text-gray-600 dark:text-gray-400"><strong className="text-gray-800 dark:text-gray-200">{translate("refundPolicy.sec6Txt2Label")}</strong> {translate("refundPolicy.sec6Txt2")}</p>
              </div>
            </div>
          </div>

          {/* Seller Policies Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">{translate("refundPolicy.sellerWarningTitle")}</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                  {translate("refundPolicy.sellerWarningDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{translate("refundPolicy.helpTitle")}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{translate("refundPolicy.helpSubtitle")}</p>
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
              <Link href="/support" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("refundPolicy.helpCenter")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/terms-of-service" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("refundPolicy.termsOfService")} <ChevronRight className="w-3 h-3" />
              </Link>
              <Link href="/shipping-policy" className="text-[#2EA5FF] hover:underline flex items-center gap-1">
                {translate("refundPolicy.shippingPolicy")} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
