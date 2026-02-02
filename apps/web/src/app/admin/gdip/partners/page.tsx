"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet } from "@/utils/api";
import { formatCurrency } from "@/utils/format";

interface Partner {
    _id: string;
    userId: string;
    name: string;
    email: string;
    businessType: string;
    kycVerified: boolean;
    accountStatus: string;
    totalTPIAs: number;
    totalInvested: number;
    totalProfit: number;
    joinedDate: string;
}

export default function AdminPartnersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
    const [kycFilter, setKycFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        filterPartners();
    }, [kycFilter, searchTerm, partners]);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: any[] }>("/api/v1/gdip/admin/tpias");

            if (response.success) {
                // Group TPIAs by partner
                const tpias = response.data;
                const partnerMap = new Map();

                tpias.forEach((tpia: any) => {
                    const partnerId = tpia.partnerId;
                    if (!partnerMap.has(partnerId)) {
                        partnerMap.set(partnerId, {
                            _id: partnerId,
                            userId: partnerId,
                            name: tpia.partnerName,
                            email: tpia.partnerEmail,
                            businessType: "Distributor", // Default
                            kycVerified: true, // Assume verified if they have TPIAs
                            accountStatus: "active",
                            totalTPIAs: 0,
                            totalInvested: 0,
                            totalProfit: 0,
                            joinedDate: tpia.purchasedAt,
                        });
                    }

                    const partner = partnerMap.get(partnerId);
                    partner.totalTPIAs += 1;
                    partner.totalInvested += tpia.purchasePrice;
                    partner.totalProfit += tpia.totalProfitEarned;
                });

                setPartners(Array.from(partnerMap.values()));
                setFilteredPartners(Array.from(partnerMap.values()));
            }
        } catch (err: any) {
            console.error("Error fetching partners:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterPartners = () => {
        let filtered = partners;

        // Filter by KYC status
        if (kycFilter === "verified") {
            filtered = filtered.filter((p) => p.kycVerified);
        } else if (kycFilter === "unverified") {
            filtered = filtered.filter((p) => !p.kycVerified);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPartners(filtered);
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
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">GDIP Partners</h1>
                    <p className="text-gray-600">Manage and verify Trusted Insured Partners</p>
                </div>

                {/* Stats */}
                {partners.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Partners</p>
                            <p className="text-3xl font-bold text-gray-900">{partners.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">KYC Verified</p>
                            <p className="text-3xl font-bold text-green-600">
                                {partners.filter((p) => p.kycVerified).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(partners.reduce((sum, p) => sum + p.totalInvested, 0))}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(partners.reduce((sum, p) => sum + p.totalProfit, 0))}
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={kycFilter}
                            onChange={(e) => setKycFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Partners</option>
                            <option value="verified">KYC Verified</option>
                            <option value="unverified">KYC Pending</option>
                        </select>
                        <span className="text-sm text-gray-600 flex items-center">
                            Showing {filteredPartners.length} of {partners.length}
                        </span>
                    </div>
                </div>

                {/* Partners Table - Desktop */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hidden md:block">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Partner
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    KYC Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    TPIAs
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Invested
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Profit
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPartners.map((partner) => (
                                <tr key={partner._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{partner.name}</p>
                                            <p className="text-sm text-gray-500">{partner.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${partner.kycVerified
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {partner.kycVerified ? "✓ Verified" : "⏳ Pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">{partner.totalTPIAs}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">{formatCurrency(partner.totalInvested)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-green-600">{formatCurrency(partner.totalProfit)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{formatDate(partner.joinedDate)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredPartners.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No partners found</p>
                        </div>
                    )}
                </div>

                {/* Partners List - Mobile */}
                <div className="md:hidden space-y-4">
                    {filteredPartners.map((partner) => (
                        <div key={partner._id} className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{partner.name}</p>
                                    <p className="text-sm text-gray-500">{partner.email}</p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${partner.kycVerified
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {partner.kycVerified ? "✓ Verified" : "⏳ Pending"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Invested</p>
                                    <p className="font-bold text-gray-900">{formatCurrency(partner.totalInvested)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Profit</p>
                                    <p className="font-bold text-green-600">{formatCurrency(partner.totalProfit)}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div>
                                    <span className="text-gray-500 mr-2">TPIAs:</span>
                                    <span className="font-medium text-gray-900">{partner.totalTPIAs}</span>
                                </div>
                                <div className="text-gray-500">
                                    Joined {formatDate(partner.joinedDate)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredPartners.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                            <p className="text-gray-500">No partners found</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
