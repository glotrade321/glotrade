"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Save, Trash2, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/utils/api";

interface CommodityType {
    _id: string;
    name: string;
    label: string;
    icon: string;
    isActive: boolean;
}

export default function AdminCommoditiesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [commodities, setCommodities] = useState<CommodityType[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCommodity, setEditingCommodity] = useState<CommodityType | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        label: "",
        icon: "🌾",
        isActive: true
    });

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commodityToDelete, setCommodityToDelete] = useState<CommodityType | null>(null);

    // Status Toggle Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [commodityForStatusToggle, setCommodityForStatusToggle] = useState<CommodityType | null>(null);

    // Edit Confirmation State
    const [isEditConfirmModalOpen, setIsEditConfirmModalOpen] = useState(false);

    useEffect(() => {
        fetchCommodities();
    }, []);

    const fetchCommodities = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: CommodityType[] }>("/api/v1/gdip/commodities/types");
            if (response.success) {
                setCommodities(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching trade deployment categories:", err);
            setError("Failed to load trade deployment categories");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (commodity?: CommodityType) => {
        if (commodity) {
            setEditingCommodity(commodity);
            setFormData({
                name: commodity.name,
                label: commodity.label,
                icon: commodity.icon,
                isActive: commodity.isActive
            });
        } else {
            setEditingCommodity(null);
            setFormData({
                name: "",
                label: "",
                icon: "🌾",
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCommodity) {
            setIsEditConfirmModalOpen(true);
        } else {
            executeSave();
        }
    };

    const executeSave = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (editingCommodity) {
                await apiPatch(`/api/v1/gdip/admin/commodities/types/${editingCommodity._id}`, formData);
                setSuccess("Trade deployment category updated successfully");
            } else {
                await apiPost("/api/v1/gdip/admin/commodities/types", formData);
                setSuccess("Trade deployment category created successfully");
            }

            setIsModalOpen(false);
            setIsEditConfirmModalOpen(false);
            fetchCommodities();
        } catch (err: any) {
            setError(err.message || "Failed to save trade deployment category");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatusClick = (commodity: CommodityType) => {
        setCommodityForStatusToggle(commodity);
        setIsStatusModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!commodityForStatusToggle) return;

        try {
            setSaving(true);
            const newStatus = !commodityForStatusToggle.isActive;
            await apiPatch(`/api/v1/gdip/admin/commodities/types/${commodityForStatusToggle._id}`, { isActive: newStatus });
            setCommodities(prev => prev.map(c =>
                c._id === commodityForStatusToggle._id ? { ...c, isActive: newStatus } : c
            ));
            setSuccess(`Trade deployment category ${newStatus ? "enabled" : "disabled"} successfully`);
            setIsStatusModalOpen(false);
            setCommodityForStatusToggle(null);
        } catch (err: any) {
            setError("Failed to toggle status");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (commodity: CommodityType) => {
        setCommodityToDelete(commodity);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!commodityToDelete) return;

        try {
            setSaving(true);
            await apiDelete(`/api/v1/gdip/admin/commodities/types/${commodityToDelete._id}`);
            setCommodities(prev => prev.filter(c => c._id !== commodityToDelete._id));
            setSuccess("Trade deployment category deleted successfully");
            setIsDeleteModalOpen(false);
            setCommodityToDelete(null);
        } catch (err: any) {
            setError("Failed to delete trade deployment category");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.push("/admin/gdip")}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to GDIP Admin
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Trade Deployment Categories</h1>
                        <p className="text-gray-600">Internal operations catalog for offline GDIP trade deployment. Partners and manual purchase admins do not choose these during TPIA purchase.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm font-bold text-sm sm:text-base whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Category</span><span className="sm:hidden">Add</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                        <XCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        {success}
                    </div>
                )}

                {/* Commodities List - Desktop */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hidden md:block">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h2 className="font-bold text-gray-900">Internal Trade Deployment Categories</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Icon</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Label</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center mb-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                            Loading trade deployment categories...
                                        </td>
                                    </tr>
                                ) : commodities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                            No trade deployment categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    commodities.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-3xl bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center">
                                                    {item.icon}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{item.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.label}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Save className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatusClick(item)}
                                                    className={`p-2 rounded-lg transition-all ${item.isActive
                                                        ? "text-orange-600 hover:bg-orange-50"
                                                        : "text-green-600 hover:bg-green-50"
                                                        }`}
                                                    title={item.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {item.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Commodities List - Mobile */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : commodities.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 italic">
                            No trade deployment categories found.
                        </div>
                    ) : (
                        commodities.map((item) => (
                            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.label}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}>
                                        {item.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold"
                                    >
                                        <Save className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => toggleStatusClick(item)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold ${item.isActive
                                            ? "bg-orange-50 text-orange-600"
                                            : "bg-green-50 text-green-600"
                                            }`}
                                    >
                                        {item.isActive ? <><XCircle className="w-4 h-4" /> Disable</> : <><CheckCircle className="w-4 h-4" /> Enable</>}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(item)}
                                        className="p-2 text-red-600 bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingCommodity ? "Edit Trade Category" : "Add Trade Category"}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Warning Section in Edit Modal */}
                            <div className="bg-blue-50/50 border-b border-blue-100 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-900 mb-0.5">Configuration Note</p>
                                        <p className="text-[10px] text-blue-700 leading-relaxed">
                                            {editingCommodity
                                                ? "Updating this category changes internal operational labels used for GDIP deployment records."
                                                : "New categories are for internal offline trade planning only. They are not shown as partner purchase choices."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Internal Name (ID)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Rice"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Internal Display Label</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Premium White Rice"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. 🌾"
                                    />
                                </div>
                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Active for internal deployment planning</label>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Category"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && commodityToDelete && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Trade Category?</h3>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete <span className="font-bold text-gray-900">{commodityToDelete.label}</span> ({commodityToDelete.icon})?
                                    This action cannot be undone.
                                </p>

                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
                                    <h4 className="text-amber-800 font-bold text-sm mb-1 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        Important Note
                                    </h4>
                                    <p className="text-amber-700 text-xs">
                                        Deleting this category removes it from internal deployment planning lists. Existing TPIAs and historic cycles will not be affected.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setIsDeleteModalOpen(false);
                                            setCommodityToDelete(null);
                                        }}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Deleting...
                                            </>
                                        ) : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Toggle Modal */}
                {isStatusModalOpen && commodityForStatusToggle && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 text-center">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${commodityForStatusToggle.isActive ? "bg-orange-50" : "bg-green-50"
                                    }`}>
                                    {commodityForStatusToggle.isActive ? (
                                        <XCircle className="w-10 h-10 text-orange-500" />
                                    ) : (
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {commodityForStatusToggle.isActive ? "Disable Category?" : "Enable Category?"}
                                </h3>
                                <p className="text-gray-600 mb-6 font-medium text-sm">
                                    {commodityForStatusToggle.isActive
                                        ? `${commodityForStatusToggle.label} will no longer be active for internal deployment planning.`
                                        : `${commodityForStatusToggle.label} will be active for internal deployment planning.`
                                    }
                                </p>

                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8 text-left">
                                    <h4 className="text-gray-900 font-bold text-sm mb-1">Impact Analysis</h4>
                                    <ul className="text-gray-600 text-[11px] space-y-1.5 list-disc ml-4">
                                        {commodityForStatusToggle.isActive ? (
                                            <>
                                                <li>Hides from internal deployment planning lists</li>
                                                <li>Existing active investments will remain active</li>
                                                <li>Historical data remains visible in reports</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Available for internal deployment planning</li>
                                                <li>Not exposed as a partner purchase choice</li>
                                                <li>Ready for operational reporting and cycle records</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setIsStatusModalOpen(false);
                                            setCommodityForStatusToggle(null);
                                        }}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmToggleStatus}
                                        disabled={saving}
                                        className={`flex-1 px-6 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${commodityForStatusToggle.isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
                                            }`}
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            commodityForStatusToggle.isActive ? "Disable" : "Enable"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Confirmation Modal */}
                {isEditConfirmModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 text-center">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Save className="w-10 h-10 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Save Changes?</h3>
                                <p className="text-gray-600 mb-8">
                                    You are about to update <span className="font-bold text-gray-900">{formData.label}</span>.
                                    These changes will be reflected across the platform immediately.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditConfirmModalOpen(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all font-bold"
                                    >
                                        Review
                                    </button>
                                    <button
                                        onClick={executeSave}
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Saving...
                                            </>
                                        ) : "Confirm Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        Admin Tip
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                        These categories are for Glotrade operations only. They help internal teams classify offline trade deployment and cycle records, but partners and manual purchase admins do not select them when creating a TPIA.
                        Deactivating a category removes it from future internal planning without changing existing investments.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
