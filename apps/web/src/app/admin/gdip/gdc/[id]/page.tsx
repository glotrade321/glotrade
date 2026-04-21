"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/utils/api";

interface TPIA {
    _id: string;
    tpiaId: string;
    partnerName: string;
    currentValue: number;
    profitMode: string;
    status: string;
    purchasedAt: string;
}

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    status: string;
    startDate: string;
    endDate: string;
    actualProfitRate?: number;
    totalProfitGenerated?: number;
}

interface GDCDetails {
    _id: string;
    gdcId: string;
    gdcNumber: number;
    capacity: number;
    currentFill: number;
    isFull: boolean;
    status: string;
    totalCapital: number;
    cyclesCompleted: number;
    totalProfitGenerated: number;
    averageROI: number;
    primaryCommodity: string;
    formedAt?: string;
    tpias: TPIA[];
    activeCycle?: TradeCycle;
    cycleHistory?: TradeCycle[];
}

export default function GDCDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [gdc, setGdc] = useState<GDCDetails | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchGDCDetails(params.id as string);
        }
    }, [params.id]);

    const fetchGDCDetails = async (id: string) => {
        try {
            setLoading(true);
            // The API returns { gdc: {...}, tpias: [...], recentCycles: [...] }
            const response = await apiGet<{ success: boolean; data: any }>(`/api/v1/gdip/gdc/${id}`);

            if (response.success) {
                // Flatten the response for easier consumption
                const rawGdc = response.data.gdc;
                const flattenedGdc: GDCDetails = {
                    ...rawGdc,
                    tpias: response.data.tpias || [],
                    cycleHistory: response.data.recentCycles || []
                };
                setGdc(flattenedGdc);
            }
        } catch (err: any) {
            console.error("Error fetching GDC details:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "ready":
                return "bg-blue-100 text-blue-700";
            case "forming":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getFillPercentage = (current: number, capacity: number) => {
        return (current / capacity) * 100;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!gdc) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">GDC Not Found</h2>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Go Back
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to GDCs
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            GDC-{gdc.gdcNumber}
                            {/* <span className="block sm:inline text-gray-400 font-normal text-lg sm:text-2xl ml-0 sm:ml-3">#{gdc.gdcId}</span> */}
                        </h1>
                        <span className={`w-fit px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(gdc.status)}`}>
                            {gdc.status}
                        </span>
                    </div>
                </div>

                {/* Main Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Capacity Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Cluster Capacity</h3>
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 font-medium">Fill Status</span>
                                <span className="font-bold text-gray-900">{gdc.currentFill}/{gdc.capacity} Slots</span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${gdc.isFull ? "bg-green-500" : "bg-blue-500"}`}
                                    style={{ width: `${getFillPercentage(gdc.currentFill, gdc.capacity)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                            <span className="text-xs text-gray-500 font-bold uppercase">Total Capital</span>
                            <span className="text-lg font-black text-gray-900">{formatCurrency(gdc.totalCapital)}</span>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Performance Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Cycles Completed</span>
                                <span className="px-3 py-1 bg-gray-100 rounded-lg font-bold text-gray-900 text-sm">{gdc.cyclesCompleted}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Profit</span>
                                <span className="font-bold text-green-600">{formatCurrency(gdc.totalProfitGenerated)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Average ROI</span>
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg font-black text-sm">{gdc.averageROI.toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Cluster Details</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Deployment Category</span>
                                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                    {gdc.primaryCommodity || "Managed"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Formation Date</span>
                                <span className="font-bold text-gray-900 text-sm">{formatDate(gdc.formedAt)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Cycle Status</span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${gdc.activeCycle ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                    {gdc.activeCycle ? "TRADING" : "READY"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TPIAs List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-bold text-gray-900">Included TPIAs ({gdc.tpias?.length || 0})</h3>
                    </div>

                    {/* Desktop Table View */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TPIA ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Partner</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Profit Mode</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {gdc.tpias?.map((tpia) => (
                                        <tr key={tpia._id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{tpia.tpiaId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{tpia.partnerName || "Unknown"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-black text-gray-900">{formatCurrency(tpia.currentValue)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase ${tpia.profitMode === "TPM" ? "bg-indigo-50 text-indigo-700" : "bg-blue-50 text-blue-700"
                                                    }`}>
                                                    {tpia.profitMode === "TPM" ? "Compounding" : "Payout"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase ${tpia.status === "active" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                                                    }`}>
                                                    {tpia.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{formatDate(tpia.purchasedAt)}</td>
                                        </tr>
                                    ))}
                                    {(!gdc.tpias || gdc.tpias.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                                No TPIAs in this cluster yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {gdc.tpias?.map((tpia) => (
                            <div key={tpia._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TPIA Block</p>
                                        <p className="font-black text-gray-900">{tpia.tpiaId}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase ${tpia.status === "active" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                                        }`}>
                                        {tpia.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-3">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Current Value</p>
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(tpia.currentValue)}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Profit Mode</p>
                                        <p className="text-sm font-bold text-gray-900">{tpia.profitMode === "TPM" ? "Compound" : "Payout"}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center px-1">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Partner</p>
                                        <p className="text-xs font-bold text-gray-800">{tpia.partnerName || "Unknown"}</p>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Joined</p>
                                        <p className="text-xs font-bold text-gray-800">{formatDate(tpia.purchasedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
