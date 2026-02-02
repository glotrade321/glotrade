"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/utils/api";
import { formatCurrency } from "@/utils/format";

interface TradeCycle {
    _id: string;
    cycleId: string;
    cycleNumber: number;
    gdcNumber: number;
    tpiaCount: number;
    startDate: string;
    endDate: string;
    status: string;
    totalCapital: number;
    targetProfitRate: number;
    actualProfitRate: number;
    totalProfitGenerated: number;
    profitDistributed: boolean;
    performanceRating?: string;
}

export default function AdminCyclesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [cycles, setCycles] = useState<TradeCycle[]>([]);
    const [filteredCycles, setFilteredCycles] = useState<TradeCycle[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [processingCycle, setProcessingCycle] = useState<string | null>(null);

    useEffect(() => {
        fetchCycles();
    }, []);

    useEffect(() => {
        filterCycles();
    }, [statusFilter, cycles]);

    const fetchCycles = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: TradeCycle[] }>("/api/v1/gdip/admin/cycles");

            if (response.success) {
                setCycles(response.data);
                setFilteredCycles(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching cycles:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterCycles = () => {
        if (statusFilter === "all") {
            setFilteredCycles(cycles);
        } else {
            setFilteredCycles(cycles.filter((cycle) => cycle.status === statusFilter));
        }
    };

    const handleCompleteCycle = async (cycleId: string) => {
        const salePrice = prompt("Enter sale price (₦):");
        if (!salePrice) return;

        const tradingCosts = prompt("Enter trading costs (₦, optional):");

        try {
            setProcessingCycle(cycleId);
            await apiPost(
                `/api/v1/gdip/admin/cycle/${cycleId}/complete`,
                {
                    salePrice: parseFloat(salePrice),
                    tradingCosts: tradingCosts ? parseFloat(tradingCosts) : 0,
                }
            );

            alert("Cycle completed successfully!");
            fetchCycles();
        } catch (err: any) {
            console.error("Error completing cycle:", err);
            alert(err.message || "Failed to complete cycle");
        } finally {
            setProcessingCycle(null);
        }
    };

    const handleDistributeProfits = async (cycleId: string) => {
        if (!confirm("Are you sure you want to distribute profits for this cycle?")) return;

        try {
            setProcessingCycle(cycleId);
            await apiPost(
                `/api/v1/gdip/admin/cycle/${cycleId}/distribute`
            );

            alert("Profits distributed successfully!");
            fetchCycles();
        } catch (err: any) {
            console.error("Error distributing profits:", err);
            alert(err.message || "Failed to distribute profits");
        } finally {
            setProcessingCycle(null);
        }
    };


    const formatDate = (dateString: string) => {
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
            case "completed":
                return "bg-blue-100 text-blue-700";
            case "scheduled":
                return "bg-yellow-100 text-yellow-700";
            case "processing":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
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
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Trade Cycle Management</h1>
                            <p className="text-gray-500 font-medium">Monitor and control all 37-day trade cycles</p>
                        </div>
                        <button
                            onClick={() => router.push("/admin/gdip/cycles/create")}
                            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm sm:text-base whitespace-nowrap flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span className="text-xl">+</span>
                            <span>Create New Cycle</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {cycles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-10">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl sm:text-3xl font-black text-gray-900">{cycles.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled</p>
                            <p className="text-2xl sm:text-3xl font-black text-amber-500">
                                {cycles.filter((c) => c.status === "scheduled").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active</p>
                            <p className="text-2xl sm:text-3xl font-black text-green-500">
                                {cycles.filter((c) => c.status === "active").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Processing</p>
                            <p className="text-2xl sm:text-3xl font-black text-indigo-500">
                                {cycles.filter((c) => c.status === "processing").length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm col-span-2 md:col-span-1">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Completed</p>
                            <p className="text-2xl sm:text-3xl font-black text-blue-500">
                                {cycles.filter((c) => c.status === "completed").length}
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
                                className="px-4 py-2 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none transition-all"
                            >
                                <option value="all">All Cycles</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="active">Active</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            Showing {filteredCycles.length} of {cycles.length} cycles
                        </span>
                    </div>
                </div>

                {/* Cycles List */}
                <div className="space-y-6">
                    {filteredCycles.map((cycle) => (
                        <div key={cycle._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-gray-50 bg-white/50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{cycle.cycleId}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(cycle.status)}`}>
                                                {cycle.status}
                                            </span>
                                            {cycle.performanceRating && (
                                                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                                                    {cycle.performanceRating}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-tight">
                                            <span className="flex items-center gap-1.5"><span className="text-lg opacity-50">#</span> GDC-{cycle.gdcNumber}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{cycle.tpiaCount} TPIAs Joined</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-3">
                                        {cycle.status === "active" && (
                                            <button
                                                onClick={() => handleCompleteCycle(cycle._id)}
                                                disabled={processingCycle === cycle._id}
                                                className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 text-xs font-black uppercase tracking-widest active:scale-95 whitespace-nowrap"
                                            >
                                                {processingCycle === cycle._id ? "Processing..." : "Complete Cycle"}
                                            </button>
                                        )}
                                        {cycle.status === "processing" && !cycle.profitDistributed && (
                                            <button
                                                onClick={() => handleDistributeProfits(cycle._id)}
                                                disabled={processingCycle === cycle._id}
                                                className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-100 disabled:opacity-50 text-xs font-black uppercase tracking-widest active:scale-95 whitespace-nowrap"
                                            >
                                                {processingCycle === cycle._id ? "Distributing..." : "Distribute Profits"}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => router.push(`/admin/gdip/gdc/placeholder-id`)} // This would ideally link to GDC details
                                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                                            title="View Cluster Details"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 bg-gray-50/30">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="text-sm">📅</span> Cycle Period
                                        </p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-700 leading-snug">
                                            {formatDate(cycle.startDate)}<br className="md:hidden" />
                                            <span className="mx-1 text-gray-300 hidden md:inline">→</span>
                                            <span className="md:hidden block text-[10px] text-gray-300">to</span>
                                            {formatDate(cycle.endDate)}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="text-sm">💰</span> Total Capital
                                        </p>
                                        <p className="text-sm sm:text-base font-black text-gray-900">{formatCurrency(cycle.totalCapital)}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="text-sm">🎯</span> Target ROI
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm sm:text-base font-black text-gray-900">{cycle.targetProfitRate}%</span>
                                            <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] text-gray-500 rounded font-bold">EST</span>
                                        </div>
                                    </div>

                                    {cycle.status === "completed" ? (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-green-600/60 uppercase tracking-widest flex items-center gap-1.5">
                                                <span className="text-sm">📈</span> Actual ROI
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm sm:text-base font-black text-green-600">{cycle.actualProfitRate.toFixed(2)}%</p>
                                                <span className="px-1.5 py-0.5 bg-green-50 text-[10px] text-green-600 rounded font-bold animate-pulse">FIXED</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5 bg-blue-50/50 p-2 rounded-xl border border-blue-50">
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Est. Profit Gap</p>
                                            <p className="text-xs font-bold text-blue-600">Pending Close</p>
                                        </div>
                                    )}
                                </div>

                                {cycle.status === "completed" && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-2xl border border-green-50">
                                            <span className="text-xs font-bold text-green-700/70 uppercase">Total Profit Generated</span>
                                            <span className="text-lg font-black text-green-600">{formatCurrency(cycle.totalProfitGenerated)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Profit Status</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${cycle.profitDistributed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700 animate-pulse"}`}>
                                                {cycle.profitDistributed ? "✓ Distributed" : "⏳ Pending"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
