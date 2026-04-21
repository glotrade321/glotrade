"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FileText,
    Printer,
    ArrowLeft,
    Building2,
    MapPin,
    Globe,
    Mail,
    Phone,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    Wallet,
    Layers,
    Download,
    Sparkles,
    TrendingUp,
    Activity
} from "lucide-react";
import { apiGet } from "@/utils/api";
import { translate } from "@/utils/translate";

interface TPIADetails {
    tpia: any;
    gdc: any;
    insurance: any;
}

export default function PurchaseInvoicePage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<TPIADetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGet<any>(`/api/v1/gdip/tpia/${id}`);
                if (response.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Error fetching TPIA data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number, minimumFractionDigits = 0) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits,
            maximumFractionDigits: minimumFractionDigits,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">{translate("gdip.invoice.loading")}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">{translate("gdip.invoice.error.title")}</h1>
                    <p className="text-slate-500 mb-6">{translate("gdip.invoice.error.notFound")}</p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        {translate("gdip.invoice.error.goBack")}
                    </button>
                </div>
            </div>
        );
    }

    const { tpia } = data;
    const invoiceNumber = `INV-GDIP-${tpia.tpiaNumber.toString().padStart(6, '0')}`;
    const tpiaReference = `TPIA-${tpia.tpiaNumber}`;
    const gdcReference = `GDC-${tpia.gdcNumber}`;
    const purchaseDate = new Date(tpia.purchasedAt || tpia.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Action Bar - Hidden on Print */}
            <div className="max-w-4xl mx-auto px-4 pt-8 pb-4 flex flex-col sm:flex-row justify-between items-center gap-6 print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {translate("gdip.invoice.backToPortfolio")}
                </button>
                <button
                    onClick={handlePrint}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    {translate("gdip.invoice.downloadButton")}
                </button>
            </div>

            {/* Invoice Document */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden relative print:shadow-none print:rounded-none mb-12 border border-gray-100 sm:rounded-3xl">
                {/* Industrial Header Decor */}
                <div className="h-4 bg-gray-900 w-full"></div>

                <div className="p-8 sm:p-16">
                    {/* Logo & Document Type */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-12 mb-16">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                <Globe size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-2 uppercase">{translate("gdip.invoice.header.brand")}</h1>
                                <p className="text-[10px] font-black text-blue-600 tracking-[0.4em] uppercase">{translate("gdip.invoice.header.archiveLabel")}</p>
                            </div>
                        </div>

                        <div className="sm:text-right w-full sm:w-auto">
                            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter uppercase leading-none">{translate("gdip.invoice.header.title")}</h2>
                            <div className="flex flex-col sm:items-end gap-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">{translate("gdip.invoice.header.recordLabel")}</p>
                                <p className="text-lg font-black text-gray-900 leading-none tracking-tight select-all">{invoiceNumber}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        <div className="space-y-2">
                            <p className="flex items-center gap-2 text-gray-900 font-black"><MapPin size={12} className="text-blue-600" /> {translate("gdip.invoice.info.hqLabel")}</p>
                            <p>{translate("gdip.invoice.info.addressLine1")}</p>
                            <p>{translate("gdip.invoice.info.addressLine2")}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="flex items-center gap-2 text-gray-900 font-black"><Globe size={12} className="text-blue-600" /> {translate("gdip.invoice.info.nodeLabel")}</p>
                            <p>{translate("gdip.invoice.info.website")}</p>
                            <p>{gdcReference}</p>
                        </div>
                        <div className="md:text-right space-y-2">
                            <p className="flex items-center md:justify-end gap-2 text-gray-900 font-black"><Mail size={12} className="text-blue-600" /> {translate("gdip.invoice.info.commLabel")}</p>
                            <p>{translate("gdip.invoice.info.supportEmail")}</p>
                            <p>{translate("gdip.invoice.info.supportPhoneLagos")}</p>
                            <p>{translate("gdip.invoice.info.supportPhoneAbuja")}</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 mb-16"></div>

                    {/* Transactional Logic Context */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-16">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">{translate("gdip.invoice.partner.billedLabel")}</h3>
                            <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 group hover:bg-white transition-all duration-300">
                                <p className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tight">{tpia.partnerName}</p>
                                <p className="text-xs font-bold text-gray-400 mb-6">{tpia.partnerEmail}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    <ShieldCheck size={12} className="text-blue-600" />
                                    {translate("gdip.invoice.partner.verifiedStatus")}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center sm:items-end sm:text-right">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 leading-none">{translate("gdip.invoice.partner.dateLabel")}</p>
                                    <p className="text-xl font-black text-gray-900 leading-none tracking-tight">{formatDate(tpia.purchasedAt || tpia.createdAt)}</p>
                                </div>
                                <div className="flex flex-col sm:items-end">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 leading-none">{translate("gdip.invoice.partner.verificationLabel")}</p>
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                                        <CheckCircle2 size={12} /> {translate("gdip.invoice.partner.settlementStatus")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Itemized Ledger */}
                    <div className="mb-12">
                        {/* Desktop & Print Table View */}
                        <div className="hidden sm:block print:block w-full overflow-hidden border border-gray-100 rounded-3xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-900 text-white">
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em]">{translate("gdip.invoice.table.headers.description")}</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-center">{translate("gdip.invoice.table.headers.qty")}</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-right">{translate("gdip.invoice.table.headers.value")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr className="group hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-10">
                                            <div className="flex items-start gap-6">
                                                <div className="w-14 h-14 bg-white rounded-[1.25rem] border border-gray-100 flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:shadow-md group-hover:scale-110 group-hover:border-blue-100">
                                                    <Layers className="text-blue-600" size={28} />
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xl font-black text-gray-900 leading-none uppercase tracking-tight">{translate("gdip.invoice.table.item.name")}</p>
                                                        <p className="mt-1 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                            <ShieldCheck size={10} /> {translate("gdip.invoice.table.item.status")}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 pt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50">
                                                        <div className="flex justify-between sm:justify-start sm:gap-4">
                                                            <span>{translate("gdip.invoice.table.item.blockId")}</span>
                                                            <span className="text-gray-900 font-black">{tpiaReference}</span>
                                                        </div>
                                                        <div className="flex justify-between sm:justify-start sm:gap-4">
                                                            <span>{translate("gdip.invoice.table.item.nodeId")}</span>
                                                            <span className="text-gray-900 font-black">{gdcReference}</span>
                                                        </div>
                                                        <div className="sm:col-span-2 space-y-1 pt-1">
                                                            <p className="text-gray-300">{translate("gdip.invoice.table.item.configLabel")}</p>
                                                            <p className="text-gray-900 font-extrabold leading-relaxed">
                                                                {translate("gdip.invoice.table.item.deploymentBacking")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-10 text-center align-top">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 font-black text-sm">01</span>
                                                <span className="mt-2 text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">{translate("gdip.invoice.table.item.unit")}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-10 text-right align-top">
                                            <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(tpia.purchasePrice)}</p>
                                            <p className="mt-2 text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none">{translate("gdip.invoice.table.item.settledStatus")}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View */}
                        <div className="sm:hidden print:hidden space-y-4">
                            <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shrink-0">
                                        <Layers className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{translate("gdip.invoice.mobile.blockLabel")}</p>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-1">{translate("gdip.invoice.table.item.settledStatus")}</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex justify-between items-center py-3 border-y border-gray-200/50">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.invoice.mobile.valueLabel")}</p>
                                            <p className="text-xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(tpia.purchasePrice)}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{translate("gdip.invoice.mobile.qtyLabel")}</p>
                                            <p className="text-lg font-black text-gray-900 leading-none">01 <span className="text-[10px] text-gray-300">{translate("gdip.invoice.mobile.unitAbbr")}</span></p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">{translate("gdip.invoice.table.item.blockId")}</p>
                                            <p className="text-xs font-black text-gray-900">{tpiaReference}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">{translate("gdip.invoice.table.item.nodeId")}</p>
                                            <p className="text-xs font-black text-gray-900">{gdcReference}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 leading-none">{translate("gdip.invoice.table.item.configLabel")}</p>
                                        <p className="text-[11px] font-bold text-gray-900 leading-relaxed uppercase tracking-tight">
                                            {translate("gdip.invoice.table.item.deploymentBacking")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Economic Summary */}
                    <div className="flex justify-end mb-20">
                        <div className="w-full sm:w-80 space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <span>{translate("gdip.invoice.summary.subtotal")}</span>
                                <span className="text-gray-900 text-sm font-black">{formatCurrency(tpia.purchasePrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <span>{translate("gdip.invoice.summary.tax")}</span>
                                <span className="text-gray-900 text-sm font-black">{formatCurrency(0)}</span>
                            </div>
                            <div className="h-2 bg-gray-900/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-1/3"></div>
                            </div>
                            <div className="flex justify-between items-center py-4 border-t border-gray-100">
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.4em]">{translate("gdip.invoice.summary.total")}</span>
                                <span className="text-3xl font-black text-gray-900 tracking-tighter">{formatCurrency(tpia.purchasePrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Document Logic & Legal Footer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 p-10 bg-gray-900 text-white rounded-[2.5rem] print:rounded-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                            <ShieldCheck size={200} />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <h4 className="flex items-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">
                                <Wallet size={16} />
                                {translate("gdip.invoice.footer.title")}
                            </h4>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-tight leading-relaxed">
                                {translate("gdip.invoice.footer.text1")} <span className="text-white">{translate("gdip.invoice.footer.ledgerSystem")}</span>.
                                {translate("gdip.invoice.footer.text2")}
                            </p>
                            <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                <Activity size={12} className="animate-pulse" /> {translate("gdip.invoice.footer.verifiedLabel")}
                            </div>
                        </div>

                        <div className="sm:text-right space-y-1 relative z-10 flex flex-col justify-end">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2 leading-none">{translate("gdip.invoice.footer.idLabel")}</p>
                            <p className="text-xs font-mono text-gray-400 select-all tracking-tight uppercase">{tpia._id}</p>
                            <div className="flex items-center sm:justify-end gap-2 mt-8 text-white font-black text-[10px] uppercase tracking-[0.3em]">
                                <CheckCircle2 size={14} className="text-emerald-500" /> {translate("gdip.invoice.footer.officialLabel")}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.5em] leading-none">
                            {translate("gdip.invoice.footer.endOfRecord")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
