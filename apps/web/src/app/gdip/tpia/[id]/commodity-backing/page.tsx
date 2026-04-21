"use client";

import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ShieldCheck } from "lucide-react";
import { translate } from "@/utils/translate";

export default function CommodityBackingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="mx-auto max-w-3xl">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {translate("gdip.commodity.back")}
                </button>

                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-100">
                        <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h1 className="mb-3 text-3xl font-black tracking-tight text-gray-900">
                        {translate("gdip.commodity.title")}
                    </h1>
                    <p className="text-sm font-semibold leading-relaxed text-gray-600">
                        {translate("gdip.commodity.subtitle")}
                    </p>

                    <div className="mt-8 rounded-2xl border border-emerald-100 bg-white p-5">
                        <div className="flex items-start gap-3">
                            <Activity className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <p className="text-sm font-bold leading-relaxed text-emerald-800">
                                {translate("gdip.commodity.managedNotice")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
