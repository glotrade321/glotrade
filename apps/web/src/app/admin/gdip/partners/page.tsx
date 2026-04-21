"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost } from "@/utils/api";
import { formatCurrency } from "@/utils/format";
import Modal from "@/components/common/Modal";

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

interface PartnerSearchResult {
    _id: string;
    username: string;
    name: string;
    email: string;
    phone?: string;
    isBlocked?: boolean;
    kycStatus?: string;
}

interface AssignmentPreview {
    gdcNumber: number;
    positionInGDC: number;
    tpiaNumber: number;
}

interface CreatedTPIA {
    _id: string;
    tpiaId: string;
    gdcNumber: number;
    positionInGDC: number;
}

export default function AdminPartnersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
    const [kycFilter, setKycFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showManualPurchaseModal, setShowManualPurchaseModal] = useState(false);
    const [partnerSearch, setPartnerSearch] = useState("");
    const [partnerSearchResults, setPartnerSearchResults] = useState<PartnerSearchResult[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<PartnerSearchResult | null>(null);
    const [manualProfitMode, setManualProfitMode] = useState<"TPM" | "EPS">("TPM");
    const [manualQuantity, setManualQuantity] = useState(1);
    const [manualAmount, setManualAmount] = useState("1000000");
    const [manualBankReference, setManualBankReference] = useState("");
    const [manualDepositDate, setManualDepositDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [manualNote, setManualNote] = useState("");
    const [assignmentPreview, setAssignmentPreview] = useState<AssignmentPreview[]>([]);
    const [createdTPIAs, setCreatedTPIAs] = useState<CreatedTPIA[]>([]);
    const [manualError, setManualError] = useState("");
    const [manualSubmitting, setManualSubmitting] = useState(false);

    const TPIA_PRICE = 1000000;

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("createTPIA") === "1") {
            setShowManualPurchaseModal(true);
        }
    }, []);

    useEffect(() => {
        filterPartners();
    }, [kycFilter, searchTerm, partners]);

    useEffect(() => {
        setManualAmount(String(manualQuantity * TPIA_PRICE));
    }, [manualQuantity]);

    useEffect(() => {
        if (!showManualPurchaseModal) {
            return;
        }

        fetchAssignmentPreview(manualQuantity);
    }, [showManualPurchaseModal, manualQuantity]);

    useEffect(() => {
        if (!showManualPurchaseModal || partnerSearch.trim().length < 2) {
            setPartnerSearchResults([]);
            return;
        }

        const timeout = window.setTimeout(() => {
            searchPartners(partnerSearch);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [partnerSearch, showManualPurchaseModal]);

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

    const searchPartners = async (query: string) => {
        try {
            const response = await apiGet<{ success: boolean; data: PartnerSearchResult[] }>("/api/v1/gdip/admin/partners/search", {
                query: { query, limit: 8 }
            });
            if (response.success) {
                setPartnerSearchResults(response.data || []);
            }
        } catch (err) {
            console.error("Error searching partners:", err);
        }
    };

    const fetchAssignmentPreview = async (quantity: number) => {
        try {
            const response = await apiGet<{ success: boolean; data: AssignmentPreview[] }>("/api/v1/gdip/admin/tpia/manual-purchase/preview", {
                query: { quantity }
            });
            if (response.success) {
                setAssignmentPreview(response.data || []);
            }
        } catch (err) {
            console.error("Error previewing assignment:", err);
            setAssignmentPreview([]);
        }
    };

    const resetManualPurchaseForm = () => {
        setPartnerSearch("");
        setPartnerSearchResults([]);
        setSelectedPartner(null);
        setManualProfitMode("TPM");
        setManualQuantity(1);
        setManualAmount(String(TPIA_PRICE));
        setManualBankReference("");
        setManualDepositDate(new Date().toISOString().split("T")[0]);
        setManualNote("");
        setAssignmentPreview([]);
        setCreatedTPIAs([]);
        setManualError("");
    };

    const closeManualPurchaseModal = () => {
        if (manualSubmitting) return;
        setShowManualPurchaseModal(false);
        resetManualPurchaseForm();
        const params = new URLSearchParams(window.location.search);
        if (params.get("createTPIA") === "1") {
            router.replace("/admin/gdip/partners");
        }
    };

    const handleManualPurchase = async () => {
        const expectedAmount = manualQuantity * TPIA_PRICE;

        if (!selectedPartner) {
            setManualError("Select the partner who made the bank deposit.");
            return;
        }

        if (!manualBankReference.trim()) {
            setManualError("Enter the bank deposit reference.");
            return;
        }

        if (Number(manualAmount) !== expectedAmount) {
            setManualError(`Amount received must be ${formatCurrency(expectedAmount)} for ${manualQuantity} TPIA block${manualQuantity > 1 ? "s" : ""}.`);
            return;
        }

        try {
            setManualSubmitting(true);
            setManualError("");
            const response = await apiPost<{ success: boolean; data: CreatedTPIA[] }>("/api/v1/gdip/admin/tpia/manual-purchase", {
                partnerId: selectedPartner._id,
                profitMode: manualProfitMode,
                quantity: manualQuantity,
                amountReceived: Number(manualAmount),
                bankReference: manualBankReference.trim(),
                depositedAt: manualDepositDate,
                note: manualNote.trim() || undefined
            });

            setCreatedTPIAs(Array.isArray(response.data) ? response.data : []);
            fetchPartners();
        } catch (err: any) {
            setManualError(err.message || "Failed to create manual TPIA purchase.");
        } finally {
            setManualSubmitting(false);
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
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">GDIP Partners</h1>
                            <p className="text-gray-600">Manage and verify Trusted Insured Partners</p>
                        </div>
                        <button
                            onClick={() => setShowManualPurchaseModal(true)}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            Create TPIA
                        </button>
                    </div>
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

                <Modal
                    open={showManualPurchaseModal}
                    onClose={closeManualPurchaseModal}
                    size="lg"
                    title="Create Manual TPIA Purchase"
                    footer={
                        createdTPIAs.length > 0 ? (
                            <button
                                type="button"
                                onClick={closeManualPurchaseModal}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Done
                            </button>
                        ) : (
                            <>
                            <button
                                type="button"
                                onClick={closeManualPurchaseModal}
                                disabled={manualSubmitting}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleManualPurchase}
                                disabled={manualSubmitting || Boolean(selectedPartner?.isBlocked)}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {manualSubmitting ? "Creating..." : "Create Purchase"}
                            </button>
                            </>
                        )
                    }
                >
                    <div className="space-y-5 p-2">
                        {createdTPIAs.length > 0 ? (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
                                <h3 className="text-base font-bold text-emerald-950">Manual TPIA purchase created</h3>
                                <p className="mt-1 text-sm text-emerald-800">
                                    These TPIA blocks were assigned to their GDC slots. The partner can now see them in their GDIP dashboard.
                                </p>
                                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {createdTPIAs.map((tpia) => (
                                        <div key={tpia._id} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm">
                                            <p className="font-semibold text-emerald-950">{tpia.tpiaId}</p>
                                            <p className="text-xs text-emerald-700">GDC-{tpia.gdcNumber}, slot {tpia.positionInGDC}/10</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                            Use this only after Finance has confirmed the partner's bank deposit. The partner's wallet will not be credited; the TPIA will be assigned directly into the next forming GDC.
                        </div>

                        {assignmentPreview.length > 0 && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-bold text-gray-900">Expected GDC Assignment</h3>
                                    <span className="text-xs font-medium text-gray-500">Final assignment is confirmed on submit</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {assignmentPreview.map((assignment) => (
                                        <div key={`${assignment.gdcNumber}-${assignment.positionInGDC}-${assignment.tpiaNumber}`} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                                            <p className="font-semibold text-gray-900">TPIA-{assignment.tpiaNumber}</p>
                                            <p className="text-xs text-gray-500">GDC-{assignment.gdcNumber}, slot {assignment.positionInGDC}/10</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {manualError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
                                {manualError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Partner</label>
                            <input
                                value={selectedPartner ? `${selectedPartner.name} (${selectedPartner.email})` : partnerSearch}
                                onChange={(event) => {
                                    setSelectedPartner(null);
                                    setPartnerSearch(event.target.value);
                                }}
                                placeholder="Search by name, email, phone, or username"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {!selectedPartner && partnerSearchResults.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                                    {partnerSearchResults.map((partner) => (
                                        <button
                                            key={partner._id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPartner(partner);
                                                setPartnerSearchResults([]);
                                            }}
                                            className="block w-full border-b border-gray-100 px-4 py-3 text-left text-sm hover:bg-gray-50 last:border-b-0"
                                        >
                                            <span className="block font-semibold text-gray-900">{partner.name}</span>
                                            <span className="block text-xs text-gray-500">{partner.email}{partner.phone ? ` • ${partner.phone}` : ""}</span>
                                            {partner.isBlocked && <span className="mt-1 block text-xs font-semibold text-red-600">Blocked account</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedPartner?.isBlocked && (
                                <p className="mt-2 text-xs font-semibold text-red-600">This partner is blocked. Unblock the account before creating a manual purchase.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <p className="text-sm font-semibold text-emerald-950">Trade Deployment</p>
                                <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                                    Assigned automatically by Glotrade based on active deployment needs.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Profit Mode</label>
                                <select
                                    value={manualProfitMode}
                                    onChange={(event) => setManualProfitMode(event.target.value as "TPM" | "EPS")}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="TPM">TPM - Compound returns</option>
                                    <option value="EPS">EPS - Wallet profit payout</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Quantity</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={manualQuantity}
                                    onChange={(event) => setManualQuantity(Math.min(10, Math.max(1, Number(event.target.value) || 1)))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Amount Received</label>
                                <input
                                    type="number"
                                    min={TPIA_PRICE}
                                    step={TPIA_PRICE}
                                    value={manualAmount}
                                    onChange={(event) => setManualAmount(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">Expected total: {formatCurrency(manualQuantity * TPIA_PRICE)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Bank Deposit Reference</label>
                                <input
                                    value={manualBankReference}
                                    onChange={(event) => setManualBankReference(event.target.value)}
                                    placeholder="Bank teller, narration, or transfer reference"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Deposit Date</label>
                                <input
                                    type="date"
                                    value={manualDepositDate}
                                    onChange={(event) => setManualDepositDate(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Internal Note</label>
                            <textarea
                                value={manualNote}
                                onChange={(event) => setManualNote(event.target.value)}
                                rows={3}
                                placeholder="Optional finance or support note"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                            </>
                        )}
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    );
}
