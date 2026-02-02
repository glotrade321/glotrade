"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/utils/api";
import { formatCurrency } from "@/utils/format";
import TPIADetailsModal from "@/components/admin/gdip/TPIADetailsModal";

interface TPIA {
    _id: string;
    tpiaId: string;
    partnerName: string;
    partnerEmail: string;
    purchasePrice: number;
    currentValue: number;
    status: string;
    gdcNumber: number;
    purchasedAt: string;
    profitMode: string;
    estimatedProfit?: number;
}

export default function AdminTPIAManagementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tpias, setTPIAs] = useState<TPIA[]>([]);
    const [filteredTPIAs, setFilteredTPIAs] = useState<TPIA[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTPIAId, setSelectedTPIAId] = useState<string | null>(null);

    useEffect(() => {
        fetchTPIAs();
    }, []);

    useEffect(() => {
        filterTPIAs();
    }, [statusFilter, searchTerm, tpias]);

    const fetchTPIAs = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: any[] }>("/api/v1/gdip/admin/tpias");

            if (response.success) {
                // Sort by newest
                const sorted = response.data.sort((a, b) =>
                    new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
                );
                setTPIAs(sorted);
                setFilteredTPIAs(sorted);
            }
        } catch (err: any) {
            console.error("Error fetching TPIAs:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterTPIAs = () => {
        let filtered = tpias;

        if (statusFilter !== "all") {
            filtered = filtered.filter((t) => t.status === statusFilter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.tpiaId.toLowerCase().includes(lowerTerm) ||
                    t.partnerName.toLowerCase().includes(lowerTerm) ||
                    t.partnerEmail.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredTPIAs(filtered);
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">TPIA Management</h1>
                            <p className="text-gray-600">Overview of all Insured Partner Investment Blocks</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search ID, partner name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="matured">Matured</option>
                        </select>
                        <span className="text-sm text-gray-600 flex items-center">
                            Showing {filteredTPIAs.length} of {tpias.length}
                        </span>
                    </div>
                </div>

                {/* TPIA Table - Desktop */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hidden md:block">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TPIA ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Profit</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GDC</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTPIAs.map((tpia) => (
                                <tr key={tpia._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{tpia.tpiaId}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{tpia.partnerName}</p>
                                            <p className="text-xs text-gray-500">{tpia.partnerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(tpia.purchasePrice)}</td>
                                    <td className="px-6 py-4 font-medium text-green-600">+{formatCurrency(tpia.estimatedProfit || 0)}</td>
                                    <td className="px-6 py-4 text-gray-600">GDC-{tpia.gdcNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tpia.status === "active" ? "bg-green-100 text-green-700" :
                                            tpia.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-gray-100 text-gray-700"
                                            }`}>
                                            {tpia.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{formatDate(tpia.purchasedAt)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedTPIAId(tpia._id)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTPIAs.length === 0 && (
                        <div className="text-center py-12 text-gray-500">No TPIAs found matching your filters.</div>
                    )}
                </div>

                {/* TPIA List - Mobile */}
                <div className="md:hidden space-y-4">
                    {filteredTPIAs.map((tpia) => (
                        <div key={tpia._id} className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{tpia.tpiaId}</p>
                                    <p className="text-sm text-gray-500">{tpia.partnerName}</p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tpia.status === "active" ? "bg-green-100 text-green-700" :
                                    tpia.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                        "bg-gray-100 text-gray-700"
                                    }`}>
                                    {tpia.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Invested</p>
                                    <p className="font-bold text-gray-900">{formatCurrency(tpia.purchasePrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Est. Profit</p>
                                    <p className="font-bold text-green-600">+{formatCurrency(tpia.estimatedProfit || 0)}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">GDC-{tpia.gdcNumber}</span> • {formatDate(tpia.purchasedAt)}
                                </div>
                                <button
                                    onClick={() => setSelectedTPIAId(tpia._id)}
                                    className="text-blue-600 font-bold text-sm"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredTPIAs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                            <p className="text-gray-500">No TPIAs found matching your filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedTPIAId && (
                <TPIADetailsModal
                    tpiaId={selectedTPIAId}
                    onClose={() => setSelectedTPIAId(null)}
                />
            )}
        </AdminLayout>
    );
}
