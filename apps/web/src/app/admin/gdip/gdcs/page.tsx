"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/utils/api";
import { formatCurrency } from "@/utils/format";

interface GDC {
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
    nextCycleStartDate?: string;
}

export default function AdminGDCsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [gdcs, setGDCs] = useState<GDC[]>([]);
    const [filteredGDCs, setFilteredGDCs] = useState<GDC[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        fetchGDCs();
    }, []);

    useEffect(() => {
        filterGDCs();
    }, [statusFilter, gdcs]);

    const fetchGDCs = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: GDC[] }>("/api/v1/gdip/admin/gdcs");

            if (response.success) {
                setGDCs(response.data);
                setFilteredGDCs(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching GDCs:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterGDCs = () => {
        if (statusFilter === "all") {
            setFilteredGDCs(gdcs);
        } else {
            setFilteredGDCs(gdcs.filter((gdc) => gdc.status === statusFilter));
        }
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

    const getFillPercentage = (gdc: GDC) => {
        return (gdc.currentFill / gdc.capacity) * 100;
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

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">GDC Cluster Management</h1>
                        <p className="text-gray-500 font-medium">Monitor and manage Global Digital Clusters</p>
                    </div>
                </div>

                {/* Stats Summary */}
                {gdcs.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Clusters</p>
                            <p className="text-2xl sm:text-3xl font-black text-gray-900">{gdcs.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active</p>
                            <p className="text-2xl sm:text-3xl font-black text-green-500">
                                {gdcs.filter((g) => g.status === "active").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Slots</p>
                            <p className="text-2xl sm:text-3xl font-black text-blue-500">
                                {gdcs.filter((g) => g.isFull).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Average ROI</p>
                            <p className="text-2xl sm:text-3xl font-black text-indigo-500">
                                {(
                                    gdcs.reduce((sum, g) => sum + g.averageROI, 0) / gdcs.length || 0
                                ).toFixed(2)}
                                %
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 mb-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-tight whitespace-nowrap">Filter Status:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-all"
                            >
                                <option value="all">All GDCs</option>
                                <option value="forming">Forming</option>
                                <option value="ready">Ready</option>
                                <option value="active">Active</option>
                            </select>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            Showing {filteredGDCs.length} of {gdcs.length} clusters
                        </span>
                    </div>
                </div>

                {/* GDCs Grid */}
                {filteredGDCs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No GDCs Found</h3>
                        <p className="text-gray-600">No GDCs match your filter criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredGDCs.map((gdc) => (
                            <div
                                key={gdc._id}
                                onClick={() => router.push(`/admin/gdip/gdc/${gdc._id}`)}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden active:scale-[0.98] group"
                            >
                                <div className="p-5 sm:p-6 space-y-5">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">GDC-{gdc.gdcNumber}</h3>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(gdc.status)}`}>
                                            {gdc.status}
                                        </span>
                                    </div>

                                    {/* Component Tag */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-lg">🌾</div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Primary Commodity</p>
                                            <p className="text-sm font-bold text-gray-800">{gdc.primaryCommodity}</p>
                                        </div>
                                    </div>

                                    {/* Fill Progress */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cluster Capacity</p>
                                            <p className="text-xs font-black text-gray-900">{gdc.currentFill} <span className="text-gray-400 font-bold">/ {gdc.capacity}</span></p>
                                        </div>
                                        <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50 flex items-center">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${gdc.isFull ? "bg-green-500 shadow-sm shadow-green-100" : "bg-indigo-500 shadow-sm shadow-indigo-100"
                                                    }`}
                                                style={{ width: `${getFillPercentage(gdc)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Capital</p>
                                            <p className="text-sm font-black text-gray-900">{formatCurrency(gdc.totalCapital)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Average ROI</p>
                                            <p className="text-sm font-black text-indigo-600">{gdc.averageROI.toFixed(2)}%</p>
                                        </div>
                                    </div>

                                    {/* Performance Stats */}
                                    <div className="flex items-center justify-between px-1 text-sm font-bold">
                                        <div className="flex items-center gap-2 text-gray-400 uppercase text-[10px] tracking-tight">
                                            <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[10px]">🔄</span>
                                            {gdc.cyclesCompleted} Cycles Completed
                                        </div>
                                        <div className="text-green-600 text-[10px] uppercase font-black">
                                            +{formatCurrency(gdc.totalProfitGenerated)} Profit
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                        <span className="text-xs opacity-60">📅</span> {gdc.formedAt ? formatDate(gdc.formedAt) : "Pending"}
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                        Cluster Details
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
